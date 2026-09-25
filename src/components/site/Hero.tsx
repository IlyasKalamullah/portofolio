import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import type { Profile } from "@prisma/client";
import { Socials } from "./Socials";
import { CvButton } from "./CvButton";
import { HeroGrid } from "./HeroGrid";
import { Typewriter } from "./Typewriter";
import { CountUp } from "./CountUp";
import { Magnetic } from "./Magnetic";
import { splitRoles, primaryRole } from "@/lib/text";
import { delay } from "@/lib/motion";

export function Hero({ profile }: { profile: Profile }) {
  const [first, ...rest] = profile.name.split(" ");
  const roles = splitRoles(profile.headline);
  // urutan intro: badge → "Halo" → nama (huruf per huruf) → headline → tagline → tombol
  const nameEnd = 250 + first.length * 45 + 250;
  const seq = (n: number) => ({ "--d": `${nameEnd + n * 120}ms` }) as React.CSSProperties;
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-36 sm:pt-44">
      <HeroGrid />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-violet-600/20 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="intro mb-6 flex flex-wrap items-center gap-3">
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

            <p className="intro font-mono text-sm text-zinc-400" style={delay(1)}>Halo, saya <span className="inline-block origin-[70%_70%] animate-[wave_2.2s_ease-in-out_1s_2]">👋</span></p>
            <h1 className="mt-2 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl" aria-label={profile.name}>
              <span className="rise-line" aria-hidden>
                {Array.from(first).map((ch, i) => (
                  <span key={i} className="rise" style={{ "--d": `${250 + i * 45}ms` } as React.CSSProperties}>{ch}</span>
                ))}
              </span>
              {rest.length > 0 && (
                <>
                  <br />
                  <span className="rise-line" aria-hidden>
                    <span className="rise bg-gradient-to-r from-accent via-lime-200 to-white bg-clip-text text-transparent light:from-lime-600 light:via-lime-500 light:to-emerald-700" style={{ "--d": `${nameEnd - 150}ms` } as React.CSSProperties}>
                      {rest.join(" ")}
                    </span>
                  </span>
                </>
              )}
            </h1>
            <p className="intro mt-6 flex min-h-[1.5em] items-center font-display text-xl text-white sm:text-2xl" style={seq(0)}>
              <Typewriter words={roles} />
            </p>
            {profile.tagline && <p className="intro mt-4 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg" style={seq(1)}>{profile.tagline}</p>}

            <div className="intro relative z-20 mt-8 flex flex-wrap items-center gap-3" style={seq(2)}>
              <Magnetic>
                <a href="#projects" className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black shadow-[0_0_0_0_rgba(198,244,50,.5)] transition hover:bg-accent-soft hover:shadow-[0_0_30px_-4px_rgba(198,244,50,.6)]">
                  Lihat karya saya <ArrowUpRight size={18} className="transition group-hover:rotate-45" />
                </a>
              </Magnetic>
              {(profile.resumeUrl || profile.resumeUrlEn) && (
                <Magnetic>
                  <CvButton id={profile.resumeUrl} en={profile.resumeUrlEn} />
                </Magnetic>
              )}
            </div>
            <div className="intro mt-8" style={seq(3)}><Socials profile={profile} /></div>
          </div>

          <div className="intro relative mx-auto w-full max-w-sm" style={seq(0)}>
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
                <p className="font-display font-semibold text-[#fff]">{profile.name}</p>
                <p className="text-sm text-[#d4d4d8]">{primaryRole(profile.headline)}</p>
              </div>
            </div>
            <div className="card absolute -left-6 top-10 hidden animate-float px-4 py-3 sm:block">
              <p className="font-display text-2xl font-bold text-accent"><CountUp value={profile.yearsExperience} />+</p>
              <p className="text-xs text-zinc-400">Tahun pengalaman</p>
            </div>
            <div className="card absolute -right-4 bottom-24 hidden animate-float px-4 py-3 [animation-delay:1.5s] sm:block">
              <p className="font-display text-2xl font-bold text-accent"><CountUp value={profile.projectsDone} />+</p>
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
