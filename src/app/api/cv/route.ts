import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { buildCv, cvFileName, parseOptions, siteOrigin } from "@/lib/cv/data";
import { renderCvPdf } from "@/lib/cv/pdf";
import { renderCvDocx } from "@/lib/cv/docx";

export const runtime = "nodejs";

/** Buat CV (PDF / DOCX) dari data database. Hanya untuk admin. */
export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const format = body?.format === "docx" ? "docx" : "pdf";
  try {
    const data = await buildCv(parseOptions(body, siteOrigin(req)));
    const buf = format === "docx" ? await renderCvDocx(data) : await renderCvPdf(data);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": format === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/pdf",
        "Content-Disposition": `inline; filename="${cvFileName(data.name, format)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal membuat CV: " + (e as Error).message }, { status: 500 });
  }
}
