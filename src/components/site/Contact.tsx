import { Mail, MapPin, Phone } from "lucide-react";
import type { Profile } from "@prisma/client";
import { ContactForm } from "./ContactForm";
import { Socials } from "./Socials";

export function Contact({ profile }: { profile: Profile }) {
  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <div className="card reveal relative overflow-hidden p-6 sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-[100px]" />
        <div className="relative grid gap-12 lg:grid-cols-2">
          <div>
            <p className="section-label"><span className="h-px w-8 bg-accent" />Kontak</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-6xl">
              Mari bekerja <span className="text-accent">bersama.</span>
            </h2>
            <p className="mt-4 max-w-md text-zinc-400">Punya ide project, tawaran kerja, atau sekadar ingin menyapa? Kirim pesan dan saya akan membalas secepatnya.</p>
            <ul className="mt-8 space-y-4 text-sm">
              {profile.email && (
                <li><a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-zinc-300 hover:text-accent"><span className="grid h-10 w-10 place-items-center rounded-full bg-white/5"><Mail size={16} /></span>{profile.email}</a></li>
              )}
              {profile.phone && (
                <li><a href={`https://wa.me/${profile.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-zinc-300 hover:text-accent"><span className="grid h-10 w-10 place-items-center rounded-full bg-white/5"><Phone size={16} /></span>+{profile.phone.replace(/\D/g, "")}</a></li>
              )}
              {profile.location && (
                <li className="flex items-center gap-3 text-zinc-300"><span className="grid h-10 w-10 place-items-center rounded-full bg-white/5"><MapPin size={16} /></span>{profile.location}</li>
              )}
            </ul>
            <div className="mt-8"><Socials profile={profile} /></div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
