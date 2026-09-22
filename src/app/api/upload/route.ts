import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { BUCKET, storageConfigured, supabaseAdmin } from "@/lib/supabase";

const MAX_SIZE = 4 * 1024 * 1024; // 4 MB (batas request Vercel 4.5 MB)
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml", "application/pdf"];

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!storageConfigured()) {
    return NextResponse.json(
      { error: "Supabase Storage belum dikonfigurasi (SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY). Tempel URL gambar secara manual." },
      { status: 400 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Ukuran file maksimal 4 MB. Kompres dulu file-nya (misalnya di ilovepdf.com / tinypng.com)." }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Format file tidak didukung." }, { status: 400 });

  const supabase = supabaseAdmin();

  // Buat bucket publik otomatis jika belum ada
  const { data: bucket } = await supabase.storage.getBucket(BUCKET);
  if (!bucket) await supabase.storage.createBucket(BUCKET, { public: true });

  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `uploads/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
