# Website Portofolio + Admin Dashboard

Website portofolio (Next.js 15 + Tailwind) dengan **admin dashboard** untuk mengelola semua isinya.
Database & upload gambar memakai **Supabase**, dan siap deploy ke **Vercel**.

## Fitur

**Website publik (`/`)**
- Hero dengan foto, status "open to work", tombol CV, dan link sosial media
- Marquee skill, bento grid "Tentang saya" dan statistik
- Daftar proyek dengan filter kategori, plus halaman detail `/projects/[slug]`
- Timeline pengalaman dan pendidikan, skill dengan progress bar, sertifikat
- Form kontak: pesan masuk ke dashboard
- Responsif, animasi saat scroll, efek spotlight, dan SEO metadata

**Admin dashboard (`/admin`)**
- Login dengan email dan password (dari environment variable)
- CRUD untuk **Profil, Proyek, Pengalaman, Pendidikan, Skill, Sertifikat**
- Kotak **Pesan** masuk (tandai dibaca, balas via email, hapus)
- Upload gambar/PDF ke Supabase Storage. Bisa juga cukup menempelkan URL gambar.
- Perubahan langsung tampil di website

---

## 1. Siapkan Supabase

1. Buat project baru di [supabase.com](https://supabase.com). Pilih region **Southeast Asia (Singapore)**.
2. Buka **Project Settings → Database → Connection string** (atau tombol **Connect** di atas):
   - **Transaction pooler** (port **6543**) → isi ke `DATABASE_URL`
   - **Session pooler** (port **5432**) → isi ke `DIRECT_URL`
   - Ganti `[YOUR-PASSWORD]` dengan password database Anda.
   > Jangan pakai "Direct connection" (`db.xxx.supabase.co`) karena hanya mendukung IPv6 dan sering gagal di Vercel.
3. Buka **Project Settings → API**, lalu salin:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (secret) → `SUPABASE_SERVICE_ROLE_KEY`
   > Service role key bersifat rahasia. Kunci ini hanya dipakai di server dan tidak pernah dikirim ke browser.

Bucket storage `portfolio` (publik) akan dibuat otomatis saat upload pertama.

## 2. Jalankan di komputer

```bash
npm install
cp .env.example .env        # lalu isi semua nilainya
npx prisma db push          # membuat tabel di Supabase
npm run db:seed             # (opsional) isi data contoh
npm run dev
```

Buka http://localhost:3000, lalu http://localhost:3000/admin untuk login dengan `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

**Alternatif tanpa `prisma db push`:** buka file `supabase/schema.sql`, lalu jalankan isinya di **Supabase → SQL Editor** atau di **TablePlus**.

**Keamanan (disarankan):** jalankan juga bagian `ENABLE ROW LEVEL SECURITY` di akhir `supabase/schema.sql`. Dengan begitu tabel tidak bisa dibaca lewat public API Supabase. Aplikasi tetap berjalan normal.

## 3. Hubungkan TablePlus (opsional)

TablePlus → **Create a new connection → PostgreSQL**, lalu isi dari connection string **Session pooler**:

| Field    | Nilai                                           |
|----------|-------------------------------------------------|
| Host     | `aws-0-ap-southeast-1.pooler.supabase.com`      |
| Port     | `5432`                                          |
| User     | `postgres.<project-ref>`                        |
| Password | password database Supabase                      |
| Database | `postgres`                                      |
| SSL mode | `require`                                       |

Semua tabel (`Profile`, `Project`, `Experience`, `Education`, `Skill`, `Certificate`, `Message`) ada di schema `public`.

## 4. Deploy ke Vercel

1. Push project ini ke GitHub:
   ```bash
   git init && git add . && git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/USERNAME/portfolio.git
   git push -u origin main
   ```
2. Di [vercel.com](https://vercel.com): **Add New → Project → Import** repository tersebut.
3. Di **Environment Variables**, masukkan semua variabel dari `.env`:
   `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`
4. Klik **Deploy**. Selesai.

> Pastikan tabel sudah dibuat (langkah 2) sebelum membuka website hasil deploy.
> `AUTH_SECRET` bisa dibuat dengan `openssl rand -base64 32` atau string acak minimal 32 karakter.

## Menambah field / data baru

1. Tambahkan kolom di `prisma/schema.prisma`, lalu jalankan `npx prisma db push`.
2. Tambahkan field yang sama di `src/lib/resources.ts`. Form admin akan otomatis ikut.
3. Tampilkan field tersebut di komponen `src/components/site/*`.

## Struktur

```
prisma/schema.prisma        Struktur database
prisma/seed.mjs             Data contoh
supabase/schema.sql         SQL alternatif untuk membuat tabel (Supabase SQL Editor / TablePlus)
src/app/page.tsx            Halaman utama
src/app/projects/[slug]     Halaman detail proyek
src/app/admin/              Admin dashboard (login, CRUD, pesan)
src/app/api/upload          Upload file ke Supabase Storage
src/lib/resources.ts        Definisi field yang bisa diedit di admin
src/components/site/        Komponen tampilan website
src/components/admin/       Komponen admin
```
