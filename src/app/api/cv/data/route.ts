import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { buildCv, parseOptions, siteOrigin } from "@/lib/cv/data";

export const runtime = "nodejs";

/** Isi CV (JSON) yang disusun dari database — dipakai kanvas editor. */
export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await buildCv(parseOptions(await req.json().catch(() => ({})), siteOrigin(req)));
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
