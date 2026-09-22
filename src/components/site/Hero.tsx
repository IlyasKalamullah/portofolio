import { ArrowDown, ArrowUpRight, Download, MapPin } from "lucide-react";
import type { Profile } from "@prisma/client";
import { Socials } from "./Socials";

export function Hero({ profile }: { profile: Profile }) {
  const [first, ...rest] = profile.name.split(" ");
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-36 sm:pt-44">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-violet-600/20 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="reveal mb-6 flex flex-wrap items-center gap-3">
              {profile.available && (
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                  </span>
                  Tersedia untuk project baru
                </span>
              )}
              {profile.location && (
                <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400"><MapPin size={14} /> {profile.location}</span>
              )}
            </div>

            <p className="reveal font-mono text-sm text-zinc-400">Halo, saya 👋</p>
            <h1 className="reveal mt-2 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
              {first}
              {rest.length > 0 && (
                <>
                  <br />
                  <span className="bg-gradient-to-r from-accent via-lime-200 to-white bg-clip-text text-transparent">{rest.join(" ")}</span>
                </>
              )}
            </h1>
            <p className="reveal mt-6 font-display text-xl text-white sm:text-2xl">{profile.headline}</p>
            {profile.tagline && <p className="reveal mt-4 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">{profile.tagline}</p>}

            <div className="reveal mt-8 flex flex-wrap items-center gap-3">
              <a href="#projects" className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black transition hover:bg-accent-soft">
                Lihat karya saya <ArrowUpRight size={18} className="transition group-hover:rotate-45" />
              </a>
              {profile.resumeUrl && (
                <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold transition hover:border-white/40 hover:bg-white/5">
                  <Download size={16} /> Unduh CV
                </a>
              )}
            </div>
            <div className="reveal mt-8"><Socials profile={profile} /></div>
          </div>

          <div className="reveal relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-accent/40 via-transparent to-violet-500/30 opacity-60 blur-2xl" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-ink-800">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img fetchPriority="high" decoding="async" src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center font-display text-8xl font-bold text-white/10">
                  {profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                <p className="font-display font-semibold">{profile.name}</p>
                <p className="text-sm text-zinc-300">{profile.headline}</p>
              </div>
            </div>
            <div className="card absolute -left-6 top-10 hidden animate-float px-4 py-3 sm:block">
              <p className="font-display text-2xl font-bold text-accent">{profile.yearsExperience}+</p>
              <p className="text-xs text-zinc-400">Tahun pengalaman</p>
            </div>
            <div className="card absolute -right-4 bottom-24 hidden animate-float px-4 py-3 [animation-delay:1.5s] sm:block">
              <p className="font-display text-2xl font-bold text-accent">{profile.projectsDone}+</p>
              <p className="text-xs text-zinc-400">Proyek selesai</p>
            </div>
          </div>
        </div>

        <a href="#about" className="mx-auto mt-16 hidden w-fit items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-white lg:flex">
          <ArrowDown size={14} className="animate-bounce" /> Scroll
        </a>
      </div>
    </section>
  );
}
