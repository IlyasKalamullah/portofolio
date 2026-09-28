"use client";

import { useState } from "react";
import clsx from "clsx";
import { ArrowUpRight, Award, FileText, Users } from "lucide-react";
import { isPdf } from "@/lib/file";
import { isActivity } from "@/lib/certificates";
import { Carousel } from "./Carousel";

export type CertCard = {
  id: number;
  type: string;
  title: string;
  issuer: string;
  date: string | null;
  role: string | null;
  description: string;
  credentialUrl: string | null;
  imageUrl: string | null;
};

const TABS = [
  { key: "all", label: "Semua" },
  { key: "cert", label: "Sertifikasi" },
  { key: "activity", label: "Organisasi & Kegiatan" },
] as const;

export function CertificatesSection({ items }: { items: CertCard[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const counts = { all: items.length, cert: items.filter((c) => !isActivity(c.type)).length, activity: items.filter((c) => isActivity(c.type)).length };
  const list = tab === "all" ? items : items.filter((c) => (tab === "activity") === isActivity(c.type));
  const showTabs = counts.cert > 0 && counts.activity > 0;

  return (
    <>
      {showTabs && (
        <div className="reveal mb-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={clsx("inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition",
                tab === t.key ? "border-accent bg-accent text-black" : "border-white/10 text-zinc-400 hover:border-white/30 hover:text-white")}>
              {t.label}
              <span className={clsx("rounded-full px-1.5 text-[10px] font-semibold", tab === t.key ? "bg-black/15" : "bg-white/10")}>{counts[t.key]}</span>
            </button>
          ))}
        </div>
      )}
      <div className="reveal">
        <Carousel key={tab} label="Sertifikat" slideClassName="w-[80%] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] xl:w-[calc(25%-15px)]">
          {list.map((c) => <Card key={c.id} c={c} />)}
        </Carousel>
      </div>
    </>
  );
}

function Card({ c }: { c: CertCard }) {
  const pdf = isPdf(c.imageUrl);
  const activity = isActivity(c.type);
  // Link kartu: kredensial jika ada, jika tidak buka PDF sertifikat
  const href = c.credentialUrl || (pdf ? c.imageUrl : null);
  const points = c.description.split("\n").map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  const Icon = activity ? Users : Award;

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
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent"><Icon /></div>
      )}
      <span className={clsx("mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        activity ? "bg-violet-500/15 text-violet-300 light:text-violet-700" : "bg-accent/15 text-accent")}>
        <Icon size={11} /> {activity ? "Organisasi & Kegiatan" : "Sertifikasi"}
      </span>
      <p className="font-mono text-xs text-zinc-500">{c.issuer}{c.date && ` · ${c.date}`}</p>
      <h3 className="mt-2 flex items-start justify-between gap-3 font-display text-lg font-semibold">
        {c.title}
        {href && <ArrowUpRight size={18} className="shrink-0 text-zinc-500 transition group-hover:rotate-45 group-hover:text-accent" />}
      </h3>
      {c.role && <p className="mt-1 text-sm font-medium text-zinc-300">{c.role}</p>}
      {points.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-zinc-400">
          {points.slice(0, 3).map((pt, i) => (
            <li key={i} className="flex gap-2"><span className="text-accent">▹</span><span className="line-clamp-2">{pt}</span></li>
          ))}
        </ul>
      )}
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="card card-hover spotlight group block w-full p-5">{inner}</a>
  ) : (
    <div className="card spotlight w-full p-5">{inner}</div>
  );
}
