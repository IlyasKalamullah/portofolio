import { BadgeCheck, Briefcase, MapPin, Smile, Code2 } from "lucide-react";
import type { Profile, Skill } from "@prisma/client";
import { SectionTitle } from "./SectionTitle";

export function About({ profile, skills }: { profile: Profile; skills: Skill[] }) {
  const paragraphs = profile.bio.split(/\n\s*\n/).filter(Boolean);
  const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 8);
  const stats = [
    { value: profile.yearsExperience, label: "Tahun pengalaman", icon: Briefcase },
    { value: profile.projectsDone, label: "Proyek selesai", icon: Code2 },
    { value: profile.happyClients, label: "Klien puas", icon: Smile },
  ];

  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <SectionTitle label="Tentang saya" title="Sedikit cerita tentang saya" />

      <div className="grid auto-rows-[minmax(140px,auto)] gap-4 md:grid-cols-6">
        <div className="card spotlight reveal p-7 md:col-span-4 md:row-span-2">
          <p className="mb-4 font-display text-2xl font-semibold leading-snug">
            {profile.headline} yang senang membangun produk digital yang <span className="text-accent">berguna</span> dan <span className="text-accent">indah</span>.
          </p>
          <div className="space-y-4 leading-relaxed text-zinc-400">
            {paragraphs.length ? paragraphs.map((p, i) => <p key={i}>{p}</p>) : <p>Tulis bio Anda dari admin dashboard.</p>}
          </div>
        </div>

        <div className="card spotlight reveal flex flex-col justify-between p-6 md:col-span-2">
          <MapPin className="text-accent" />
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">Berbasis di</p>
            <p className="mt-1 font-display text-xl font-semibold">{profile.location || "Indonesia"}</p>
          </div>
        </div>

        <div className="card spotlight reveal flex flex-col justify-between !border-accent !bg-accent p-6 text-black md:col-span-2">
          <BadgeCheck />
          <div>
            <p className="font-display text-xl font-bold">{profile.available ? "Open to work" : "Sedang sibuk"}</p>
            <p className="text-sm text-black/70">{profile.available ? "Siap berkolaborasi di project berikutnya." : "Tetap boleh menyapa!"}</p>
          </div>
        </div>

        {stats.map(({ value, label, icon: Icon }) => (
          <div key={label} className="card spotlight reveal flex items-center gap-4 p-6 md:col-span-2">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-accent"><Icon size={22} /></div>
            <div>
              <p className="font-display text-4xl font-bold">{value}<span className="text-accent">+</span></p>
              <p className="text-sm text-zinc-400">{label}</p>
            </div>
          </div>
        ))}

        {topSkills.length > 0 && (
          <div className="card spotlight reveal p-6 md:col-span-6">
            <p className="mb-4 text-xs uppercase tracking-widest text-zinc-500">Tech stack favorit</p>
            <div className="flex flex-wrap gap-2">
              {topSkills.map((s) => (
                <span key={s.id} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.iconUrl && <img loading="lazy" decoding="async" src={s.iconUrl} alt="" className="h-4 w-4 object-contain" />}
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
