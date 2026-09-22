"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { sendMessage, type ContactState } from "@/app/actions";
import { useFormAction } from "@/lib/useFormAction";

const cls = "w-full rounded-2xl border border-white/10 bg-ink-900 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-accent/60 focus:ring-2 focus:ring-accent/20";

export function ContactForm() {
  const [state, onSubmit, pending] = useFormAction(sendMessage, undefined as ContactState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);

  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-3">
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Nama Anda" className={cls} />
        <input name="email" type="email" required placeholder="Email" className={cls} />
      </div>
      <input name="subject" placeholder="Subjek (opsional)" className={cls} />
      <textarea name="message" required rows={5} placeholder="Ceritakan tentang project atau pertanyaan Anda..." className={cls} />
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.ok && <p className="flex items-center gap-2 text-sm text-accent"><CheckCircle2 size={16} /> Pesan terkirim! Saya akan segera membalas.</p>}
      <button disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-sm font-semibold text-black transition hover:bg-accent-soft disabled:opacity-60">
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Kirim pesan
      </button>
    </form>
  );
}
