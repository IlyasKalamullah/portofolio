import type { Certificate, Skill } from "@prisma/client";
import { ArrowUpRight, Award, FileText } from "lucide-react";
import { isPdf } from "@/lib/file";
import { Carousel } from "./Carousel";
import { delay } from "@/lib/motion";
import { SectionTitle } from "./SectionTitle";

export function Skills({ skills }: { skills: Skill[] }) {
  if (!skills.length) return null;
  const groups = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});
  return (
    <section id="skills" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <SectionTitle label="Keahlian" title="Tools & teknologi yang saya kuasai" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(groups).map(([cat, list], gi) => (
          <div key={cat} className="card spotlight reveal p-6" style={delay(gi, 120)}>
            <h3 className="mb-5 font-display text-lg font-semibold">{cat}</h3>
            <ul className="space-y-4">
              {list.map((s, i) => (
                <li key={s.id} style={delay(gi * 2 + i, 110, 14)}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {s.iconUrl && <img loading="lazy" decoding="async" src={s.iconUrl} alt="" className="h-4 w-4 object-contain" />}
                      {s.name}
                    </span>
                    <span className="font-mono text-xs text-zinc-500">{s.level}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: `${s.level}%` }}>
                      <div className="bar-fill h-full rounded-full bg-gradient-to-r from-accent/60 to-accent shadow-[0_0_10px_rgba(198,244,50,.45)]" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Certificates({ certificates }: { certificates: Certificate[] }) {
  if (!certificates.length) return null;
  return (
    <section id="certificates" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <SectionTitle label="Sertifikasi" title="Sertifikat & pencapaian" />
      <div className="reveal">
      <Carousel label="Sertifikat" slideClassName="w-[80%] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] xl:w-[calc(25%-15px)]">
        {certificates.map((c) => {
          const pdf = isPdf(c.imageUrl);
          // Link kartu: kredensial jika ada, jika tidak buka PDF sertifikat
          const href = c.credentialUrl || (pdf ? c.imageUrl : null);
          const inner = (
            <>
              {pdf ? (
                <div className="mb-5 flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-ink-700 to-ink-900">
                  <FileText size={40} className="text-accent" />
                  <span className="rounded-full bg-white/5 px-3 py-1 font-mono text-xs text-zinc-300">Lihat sertifikat (PDF)</span>
                </div>
              ) : c.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img loading="lazy" decoding="async" src={c.imageUrl} alt={c.title} className="mb-5 aspect-[4/3] w-full rounded-2xl object-cover" />
              ) : (
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent"><Award /></div>
              )}
              <p className="font-mono text-xs text-zinc-500">{c.issuer}{c.date && ` · ${c.date}`}</p>
              <h3 className="mt-2 flex items-start justify-between gap-3 font-display text-lg font-semibold">
                {c.title}
                {href && <ArrowUpRight size={18} className="shrink-0 text-zinc-500 transition group-hover:rotate-45 group-hover:text-accent" />}
              </h3>
            </>
          );
          return href ? (
            <a key={c.id} href={href} target="_blank" rel="noreferrer" className="card card-hover spotlight group block w-full p-5">{inner}</a>
          ) : (
            <div key={c.id} className="card spotlight w-full p-5">{inner}</div>
          );
        })}
      </Carousel>
      </div>
    </section>
  );
}
