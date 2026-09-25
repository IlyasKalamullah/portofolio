"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import clsx from "clsx";

const btn = "inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold transition hover:border-white/40 hover:bg-white/5";

/** Tombol "Unduh CV". Jika ada CV Indonesia & Inggris, tampil menu pilihan bahasa. */
export function CvButton({ id, en }: { id?: string | null; en?: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  const only = id && en ? null : id || en;
  if (!id && !en) return null;
  if (only) {
    return (
      <a href={only} target="_blank" rel="noreferrer" className={btn}>
        <Download size={16} /> Unduh CV
      </a>
    );
  }

  const options = [
    { href: id!, flag: "🇮🇩", label: "Bahasa Indonesia" },
    { href: en!, flag: "🇬🇧", label: "English" },
  ];

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} className={btn}>
        <Download size={16} /> Unduh CV
        <ChevronDown size={14} className={clsx("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div role="menu" className="absolute left-0 top-full z-30 mt-2 w-64 origin-top-left animate-pop overflow-hidden rounded-2xl border border-white/10 bg-ink-800/95 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {options.map((o) => (
            <a key={o.href} role="menuitem" href={o.href} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white">
              <span className="text-lg leading-none">{o.flag}</span>
              <span className="flex-1 whitespace-nowrap">{o.label}</span>
              <span className="font-mono text-[10px] uppercase text-zinc-500">PDF</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
