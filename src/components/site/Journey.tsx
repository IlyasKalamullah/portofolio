import { Briefcase, GraduationCap } from "lucide-react";
import type { Education, Experience } from "@prisma/client";
import { SectionTitle } from "./SectionTitle";
import { delay } from "@/lib/motion";

export function Journey({ experiences, education }: { experiences: Experience[]; education: Education[] }) {
  if (!experiences.length && !education.length) return null;
  return (
    <section id="experience" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <SectionTitle label="Perjalanan" title="Pengalaman & pendidikan" />
      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h3 className="reveal mb-6 flex items-center gap-2 font-display text-lg font-semibold text-zinc-300"><Briefcase size={18} className="text-accent" /> Pengalaman</h3>
          <ol className="relative space-y-4 border-l border-white/10 pl-6">
            {experiences.map((e, i) => (
              <li key={e.id} className="reveal relative" style={delay(i, 120)}>
                <span className={`absolute -left-[31px] top-7 h-3 w-3 rounded-full border-2 border-ink ${e.current ? "bg-accent shadow-[0_0_0_4px_rgba(198,244,50,.2)]" : "bg-zinc-600"}`} />
                <div className="card spotlight card-hover p-6">
                  <div className="flex flex-wrap items-start gap-4">
                    {e.logoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img loading="lazy" decoding="async" src={e.logoUrl} alt={e.company} className="h-11 w-11 rounded-xl bg-white object-contain p-1" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-xl font-semibold">{e.role}</h4>
                      <p className="text-zinc-400">{e.company}{e.location && <span className="text-zinc-600"> · {e.location}</span>}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs text-zinc-400">{e.startDate} — {e.current ? "Sekarang" : e.endDate || "—"}</p>
                      {e.type && <span className="mt-1 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400">{e.type}</span>}
                    </div>
                  </div>
                  {e.description && (
                    <ul className="mt-4 space-y-1.5 text-sm text-zinc-400">
                      {e.description.split("\n").filter((l) => l.trim()).map((l, i) => (
                        <li key={i} className="flex gap-2"><span className="text-accent">▹</span>{l.replace(/^[-•*]\s*/, "")}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
            {!experiences.length && <p className="text-sm text-zinc-500">Belum ada data pengalaman.</p>}
          </ol>
        </div>
        <div>
          <h3 className="reveal mb-6 flex items-center gap-2 font-display text-lg font-semibold text-zinc-300"><GraduationCap size={18} className="text-accent" /> Pendidikan</h3>
          <div className="space-y-4">
            {education.map((ed, i) => (
              <div key={ed.id} className="card spotlight reveal p-6" style={delay(i + 1, 120)}>
                <p className="font-mono text-xs text-accent">{ed.startDate} — {ed.endDate || "Sekarang"}</p>
                <h4 className="mt-2 font-display text-lg font-semibold">{ed.school}</h4>
                <p className="text-sm text-zinc-400">{ed.degree}{ed.field && ` · ${ed.field}`}</p>
                {ed.description && <p className="mt-3 whitespace-pre-line text-sm text-zinc-500">{ed.description}</p>}
              </div>
            ))}
            {!education.length && <p className="text-sm text-zinc-500">Belum ada data pendidikan.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
