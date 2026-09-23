import "server-only";
import { prisma } from "@/lib/prisma";
import { getProfile } from "@/lib/data";
import { primaryRole } from "@/lib/text";

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

export async function buildCv(opts: CvOptions): Promise<CvData> {
  const L = LABELS[opts.lang];
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

  const sections: CvData["sections"] = [];
  for (const key of opts.sections) {
    if (key === "summary") {
      const text = clean(opts.summary) || clean(p.bio.replace(/\n\s*\n/g, " ")) || clean(p.tagline);
      if (text) sections.push({ key, label: L.summary, text });
    }
    if (key === "experience" && experiences.length) {
      sections.push({
        key, label: L.experience,
        items: experiences.map((e) => ({
          heading: clean(e.role),
          sub: [clean(e.company), clean(e.location), clean(e.type)].filter(Boolean).join(" | "),
          meta: `${clean(e.startDate)} – ${e.current ? L.present : clean(e.endDate) || L.present}`,
          bullets: bullets(e.description),
        })),
      });
    }
    if (key === "education" && education.length) {
      sections.push({
        key, label: L.education,
        items: education.map((ed) => ({
          heading: clean(ed.school),
          sub: [clean(ed.degree), clean(ed.field)].filter(Boolean).join(" "),
          meta: `${clean(ed.startDate)} – ${clean(ed.endDate) || L.present}`,
          bullets: bullets(ed.description),
        })),
      });
    }
    if (key === "skills" && skills.length) {
      const groups = new Map<string, string[]>();
      for (const s of skills) groups.set(clean(s.category), [...(groups.get(clean(s.category)) ?? []), clean(s.name)]);
      sections.push({ key, label: L.skills, lines: [...groups].map(([cat, names]) => `${cat}: ${names.join(", ")}`) });
    }
    if (key === "projects") {
      const list = opts.projectIds ? projects.filter((x) => opts.projectIds!.includes(x.id)) : projects.slice(0, 4);
      if (list.length)
        sections.push({
          key, label: L.projects,
          items: list.map((x) => ({
            heading: clean(x.title),
            sub: [clean(x.category), x.tags.length ? `${L.tech}: ${x.tags.map(clean).join(", ")}` : ""].filter(Boolean).join(" | "),
            meta: clean(x.year),
            bullets: [clean(x.summary), x.liveUrl || x.repoUrl ? `${L.link}: ${stripUrl(x.liveUrl || x.repoUrl)}` : ""].filter(Boolean),
          })),
        });
    }
    if (key === "certificates") {
      const list = opts.certificateIds ? certificates.filter((c) => opts.certificateIds!.includes(c.id)) : certificates;
      if (list.length)
        sections.push({ key, label: L.certificates, lines: list.map((c) => [clean(c.title), clean(c.issuer), clean(c.date)].filter(Boolean).join(" – ")) });
    }
  }

  return { name: clean(p.name), title: clean(opts.title) || clean(primaryRole(p.headline)), contacts, lang: opts.lang, sections };
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
