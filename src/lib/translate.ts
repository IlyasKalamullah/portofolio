import "server-only";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Terjemahan otomatis (dipakai CV bahasa Inggris).
 * - Hasil disimpan di tabel Translation → cepat & konsisten, dan bisa dikoreksi manual di admin.
 * - Mesin: Gemini (jika GEMINI_API_KEY di-set, hasil lebih natural) atau Google Translate gratis.
 */

export type TranslationRow = { source: string; text: string; auto: boolean; failed?: boolean };

export const translationKey = (source: string, lang: string) => createHash("sha1").update(`${lang}:${source}`).digest("hex");

export function translationEngine() {
  return process.env.GEMINI_API_KEY ? "gemini" : "google";
}

/** Pesan error terakhir dari mesin terjemahan (ditampilkan di admin). */
export type TranslateResult = Map<string, TranslationRow> & { errors?: string[] };

export async function translateMany(texts: string[], lang = "en"): Promise<TranslateResult> {
  const unique = [...new Set(texts.map((t) => t.trim()).filter(Boolean))];
  const out: TranslateResult = new Map<string, TranslationRow>();
  const errors: string[] = [];
  out.errors = errors;
  if (!unique.length) return out;

  const keys = unique.map((s) => translationKey(s, lang));
  const cached = await prisma.translation.findMany({ where: { key: { in: keys } } });
  const byKey = new Map(cached.map((c) => [c.key, c]));
  const missing: string[] = [];
  unique.forEach((s, i) => {
    const hit = byKey.get(keys[i]);
    if (hit) out.set(s, { source: s, text: hit.text, auto: hit.auto });
    else missing.push(s);
  });
  if (!missing.length) return out;

  let results: (string | null)[] = missing.map(() => null);
  if (translationEngine() === "gemini") {
    try {
      results = await geminiTranslate(missing, lang);
    } catch (e) {
      const msg = (e as Error).message;
      console.error("[translate:gemini]", msg);
      errors.push(`Gemini: ${msg}`);
    }
  }
  // Google Translate: mesin utama tanpa Gemini, sekaligus cadangan jika Gemini gagal
  const pending = missing.map((s, i) => (results[i] ? null : i)).filter((i): i is number => i !== null);
  if (pending.length) {
    const g = await googleTranslateAll(pending.map((i) => missing[i]), lang, errors);
    pending.forEach((idx, j) => { results[idx] = g[j]; });
  }

  await Promise.all(
    missing.map(async (s, i) => {
      const text = results[i]?.trim();
      if (!text) {
        out.set(s, { source: s, text: s, auto: true, failed: true });
        return;
      }
      out.set(s, { source: s, text, auto: true });
      await prisma.translation
        .upsert({ where: { key: translationKey(s, lang) }, update: {}, create: { key: translationKey(s, lang), source: s, lang, text, auto: true } })
        .catch(() => {});
    }),
  );
  return out;
}

/** Simpan koreksi manual dari admin. */
export async function saveTranslation(source: string, text: string, lang = "en") {
  const key = translationKey(source, lang);
  await prisma.translation.upsert({ where: { key }, update: { text, auto: false }, create: { key, source, lang, text, auto: false } });
}

/** Hapus terjemahan → akan diterjemahkan ulang otomatis saat CV dibuat. */
export async function resetTranslation(source: string, lang = "en") {
  await prisma.translation.deleteMany({ where: { key: translationKey(source, lang) } });
}

// ---------------- Mesin terjemahan ----------------

async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
  } finally {
    clearTimeout(t);
  }
}

/** Google Translate (endpoint gratis tanpa API key). */
export async function googleTranslate(text: string, lang: string): Promise<string | null> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Google Translate HTTP ${res.status}`);
  const json = (await res.json()) as unknown;
  const segs = Array.isArray(json) && Array.isArray(json[0]) ? (json[0] as unknown[]) : [];
  const joined = segs.map((s) => (Array.isArray(s) && typeof s[0] === "string" ? s[0] : "")).join("");
  return joined || null;
}

async function googleTranslateAll(texts: string[], lang: string, errors: string[] = []) {
  const results: (string | null)[] = new Array(texts.length).fill(null);
  let next = 0;
  const worker = async () => {
    while (next < texts.length) {
      const i = next++;
      try { results[i] = await googleTranslate(texts[i], lang); } catch (e) {
        const msg = (e as Error).name === "AbortError" ? "timeout" : (e as Error).message;
        console.error("[translate:google]", msg);
        if (!errors.some((x) => x.startsWith("Google"))) errors.push(`Google Translate: ${msg}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, texts.length) }, worker));
  return results;
}

/** Gemini: menerjemahkan semua teks dalam satu permintaan dengan gaya bahasa CV profesional. */
export async function geminiTranslate(texts: string[], lang: string): Promise<(string | null)[]> {
  const models = [...new Set([process.env.GEMINI_MODEL, "gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash"].filter(Boolean) as string[])];
  const target = lang === "en" ? "English" : lang;
  const prompt =
    `Translate each string in the JSON array below into professional ${target} suitable for a resume/CV. ` +
    `Keep proper nouns, company names, product names, technology names, numbers and URLs unchanged. ` +
    `If a string is already in ${target}, return it unchanged. ` +
    `Return ONLY a JSON array of strings with exactly ${texts.length} items, in the same order.\n\n` +
    JSON.stringify(texts);

  let lastErr = "";
  for (const model of models) {
    const res = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": (process.env.GEMINI_API_KEY ?? "").trim() },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: "application/json" } }),
      },
      30000,
    ).catch((e: Error) => { lastErr = e.name === "AbortError" ? "timeout" : e.message; return null; });
    if (!res) continue;
    if (!res.ok) {
      const body = await res.text();
      const detail = (() => { try { return JSON.parse(body)?.error?.message as string; } catch { return body.slice(0, 160); } })();
      lastErr = `HTTP ${res.status} (${model}): ${detail}`;
      if (res.status === 404) continue; // model tidak tersedia → coba model berikutnya
      throw new Error(lastErr);         // key salah / kuota habis → tidak perlu coba model lain
    }
    const json = await res.json();
    const raw: string = (json?.candidates?.[0]?.content?.parts ?? [])
      .filter((p: { thought?: boolean }) => !p.thought)
      .map((p: { text?: string }) => p.text ?? "")
      .join("");
    let parsed: unknown = JSON.parse(raw.replace(/^\s*```(?:json)?|```\s*$/g, "").trim());
    if (parsed && !Array.isArray(parsed) && typeof parsed === "object") parsed = Object.values(parsed).find(Array.isArray);
    if (!Array.isArray(parsed) || parsed.length !== texts.length) throw new Error(`Format jawaban Gemini tidak sesuai (${model})`);
    return parsed.map((x) => (typeof x === "string" ? x : null));
  }
  throw new Error(lastErr || "Gemini tidak dapat dihubungi");
}
