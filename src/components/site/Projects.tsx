"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import clsx from "clsx";
import { GithubIcon } from "./Icons";
import { Carousel } from "./Carousel";

export type ProjectCard = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  category: string | null;
  tags: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  year: string | null;
  featured: boolean;
};

export function ProjectsGrid({ projects }: { projects: ProjectCard[] }) {
  const categories = useMemo(() => ["Semua", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean) as string[]))], [projects]);
  const [active, setActive] = useState("Semua");
  const list = active === "Semua" ? projects : projects.filter((p) => p.category === active);

  if (projects.length === 0) return <p className="text-zinc-500">Belum ada proyek. Tambahkan dari admin dashboard.</p>;

  return (
    <>
      {categories.length > 2 && (
        <div className="reveal mb-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} onClick={() => setActive(c)}
              className={clsx("rounded-full border px-4 py-1.5 text-sm transition",
                active === c ? "border-accent bg-accent text-black" : "border-white/10 text-zinc-400 hover:border-white/30 hover:text-white")}>
              {c}
            </button>
          ))}
        </div>
      )}
      <Carousel key={active} label="Proyek" slideClassName="w-[86%] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
        {list.map((p) => (
          <article key={p.id} className="card card-hover spotlight group flex w-full flex-col overflow-hidden">
            <Link href={`/projects/${p.slug}`} className="relative block aspect-video overflow-hidden bg-ink-700">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img loading="lazy" decoding="async" src={p.imageUrl} alt={p.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              ) : (
                <div className="grid h-full place-items-center bg-gradient-to-br from-ink-700 to-ink-900 px-4 text-center font-display text-3xl font-bold text-white/10">{p.title}</div>
              )}
              {p.featured && (
                <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-[#c6f432] backdrop-blur">
                  <Star size={12} className="fill-accent" /> Unggulan
                </span>
              )}
            </Link>
            <div className="flex flex-1 flex-col p-6">
              <div className="mb-2 flex items-center gap-2 font-mono text-xs text-zinc-500">
                {p.category && <span>{p.category}</span>}
                {p.category && p.year && <span>•</span>}
                {p.year && <span>{p.year}</span>}
              </div>
              <Link href={`/projects/${p.slug}`} className="group/t flex items-start justify-between gap-4">
                <h3 className="font-display text-xl font-semibold sm:text-2xl">{p.title}</h3>
                <ArrowUpRight className="mt-1 shrink-0 text-zinc-500 transition group-hover/t:rotate-45 group-hover/t:text-accent" />
              </Link>
              {p.summary && <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-400">{p.summary}</p>}
              {p.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => <span key={t} className="rounded-full bg-white/5 px-2.5 py-1 font-mono text-[11px] text-zinc-300">{t}</span>)}
                </div>
              )}
              {(p.liveUrl || p.repoUrl) && (
                <div className="mt-5 flex gap-4 border-t border-white/5 pt-4 text-sm">
                  {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">Live demo <ArrowUpRight size={14} /></a>}
                  {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white"><GithubIcon size={14} /> Source</a>}
                </div>
              )}
            </div>
          </article>
        ))}
      </Carousel>
    </>
  );
}
