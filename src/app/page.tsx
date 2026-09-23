import type { Metadata } from "next";
import { getPortfolio, getProfile } from "@/lib/data";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { About } from "@/components/site/About";
import { ProjectsGrid } from "@/components/site/Projects";
import { Journey } from "@/components/site/Journey";
import { Certificates, Skills } from "@/components/site/Skills";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { SectionTitle } from "@/components/site/SectionTitle";
import { RevealObserver } from "@/components/site/Reveal";
import { GamesSection } from "@/components/site/games/GamesSection";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { primaryRole } from "@/lib/text";

// Halaman di-cache agar cepat; otomatis diperbarui setiap kali data disimpan di admin
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const p = await getProfile();
  return {
    title: { absolute: `${p.name} — ${primaryRole(p.headline)}` },
    description: p.tagline || p.bio.slice(0, 160),
    openGraph: { title: `${p.name} — ${primaryRole(p.headline)}`, description: p.tagline, images: p.avatarUrl ? [p.avatarUrl] : [] },
  };
}

export default async function Home() {
  const { profile, projects, experiences, education, skills, certificates } = await getPortfolio();

  return (
    <div className="grain">
      <ScrollProgress />
      <Navbar name={profile.name} />
      <main>
        <Hero profile={profile} />
        <Marquee items={skills.map((s) => s.name)} />
        <About profile={profile} skills={skills} />
        <section id="projects" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
          <SectionTitle label="Portofolio" title="Proyek pilihan" desc="Beberapa karya yang pernah saya kerjakan, dari ide sampai rilis." />
          <ProjectsGrid
            projects={projects.map((p) => ({
              id: p.id, slug: p.slug, title: p.title, summary: p.summary, imageUrl: p.imageUrl, category: p.category,
              tags: p.tags, liveUrl: p.liveUrl, repoUrl: p.repoUrl, year: p.year, featured: p.featured,
            }))}
          />
        </section>
        <Journey experiences={experiences} education={education} />
        <Skills skills={skills} />
        <Certificates certificates={certificates} />
        <section id="games" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
          <SectionTitle label="Mini game" title="Istirahat sejenak 🎮" desc="Dua mini game buatan saya sendiri. Coba kalahkan skor terbaikmu!" />
          <div className="reveal">
            <GamesSection />
          </div>
        </section>
        <Contact profile={profile} />
      </main>
      <Footer name={profile.name} />
      <RevealObserver />
    </div>
  );
}
