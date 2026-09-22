-- Alternatif dari `npx prisma db push`:
-- jalankan file ini di Supabase SQL Editor atau TablePlus untuk membuat semua tabel.
-- (Struktur sama persis dengan prisma/schema.prisma)

CREATE TABLE IF NOT EXISTS "Profile" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "name" TEXT NOT NULL DEFAULT 'Nama Anda',
  "headline" TEXT NOT NULL DEFAULT 'Full-Stack Developer',
  "tagline" TEXT NOT NULL DEFAULT '',
  "bio" TEXT NOT NULL DEFAULT '',
  "avatarUrl" TEXT,
  "resumeUrl" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "location" TEXT,
  "available" BOOLEAN NOT NULL DEFAULT true,
  "github" TEXT,
  "linkedin" TEXT,
  "instagram" TEXT,
  "twitter" TEXT,
  "website" TEXT,
  "yearsExperience" INTEGER NOT NULL DEFAULT 0,
  "projectsDone" INTEGER NOT NULL DEFAULT 0,
  "happyClients" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Project" (
  "id" SERIAL NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT NOT NULL DEFAULT '',
  "content" TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT,
  "category" TEXT,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "liveUrl" TEXT,
  "repoUrl" TEXT,
  "year" TEXT,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Project_slug_key" ON "Project"("slug");

CREATE TABLE IF NOT EXISTS "Experience" (
  "id" SERIAL NOT NULL,
  "company" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "type" TEXT,
  "location" TEXT,
  "logoUrl" TEXT,
  "startDate" TEXT NOT NULL,
  "endDate" TEXT,
  "current" BOOLEAN NOT NULL DEFAULT false,
  "description" TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Education" (
  "id" SERIAL NOT NULL,
  "school" TEXT NOT NULL,
  "degree" TEXT NOT NULL,
  "field" TEXT,
  "startDate" TEXT NOT NULL,
  "endDate" TEXT,
  "description" TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Skill" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'Lainnya',
  "level" INTEGER NOT NULL DEFAULT 80,
  "iconUrl" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Certificate" (
  "id" SERIAL NOT NULL,
  "title" TEXT NOT NULL,
  "issuer" TEXT NOT NULL,
  "date" TEXT,
  "credentialUrl" TEXT,
  "imageUrl" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Message" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "subject" TEXT,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- Keamanan: aktifkan RLS agar tabel TIDAK bisa diakses lewat Supabase public API (anon key).
-- Aplikasi tetap bisa akses karena terhubung langsung sebagai user postgres.
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Experience" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Education" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Skill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Certificate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
