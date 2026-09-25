import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { buildCvWithTranslations, parseOptions, siteOrigin } from "@/lib/cv/data";
import { resetTranslation, saveTranslation, translationEngine } from "@/lib/translate";

export const runtime = "nodejs";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

/** Daftar teks CV beserta terjemahan Inggrisnya (untuk diperiksa/dikoreksi di admin). */
export async function POST(req: Request) {
  if (!(await getSession())) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const { translations, errors } = await buildCvWithTranslations({ ...parseOptions(body, siteOrigin(req)), lang: "en" });
  return NextResponse.json({ engine: translationEngine(), translations, errors });
}

/** Simpan koreksi manual. */
export async function PUT(req: Request) {
  if (!(await getSession())) return unauthorized();
  const { items } = (await req.json().catch(() => ({}))) as { items?: { source: string; text: string }[] };
  for (const it of items ?? []) {
    if (typeof it?.source === "string" && typeof it?.text === "string" && it.text.trim())
      await saveTranslation(it.source.slice(0, 3000), it.text.trim().slice(0, 3000));
  }
  return NextResponse.json({ ok: true });
}

/** Hapus koreksi → diterjemahkan ulang otomatis. */
export async function DELETE(req: Request) {
  if (!(await getSession())) return unauthorized();
  const { source } = (await req.json().catch(() => ({}))) as { source?: string };
  if (source) await resetTranslation(source);
  return NextResponse.json({ ok: true });
}
