// Mengisi data contoh. Jalankan sekali: npm run db:seed
// Semua data bisa diubah/hapus lewat /admin setelahnya.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url ?? "");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url, ssl: isLocal ? undefined : { rejectUnauthorized: false } }),
});

async function main() {
  await prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Ilyas Kalamullah",
      headline: "Full-Stack Web Developer",
      tagline: "Saya merancang dan membangun website serta aplikasi web yang cepat, rapi, dan menyenangkan untuk digunakan.",
      bio: "Mahasiswa Informatika yang jatuh cinta pada dunia web development. Saya senang mengubah ide menjadi produk digital nyata — mulai dari desain antarmuka hingga backend dan database.\n\nSaat ini saya fokus di ekosistem JavaScript/TypeScript seperti React, Next.js, dan Node.js, serta terus belajar hal baru setiap hari.",
      location: "Bandung, Indonesia",
      email: "hello@example.com",
      available: true,
      github: "https://github.com/",
      linkedin: "https://linkedin.com/",
      instagram: "https://instagram.com/",
      yearsExperience: 2,
      projectsDone: 12,
      happyClients: 5,
    },
  });

  if ((await prisma.project.count()) === 0) {
    await prisma.project.createMany({
      data: [
        { title: "E-Commerce Dashboard", slug: "e-commerce-dashboard", category: "Web App", year: "2025", featured: true, order: 1,
          summary: "Dashboard admin untuk toko online dengan analitik penjualan real-time.",
          content: "Proyek ini adalah dashboard admin lengkap untuk mengelola produk, pesanan, dan pelanggan.\n\nFitur utama meliputi grafik penjualan real-time, manajemen stok, dan export laporan ke Excel.",
          tags: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
          imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80" },
        { title: "Aplikasi Kasir UMKM", slug: "aplikasi-kasir-umkm", category: "Web App", year: "2024", order: 2,
          summary: "Aplikasi point-of-sale sederhana untuk UMKM dengan laporan harian.",
          tags: ["React", "Node.js", "Supabase"],
          imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80" },
        { title: "Landing Page Kopi Lokal", slug: "landing-page-kopi-lokal", category: "UI/UX", year: "2024", order: 3,
          summary: "Redesign landing page brand kopi lokal dengan fokus konversi.",
          tags: ["Figma", "Tailwind CSS"],
          imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80" },
      ],
    });
  }

  if ((await prisma.experience.count()) === 0) {
    await prisma.experience.createMany({
      data: [
        { role: "Frontend Developer Intern", company: "PT Contoh Digital", type: "Internship", location: "Bandung", startDate: "Feb 2025", current: true, order: 1,
          description: "Membangun komponen UI dengan React & Tailwind\nBerkolaborasi dengan tim desain untuk implementasi Figma\nMeningkatkan performa halaman hingga 40%" },
        { role: "Freelance Web Developer", company: "Self-employed", type: "Freelance", location: "Remote", startDate: "2023", endDate: "2025", order: 2,
          description: "Membuat website company profile untuk 5+ klien UMKM\nMengelola deployment dan domain" },
      ],
    });
  }

  if ((await prisma.education.count()) === 0) {
    await prisma.education.create({
      data: { school: "Institut Teknologi Nasional (Itenas)", degree: "S1", field: "Informatika", startDate: "2022", endDate: "Sekarang", order: 1 },
    });
  }

  if ((await prisma.skill.count()) === 0) {
    const skills = [
      ["React", "Frontend", 90], ["Next.js", "Frontend", 88], ["Tailwind CSS", "Frontend", 92], ["TypeScript", "Frontend", 80],
      ["Node.js", "Backend", 80], ["PostgreSQL", "Backend", 75], ["Supabase", "Backend", 78], ["Prisma", "Backend", 76],
      ["Git", "Tools", 85], ["Figma", "Tools", 75], ["Vercel", "Tools", 85],
    ];
    await prisma.skill.createMany({ data: skills.map(([name, category, level], i) => ({ name, category, level, order: i })) });
  }

  if ((await prisma.certificate.count()) === 0) {
    await prisma.certificate.create({ data: { title: "Belajar Membuat Aplikasi Web dengan React", issuer: "Dicoding", date: "2024", order: 1 } });
  }

  console.log("✅ Seed selesai");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
