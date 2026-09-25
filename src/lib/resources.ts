// Definisi semua data yang bisa dikelola di admin dashboard.
// Tambah field baru di sini + di prisma/schema.prisma, form admin otomatis mengikuti.

export type FieldType = "text" | "textarea" | "number" | "checkbox" | "image" | "tags" | "url" | "email" | "select";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: string[];
  half?: boolean;
};

export type Resource = {
  key: string;
  model: "project" | "experience" | "education" | "skill" | "certificate";
  label: string;
  singular: string;
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  fields: Field[];
};

export const resources: Resource[] = [
  {
    key: "projects",
    model: "project",
    label: "Proyek",
    singular: "Proyek",
    titleField: "title",
    subtitleField: "category",
    imageField: "imageUrl",
    fields: [
      { name: "title", label: "Judul", type: "text", required: true, half: true },
      { name: "slug", label: "Slug URL", type: "text", half: true, help: "Kosongkan untuk dibuat otomatis dari judul" },
      { name: "category", label: "Kategori", type: "text", half: true, placeholder: "Web App, Mobile, UI/UX..." },
      { name: "year", label: "Tahun", type: "text", half: true, placeholder: "2025" },
      { name: "summary", label: "Ringkasan singkat", type: "textarea", placeholder: "1–2 kalimat untuk kartu proyek" },
      { name: "content", label: "Deskripsi lengkap", type: "textarea", help: "Ditampilkan di halaman detail proyek. Pisahkan paragraf dengan baris kosong." },
      { name: "imageUrl", label: "Gambar / thumbnail", type: "image" },
      { name: "tags", label: "Teknologi (tags)", type: "tags", placeholder: "Next.js, Tailwind, Supabase", help: "Pisahkan dengan koma" },
      { name: "liveUrl", label: "Link demo", type: "url", half: true },
      { name: "repoUrl", label: "Link repository", type: "url", half: true },
      { name: "order", label: "Urutan", type: "number", half: true, help: "Angka kecil tampil lebih dulu" },
      { name: "featured", label: "Tampilkan sebagai unggulan", type: "checkbox", half: true },
      { name: "published", label: "Publikasikan", type: "checkbox", half: true },
    ],
  },
  {
    key: "experience",
    model: "experience",
    label: "Pengalaman",
    singular: "Pengalaman",
    titleField: "role",
    subtitleField: "company",
    imageField: "logoUrl",
    fields: [
      { name: "role", label: "Posisi", type: "text", required: true, half: true },
      { name: "company", label: "Perusahaan / Organisasi", type: "text", required: true, half: true },
      { name: "type", label: "Jenis", type: "select", half: true, options: ["Full-time", "Part-time", "Internship", "Freelance", "Kontrak", "Organisasi", "Volunteer"] },
      { name: "location", label: "Lokasi", type: "text", half: true, placeholder: "Bandung / Remote" },
      { name: "startDate", label: "Mulai", type: "text", required: true, half: true, placeholder: "Jan 2024" },
      { name: "endDate", label: "Selesai", type: "text", half: true, placeholder: "Des 2024" },
      { name: "current", label: "Masih bekerja di sini", type: "checkbox" },
      { name: "description", label: "Deskripsi", type: "textarea", help: "Satu poin per baris" },
      { name: "logoUrl", label: "Logo", type: "image" },
      { name: "order", label: "Urutan", type: "number" },
    ],
  },
  {
    key: "education",
    model: "education",
    label: "Pendidikan",
    singular: "Pendidikan",
    titleField: "school",
    subtitleField: "degree",
    fields: [
      { name: "school", label: "Institusi", type: "text", required: true },
      { name: "degree", label: "Jenjang / Gelar", type: "text", required: true, half: true, placeholder: "S1" },
      { name: "field", label: "Jurusan", type: "text", half: true, placeholder: "Informatika" },
      { name: "startDate", label: "Mulai", type: "text", required: true, half: true, placeholder: "2021" },
      { name: "endDate", label: "Selesai", type: "text", half: true, placeholder: "2025 / Sekarang" },
      { name: "description", label: "Keterangan", type: "textarea", placeholder: "IPK, prestasi, organisasi..." },
      { name: "order", label: "Urutan", type: "number" },
    ],
  },
  {
    key: "skills",
    model: "skill",
    label: "Skill",
    singular: "Skill",
    titleField: "name",
    subtitleField: "category",
    imageField: "iconUrl",
    fields: [
      { name: "name", label: "Nama skill", type: "text", required: true, half: true },
      { name: "category", label: "Kategori", type: "text", required: true, half: true, placeholder: "Frontend, Backend, Tools, Design..." },
      { name: "level", label: "Level (0–100)", type: "number", half: true },
      { name: "order", label: "Urutan", type: "number", half: true },
      { name: "iconUrl", label: "Ikon (opsional)", type: "image" },
    ],
  },
  {
    key: "certificates",
    model: "certificate",
    label: "Sertifikat",
    singular: "Sertifikat",
    titleField: "title",
    subtitleField: "issuer",
    imageField: "imageUrl",
    fields: [
      { name: "title", label: "Nama sertifikat", type: "text", required: true },
      { name: "issuer", label: "Penerbit", type: "text", required: true, half: true, placeholder: "Dicoding, Google, ..." },
      { name: "date", label: "Tanggal", type: "text", half: true, placeholder: "Mar 2025" },
      { name: "credentialUrl", label: "Link kredensial", type: "url" },
      { name: "imageUrl", label: "File sertifikat (gambar atau PDF)", type: "image", help: "JPG/PNG/WebP/PDF, maks. 4 MB" },
      { name: "order", label: "Urutan", type: "number" },
    ],
  },
];

export const profileFields: Field[] = [
  { name: "name", label: "Nama lengkap", type: "text", required: true, half: true },
  { name: "headline", label: "Profesi / headline", type: "text", required: true, half: true, placeholder: "Full-Stack Developer | UI Enthusiast", help: "Pisahkan beberapa peran dengan | untuk efek mengetik bergantian" },
  { name: "tagline", label: "Tagline hero", type: "textarea", placeholder: "Kalimat singkat di bagian atas website" },
  { name: "bio", label: "Tentang saya", type: "textarea", help: "Pisahkan paragraf dengan baris kosong" },
  { name: "avatarUrl", label: "Foto profil", type: "image" },
  { name: "resumeUrl", label: "CV bahasa Indonesia (PDF)", type: "url", half: true, help: "Otomatis terisi dari menu Buat CV, atau tempel link sendiri" },
  { name: "resumeUrlEn", label: "CV bahasa Inggris (PDF)", type: "url", half: true, help: "Kosongkan jika tidak ada" },
  { name: "email", label: "Email", type: "email", half: true },
  { name: "phone", label: "No. WhatsApp", type: "text", half: true, placeholder: "6281234567890" },
  { name: "location", label: "Lokasi", type: "text", half: true, placeholder: "Bandung, Indonesia" },
  { name: "available", label: "Terbuka untuk pekerjaan / project", type: "checkbox", half: true },
  { name: "github", label: "GitHub", type: "url", half: true },
  { name: "linkedin", label: "LinkedIn", type: "url", half: true },
  { name: "instagram", label: "Instagram", type: "url", half: true },
  { name: "twitter", label: "X / Twitter", type: "url", half: true },
  { name: "website", label: "Website lain", type: "url", half: true },
  { name: "yearsExperience", label: "Tahun pengalaman", type: "number", half: true },
  { name: "projectsDone", label: "Jumlah proyek selesai", type: "number", half: true },
  { name: "happyClients", label: "Jumlah klien", type: "number", half: true },
];

export function getResource(key: string) {
  return resources.find((r) => r.key === key);
}

/** Ubah FormData menjadi object data Prisma sesuai tipe field. */
export function parseForm(fields: Field[], fd: FormData) {
  const data: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = fd.get(f.name);
    const str = typeof raw === "string" ? raw.trim() : "";
    switch (f.type) {
      case "checkbox":
        data[f.name] = raw === "on" || raw === "true";
        break;
      case "number":
        data[f.name] = str === "" ? 0 : Number.parseInt(str, 10) || 0;
        break;
      case "tags":
        data[f.name] = str.split(",").map((t) => t.trim()).filter(Boolean);
        break;
      case "url": {
        // Hapus spasi & tambahkan https:// otomatis jika belum ada
        let u = str.replace(/\s+/g, "");
        if (u && !/^(https?:\/\/|mailto:|\/)/i.test(u)) u = `https://${u}`;
        data[f.name] = u || null;
        break;
      }
      default:
        if (f.required && !str) throw new Error(`${f.label} wajib diisi`);
        // textarea = kolom teks non-null (default ""), lainnya boleh null
        data[f.name] = str === "" ? (f.type === "textarea" || f.required ? "" : null) : str;
    }
  }
  return data;
}
