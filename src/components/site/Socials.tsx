import { Globe, Mail } from "lucide-react";
import type { Profile } from "@prisma/client";
import { GithubIcon, InstagramIcon, LinkedinIcon, WhatsappIcon, XIcon } from "./Icons";

export function socialLinks(p: Profile) {
  return [
    p.github && { href: p.github, label: "GitHub", icon: GithubIcon },
    p.linkedin && { href: p.linkedin, label: "LinkedIn", icon: LinkedinIcon },
    p.instagram && { href: p.instagram, label: "Instagram", icon: InstagramIcon },
    p.twitter && { href: p.twitter, label: "X", icon: XIcon },
    p.phone && { href: `https://wa.me/${p.phone.replace(/\D/g, "")}`, label: "WhatsApp", icon: WhatsappIcon },
    p.website && { href: p.website, label: "Website", icon: Globe },
    p.email && { href: `mailto:${p.email}`, label: "Email", icon: Mail },
  ].filter(Boolean) as { href: string; label: string; icon: React.ComponentType<{ size?: number }> }[];
}

export function Socials({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-wrap gap-2">
      {socialLinks(profile).map(({ href, label, icon: Icon }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent">
          <Icon size={18} />
        </a>
      ))}
    </div>
  );
}
