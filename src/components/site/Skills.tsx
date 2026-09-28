import type { Certificate, Skill } from "@prisma/client";
import { CertificatesSection } from "./CertificatesSection";
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
      <SectionTitle label="Sertifikasi & kegiatan" title="Sertifikat, organisasi & kegiatan" />
      <CertificatesSection
        items={certificates.map((c) => ({
          id: c.id, type: c.type, title: c.title, issuer: c.issuer, date: c.date, role: c.role,
          description: c.description, credentialUrl: c.credentialUrl, imageUrl: c.imageUrl,
        }))}
      />
    </section>
  );
}
