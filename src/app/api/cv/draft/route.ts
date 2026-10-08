import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sanitizeCvData } from "@/lib/cv/sanitize";

export const runtime = "nodejs";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const langOf = (v: unknown) => (v === "en" ? "en" : "id");

/** Ambil CV hasil edit manual untuk satu bahasa. */
export async function GET(req: Request) {
  if (!(await getSession())) return unauthorized();
  const lang = langOf(new URL(req.url).searchParams.get("lang"));
  const draft = await prisma.cvDraft.findUnique({ where: { lang } });
  return NextResponse.json({ data: draft?.data ?? null, updatedAt: draft?.updatedAt ?? null });
}

/** Simpan hasil edit kanvas. */
export async function PUT(req: Request) {
  if (!(await getSession())) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const lang = langOf(body?.lang);
  const data = sanitizeCvData(body?.data, lang);
  if (!data) return NextResponse.json({ error: "Data CV tidak valid" }, { status: 400 });
  const json = data as unknown as Prisma.InputJsonValue;
  const saved = await prisma.cvDraft.upsert({ where: { lang }, update: { data: json }, create: { lang, data: json } });
  return NextResponse.json({ ok: true, updatedAt: saved.updatedAt });
}

/** Hapus hasil edit → CV kembali disusun otomatis dari data. */
export async function DELETE(req: Request) {
  if (!(await getSession())) return unauthorized();
  const body = await req.json().catch(() => ({}));
  await prisma.cvDraft.deleteMany({ where: { lang: langOf(body?.lang) } });
  return NextResponse.json({ ok: true });
}
