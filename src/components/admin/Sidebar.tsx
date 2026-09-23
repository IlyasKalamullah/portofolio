"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Award, Briefcase, FileUser, ExternalLink, FolderKanban, GraduationCap, LayoutDashboard, LogOut, Mail, Menu, Sparkles, User, X } from "lucide-react";
import clsx from "clsx";
import { logout } from "@/app/admin/actions";
import { ThemeToggle } from "@/components/ThemeToggle";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/profile", label: "Profil", icon: User },
  { href: "/admin/projects", label: "Proyek", icon: FolderKanban },
  { href: "/admin/experience", label: "Pengalaman", icon: Briefcase },
  { href: "/admin/education", label: "Pendidikan", icon: GraduationCap },
  { href: "/admin/skills", label: "Skill", icon: Sparkles },
  { href: "/admin/certificates", label: "Sertifikat", icon: Award },
  { href: "/admin/cv", label: "Buat CV", icon: FileUser },
  { href: "/admin/messages", label: "Pesan", icon: Mail },
];

export function Sidebar({ unread, email }: { unread: number; email: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const content = (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-center justify-between gap-1">
        <Link href="/admin" className="flex items-center gap-2 whitespace-nowrap px-2 font-display text-base font-bold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-black">P</span>
        Admin Porto
      </Link>
        <ThemeToggle className="hidden h-9 w-9 lg:grid" />
      </div>
      <nav className="flex-1 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? path === href : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon size={18} className={active ? "text-accent" : ""} />
              <span className="flex-1">{label}</span>
              {label === "Pesan" && unread > 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-black">{unread}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-white/5 pt-4">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white">
          <ExternalLink size={18} /> Lihat website
        </Link>
        <form action={logout}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-red-300">
            <LogOut size={18} /> Keluar
          </button>
        </form>
        <p className="truncate px-3 pt-2 text-xs text-zinc-600">{email}</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-ink/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-display font-bold">Admin Porto</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setOpen(true)} aria-label="Buka menu"><Menu /></button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-64 border-r border-white/5 bg-ink-900 p-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="mb-2 ml-auto block text-zinc-400" aria-label="Tutup menu"><X /></button>
            {content}
          </aside>
        </div>
      )}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-white/5 bg-ink-900 p-4 lg:block">{content}</aside>
    </>
  );
}
