"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { Magnetic } from "./Magnetic";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "#about", label: "Tentang" },
  { href: "#projects", label: "Proyek" },
  { href: "#experience", label: "Pengalaman" },
  { href: "#skills", label: "Skill" },
  { href: "#games", label: "Game" },
  { href: "#contact", label: "Kontak" },
];

export function Navbar({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav
        className={clsx(
          "mx-auto flex max-w-5xl items-center justify-between rounded-full border px-3 py-2 transition-all duration-300",
          scrolled ? "border-white/10 bg-ink-900/80 shadow-2xl shadow-black/40 backdrop-blur-xl" : "border-transparent bg-transparent",
        )}
      >
        <a href="#top" className="flex items-center gap-2 pl-1 font-display font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm text-black">{initials}</span>
          <span className="hidden sm:block">{name}</span>
        </a>
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-full px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white">{l.label}</a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Magnetic className="hidden md:inline-block" strength={0.25}>
            <a href="#contact" className="block rounded-full bg-white px-5 py-2 text-sm font-semibold text-ink transition hover:bg-accent hover:text-black">Hubungi saya</a>
          </Magnetic>
          <button className="p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
      </nav>
      {open && (
        <div className="mx-auto mt-2 max-w-5xl rounded-3xl border border-white/10 bg-ink-900/95 p-3 backdrop-blur-xl md:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-zinc-300 hover:bg-white/5">{l.label}</a>
          ))}
        </div>
      )}
    </header>
  );
}
