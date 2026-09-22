import Link from "next/link";
import { Award, Briefcase, FolderKanban, GraduationCap, Mail, Sparkles, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getProfile } from "@/lib/data";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function Dashboard() {
  const [profile, projects, experience, education, skills, certificates, messages, unread, latest] = await Promise.all([
    getProfile(),
    prisma.project.count(),
    prisma.experience.count(),
    prisma.education.count(),
    prisma.skill.count(),
    prisma.certificate.count(),
    prisma.message.count(),
    prisma.message.count({ where: { read: false } }),
    prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const cards = [
    { label: "Proyek", value: projects, href: "/admin/projects", icon: FolderKanban },
    { label: "Pengalaman", value: experience, href: "/admin/experience", icon: Briefcase },
    { label: "Pendidikan", value: education, href: "/admin/education", icon: GraduationCap },
    { label: "Skill", value: skills, href: "/admin/skills", icon: Sparkles },
    { label: "Sertifikat", value: certificates, href: "/admin/certificates", icon: Award },
    { label: "Pesan", value: messages, href: "/admin/messages", icon: Mail, badge: unread },
  ];

  return (
    <>
      <PageHeader title={`Halo, ${profile.name.split(" ")[0]} 👋`} desc="Kelola semua isi website portofolio Anda dari sini." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map(({ label, value, href, icon: Icon, badge }) => (
          <Link key={label} href={href} className="group rounded-2xl border border-white/5 bg-ink-800 p-5 transition hover:border-accent/40">
            <div className="flex items-center justify-between">
              <Icon size={20} className="text-zinc-500 group-hover:text-accent" />
              {badge ? <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-black">{badge} baru</span> : null}
            </div>
            <p className="mt-4 font-display text-3xl font-bold">{value}</p>
            <p className="text-sm text-zinc-400">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/5 bg-ink-800 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Pesan terbaru</h2>
            <Link href="/admin/messages" className="text-xs text-accent hover:underline">Lihat semua</Link>
          </div>
          {latest.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada pesan masuk.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {latest.map((m) => (
                <li key={m.id} className="py-3">
                  <div className="flex items-center gap-2">
                    {!m.read && <span className="h-2 w-2 rounded-full bg-accent" />}
                    <p className="text-sm font-medium">{m.name}</p>
                    <span className="ml-auto text-xs text-zinc-500">{m.createdAt.toLocaleDateString("id-ID")}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-zinc-400">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-white/5 bg-ink-800 p-5">
          <h2 className="mb-4 font-semibold">Aksi cepat</h2>
          <div className="space-y-2">
            {[
              ["Edit profil & kontak", "/admin/profile"],
              ["Tambah proyek baru", "/admin/projects/new"],
              ["Tambah pengalaman", "/admin/experience/new"],
              ["Tambah skill", "/admin/skills/new"],
            ].map(([l, h]) => (
              <Link key={h} href={h} className="flex items-center justify-between rounded-lg border border-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:border-accent/40 hover:text-white">
                {l} <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
