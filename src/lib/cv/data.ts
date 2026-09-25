import "server-only";
import { prisma } from "@/lib/prisma";
import { getProfile } from "@/lib/data";
import { primaryRole } from "@/lib/text";
import { translateMany, type TranslationRow } from "@/lib/translate";

export type CvLang = "id" | "en";
export type CvSection = "summary" | "experience" | "education" | "skills" | "projects" | "certificates";
export const ALL_SECTIONS: CvSection[] = ["summary", "experience", "education", "skills", "projects", "certificates"];

export type CvOptions = {
  lang: CvLang;
  sections: CvSection[];
  title?: string;          // target posisi (default: headline pertama)
  summary?: string;        // ringkasan (default: bio)
  projectIds?: number[];   // proyek yang dimasukkan (default: semua yang dipublikasikan, maks 4)
  certificateIds?: number[];
  portfolioUrl?: string;
};

export const LABELS: Record<CvLang, Record<CvSection | "present" | "tech" | "link", string>> = {
  id: { summary: "Ringkasan Profesional", experience: "Pengalaman Kerja", education: "Pendidikan", skills: "Keahlian", projects: "Proyek", certificates: "Sertifikasi", present: "Sekarang", tech: "Teknologi", link: "Tautan" },
  en: { summary: "Professional Summary", experience: "Work Experience", education: "Education", skills: "Skills", projects: "Projects", certificates: "Certifications", present: "Present", tech: "Tech", link: "Link" },
};

export type CvItem = { heading: string; sub?: string; meta?: string; bullets: string[] };
export type CvData = {
  name: string;
  title: string;
  contacts: string[];
  lang: CvLang;
  sections: { key: CvSection; label: string; text?: string; items?: CvItem[]; lines?: string[] }[];
};

/** Bersihkan teks: hapus emoji/karakter yang tidak didukung font standar PDF (ATS-safe). */
export function clean(s?: string | null) {
  if (!s) return "";
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\u0000-ɏ–—•… ]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}
const bullets = (s?: string | null) =>
  clean(s).split(/\n+/).map((l) => l.replace(/^[-•*▹]\s*/, "").trim()).filter(Boolean);
const stripUrl = (u?: string | null) => clean(u).replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");

// ---------- Kamus tetap (tanpa mesin terjemah) ----------
const MONTHS: [RegExp, string][] = [
  [/\bjanuari\b/gi, "Jan"], [/\bfebruari\b/gi, "Feb"], [/\bmaret\b/gi, "Mar"], [/\bapril\b/gi, "Apr"],
  [/\bmei\b/gi, "May"], [/\bjuni\b/gi, "Jun"], [/\bjuli\b/gi, "Jul"], [/\bagustus\b|\bagu\b|\bags\b|\bagt\b/gi, "Aug"],
  [/\bseptember\b/gi, "Sep"], [/\boktober\b|\bokt\b/gi, "Oct"], [/\bnovember\b/gi, "Nov"], [/\bdesember\b|\bdes\b/gi, "Dec"],
  [/\bsekarang\b|\bsaat ini\b/gi, "Present"],
];
const DEGREES: Record<string, string> = {
  s1: "Bachelor's Degree", s2: "Master's Degree", s3: "Doctoral Degree", d1: "Diploma (D1)", d2: "Diploma (D2)",
  d3: "Associate Degree (D3)", d4: "Bachelor of Applied Science (D4)", sma: "Senior High School", smk: "Vocational High School",
  ma: "Senior High School", smp: "Junior High School",
};
const JOB_TYPES: Record<string, string> = {
  kontrak: "Contract", organisasi: "Organization", magang: "Internship", "paruh waktu": "Part-time", "penuh waktu": "Full-time",
  "pekerja lepas": "Freelance", relawan: "Volunteer", sukarelawan: "Volunteer",
};
const dateEn = (s: string) => MONTHS.reduce((acc, [re, en]) => acc.replace(re, en), s);

type Tr = (s: string) => string;

export async function buildCv(opts: CvOptions): Promise<CvData> {
  return (await buildCvWithTranslations(opts)).data;
}

/**
 * Menyusun CV. Untuk bahasa Inggris, semua teks deskriptif diterjemahkan otomatis
 * (dengan cache + koreksi manual dari tabel Translation). Nama orang, perusahaan,
 * sekolah, proyek, sertifikat, teknologi & URL tidak diterjemahkan.
 */
export async function buildCvWithTranslations(opts: CvOptions) {
  const L = LABELS[opts.lang];
  const en = opts.lang === "en";
  const [p, experiences, education, skills, projects, certificates] = await Promise.all([
    getProfile(),
    prisma.experience.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
    prisma.education.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
    prisma.skill.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
    prisma.project.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }] }),
    prisma.certificate.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
  ]);

  const phone = p.phone ? `+${p.phone.replace(/\D/g, "")}` : "";
  const contacts = [p.location, p.email, phone, stripUrl(p.linkedin), stripUrl(p.github), stripUrl(opts.portfolioUrl || p.website)]
    .map(clean).filter(Boolean);
  const date = (s?: string | null) => (en ? dateEn(clean(s)) : clean(s));
  const degree = (s: string) => (en ? DEGREES[s.toLowerCase().replace(/[^a-z0-9]/g, "")] ?? null : null);
  const jobType = (s: string) => (en ? JOB_TYPES[s.toLowerCase()] ?? s : s);

  const build = (t: Tr) => {
    const sections: CvData["sections"] = [];
    for (const key of opts.sections) {
      if (key === "summary") {
        const text = clean(opts.summary) || clean(p.bio.replace(/\n\s*\n/g, " ")) || clean(p.tagline);
        if (text) sections.push({ key, label: L.summary, text: t(text) });
      }
      if (key === "experience" && experiences.length) {
        sections.push({
          key, label: L.experience,
          items: experiences.map((e) => ({
            heading: t(clean(e.role)),
            sub: [clean(e.company), clean(e.location), jobType(clean(e.type))].filter(Boolean).join(" | "),
            meta: `${date(e.startDate)} – ${e.current ? L.present : date(e.endDate) || L.present}`,
            bullets: bullets(e.description).map(t),
          })),
        });
      }
      if (key === "education" && education.length) {
        sections.push({
          key, label: L.education,
          items: education.map((ed) => {
            const deg = clean(ed.degree), field = clean(ed.field);
            const mapped = degree(deg);
            const sub = en
              ? mapped ? [mapped, field ? `in ${t(field)}` : ""].filter(Boolean).join(" ") : [t(deg), field && t(field)].filter(Boolean).join(", ")
              : [deg, field].filter(Boolean).join(" ");
            return {
              heading: clean(ed.school),
              sub,
              meta: `${date(ed.startDate)} – ${date(ed.endDate) || L.present}`,
              bullets: bullets(ed.description).map(t),
            };
          }),
        });
      }
      if (key === "skills" && skills.length) {
        const groups = new Map<string, string[]>();
        for (const s of skills) groups.set(clean(s.category), [...(groups.get(clean(s.category)) ?? []), clean(s.name)]);
        sections.push({ key, label: L.skills, lines: [...groups].map(([cat, names]) => `${t(cat)}: ${names.join(", ")}`) });
      }
      if (key === "projects") {
        const list = opts.projectIds ? projects.filter((x) => opts.projectIds!.includes(x.id)) : projects.slice(0, 4);
        if (list.length)
          sections.push({
            key, label: L.projects,
            items: list.map((x) => ({
              heading: clean(x.title),
              sub: [clean(x.category) && t(clean(x.category)), x.tags.length ? `${L.tech}: ${x.tags.map(clean).join(", ")}` : ""].filter(Boolean).join(" | "),
              meta: clean(x.year),
              bullets: [clean(x.summary) && t(clean(x.summary)), x.liveUrl || x.repoUrl ? `${L.link}: ${stripUrl(x.liveUrl || x.repoUrl)}` : ""].filter(Boolean),
            })),
          });
      }
      if (key === "certificates") {
        const list = opts.certificateIds ? certificates.filter((c) => opts.certificateIds!.includes(c.id)) : certificates;
        if (list.length)
          sections.push({ key, label: L.certificates, lines: list.map((c) => [clean(c.title), clean(c.issuer), date(c.date)].filter(Boolean).join(" – ")) });
      }
    }
    const title = clean(opts.title) || clean(primaryRole(p.headline));
    return { name: clean(p.name), title: t(title), contacts, lang: opts.lang, sections } satisfies CvData;
  };

  if (!en) return { data: build((s) => s), translations: [] as TranslationRow[], errors: [] as string[] };

  // 1) kumpulkan teks yang perlu diterjemahkan, 2) terjemahkan sekaligus, 3) susun ulang
  const wanted: string[] = [];
  build((s) => { if (s && /[a-z]/i.test(s)) wanted.push(s); return s; });
  const map = await translateMany(wanted, "en");
  const data = build((s) => map.get(s.trim())?.text ?? s);
  return { data, translations: [...map.values()], errors: map.errors ?? [] };
}

/** Baca & validasi opsi dari body request. */
export function parseOptions(body: unknown, origin?: string): CvOptions {
  const b = (body ?? {}) as Record<string, unknown>;
  const ids = (v: unknown) => (Array.isArray(v) ? v.map(Number).filter(Number.isInteger) : undefined);
  const sections = Array.isArray(b.sections) ? (b.sections as string[]).filter((s): s is CvSection => ALL_SECTIONS.includes(s as CvSection)) : ALL_SECTIONS;
  return {
    lang: b.lang === "en" ? "en" : "id",
    sections,
    title: typeof b.title === "string" ? b.title.slice(0, 120) : undefined,
    summary: typeof b.summary === "string" ? b.summary.slice(0, 1500) : undefined,
    projectIds: ids(b.projectIds),
    certificateIds: ids(b.certificateIds),
    portfolioUrl: typeof b.portfolioUrl === "string" ? b.portfolioUrl : origin,
  };
}

export const cvFileName = (name: string, ext: string) => `CV_${name.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "") || "Resume"}.${ext}`;

/** URL website (untuk dicantumkan di CV). Diabaikan jika masih localhost. */
export function siteOrigin(req: Request) {
  const origin = new URL(req.url).origin;
  return /localhost|127\.0\.0\.1/.test(origin) ? undefined : origin;
}
