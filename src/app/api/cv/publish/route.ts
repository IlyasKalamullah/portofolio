import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { buildCv, cvFileName, parseOptions, siteOrigin } from "@/lib/cv/data";
import { renderCvPdf } from "@/lib/cv/pdf";
import { BUCKET, storageConfigured, supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/** Buat PDF CV lalu pasang sebagai tombol "Unduh CV" di website. */
export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!storageConfigured()) return NextResponse.json({ error: "Supabase Storage belum dikonfigurasi." }, { status: 400 });
  try {
    const opts = parseOptions(await req.json().catch(() => ({})), siteOrigin(req));
    const data = await buildCv(opts);
    const pdf = await renderCvPdf(data);
    const supabase = supabaseAdmin();
    const { data: bucket } = await supabase.storage.getBucket(BUCKET);
    if (!bucket) await supabase.storage.createBucket(BUCKET, { public: true });

    const suffix = opts.lang === "en" ? "_EN" : "";
    const path = `cv/${cvFileName(data.name + suffix, "pdf")}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, pdf, { contentType: "application/pdf", upsert: true, cacheControl: "60" });
    if (error) throw new Error(error.message);

    const url = `${supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
    await prisma.profile.update({ where: { id: 1 }, data: opts.lang === "en" ? { resumeUrlEn: url } : { resumeUrl: url } });
    revalidatePath("/", "layout");
    return NextResponse.json({ url, lang: opts.lang });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal memasang CV: " + (e as Error).message }, { status: 500 });
  }
}
