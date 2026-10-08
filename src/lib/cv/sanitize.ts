import "server-only";
import { ALL_SECTIONS, clean, type CvData, type CvItem, type CvLang, type CvSection } from "./data";

const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown, max = 600) => (typeof v === "string" ? clean(v).slice(0, max) : "");
const opt = (v: unknown, max = 600) => str(v, max) || undefined;

/**
 * Validasi & bersihkan CV hasil edit di kanvas sebelum dijadikan PDF/DOCX
 * (batas panjang, hanya field yang dikenal, buang bullet kosong).
 */
export function sanitizeCvData(raw: unknown, lang: CvLang): CvData | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const sections = arr(r.sections).slice(0, 20).map((s) => {
    const sec = (s ?? {}) as Record<string, unknown>;
    const items: CvItem[] = arr(sec.items).slice(0, 40).map((i) => {
      const it = (i ?? {}) as Record<string, unknown>;
      return {
        heading: str(it.heading, 200),
        sub: opt(it.sub, 300),
        meta: opt(it.meta, 80),
        desc: opt(it.desc, 1200),
        bullets: arr(it.bullets).slice(0, 30).map((b) => str(b, 600)).filter(Boolean),
        note: opt(it.note, 300),
      };
    }).filter((it) => it.heading || it.desc || it.bullets.length);
    const key = ALL_SECTIONS.includes(sec.key as CvSection) ? (sec.key as CvSection) : "summary";
    return {
      key,
      label: str(sec.label, 80) || "—",
      text: opt(sec.text, 3000),
      lines: arr(sec.lines).slice(0, 40).map((l) => str(l, 400)).filter(Boolean),
      items,
    };
  });
  return {
    name: str(r.name, 120) || "—",
    title: str(r.title, 160),
    contacts: arr(r.contacts).slice(0, 10).map((c) => str(c, 160)).filter(Boolean),
    lang,
    sections,
  };
}
