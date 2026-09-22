import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getProfile } from "@/lib/data";
import { GithubIcon } from "@/components/site/Icons";
import { Footer } from "@/components/site/Footer";

// Halaman di-cache agar cepat; otomatis diperbarui setiap kali data disimpan di admin
export const revalidate = 3600;

// Halaman proyek dibuat saat pertama dibuka, lalu di-cache
export function generateStaticParams() {
  return [];
}

async function getProject(slug: string) {
  return prisma.project.findFirst({ where: { slug, published: true } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getProject((await params).slug);
  if (!p) return {};
  return { title: p.title, description: p.summary, openGraph: { images: p.imageUrl ? [p.imageUrl] : [] } };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, profile] = await Promise.all([getProject(slug), getProfile()]);
  if (!project) notFound();

  const others = await prisma.project.findMany({
    where: { published: true, NOT: { id: project.id } },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
    take: 2,
  });

  return (
    <div className="grain">
      <main className="mx-auto max-w-4xl px-5 pb-24 pt-10">
        <Link href="/#projects" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:border-white/30 hover:text-white">
          <ArrowLeft size={16} /> Kembali
        </Link>

        <header className="mt-10">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-accent">
            {project.category && <span>{project.category}</span>}
            {project.year && <span className="text-zinc-500">· {project.year}</span>}
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-6xl">{project.title}</h1>
          {project.summary && <p className="mt-5 text-lg text-zinc-400">{project.summary}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black hover:bg-accent-soft">
                Kunjungi website <ArrowUpRight size={16} />
              </a>
            )}
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-white/5">
                <GithubIcon size={16} /> Source code
              </a>
            )}
          </div>
        </header>

        {project.imageUrl && (
          <div className="mt-10 overflow-hidden rounded-3xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img loading="lazy" decoding="async" src={project.imageUrl} alt={project.title} className="w-full object-cover" />
          </div>
        )}

        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_220px]">
          <article className="space-y-5 leading-relaxed text-zinc-300">
            {(project.content || project.summary).split(/\n\s*\n/).map((para, i) => (
              <p key={i} className="whitespace-pre-line">{para}</p>
            ))}
          </article>
          {project.tags.length > 0 && (
            <aside>
              <p className="mb-3 text-xs uppercase tracking-widest text-zinc-500">Teknologi</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((t) => <span key={t} className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs">{t}</span>)}
              </div>
            </aside>
          )}
        </div>

        {others.length > 0 && (
          <section className="mt-20 border-t border-white/5 pt-10">
            <p className="mb-6 text-xs uppercase tracking-widest text-zinc-500">Proyek lainnya</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {others.map((o) => (
                <Link key={o.id} href={`/projects/${o.slug}`} className="card card-hover group flex items-center justify-between p-5">
                  <div>
                    <p className="font-display text-lg font-semibold">{o.title}</p>
                    <p className="text-sm text-zinc-500">{o.category}</p>
                  </div>
                  <ArrowUpRight className="text-zinc-500 transition group-hover:rotate-45 group-hover:text-accent" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer name={profile.name} />
    </div>
  );
}
