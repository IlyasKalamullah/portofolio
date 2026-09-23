"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { login, type FormState } from "@/app/admin/actions";
import { useFormAction } from "@/lib/useFormAction";
import { Typewriter } from "@/components/site/Typewriter";
import { Magnetic } from "@/components/site/Magnetic";

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return ["Selamat pagi", "☀️"];
  if (h < 15) return ["Selamat siang", "🌤️"];
  if (h < 18) return ["Selamat sore", "🌇"];
  return ["Selamat malam", "🌙"];
}

export function LoginCard({ next, firstName }: { next: string; firstName: string }) {
  const router = useRouter();
  const [state, onSubmit, pending] = useFormAction(login, undefined as FormState);
  const [show, setShow] = useState(false);
  const [shake, setShake] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [hello, setHello] = useState<string | null>(null);

  // sapaan dihitung di browser agar sesuai jam lokal
  useEffect(() => {
    const [g, e] = greeting();
    setHello(`${g}${firstName ? `, ${firstName}` : ""} ${e}`);
  }, [firstName]);

  useEffect(() => {
    if (state?.error) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(t);
    }
    if (state?.redirectTo) {
      const to = state.redirectTo;
      const t1 = setTimeout(() => setLeaving(true), 700);
      const t2 = setTimeout(() => { router.replace(to); router.refresh(); }, 1100);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [state, router]);

  const success = !!state?.redirectTo;
  const err = !!state?.error && !pending;

  return (
    <div className={clsx("login-card-in relative w-full max-w-sm transition duration-500", leaving && "scale-95 opacity-0 blur-sm", shake && "animate-shake")}>
      {/* border bercahaya berputar */}
      <div className={clsx("glow-border rounded-[1.4rem] p-px", err && "glow-border-error", success && "glow-border-success")}>
        <div className="relative rounded-[1.35rem] bg-ink-800/90 p-8 backdrop-blur-xl">
          <div className="intro mb-6 flex items-center gap-3" style={{ "--d": "150ms" } as React.CSSProperties}>
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent font-display text-lg font-bold text-black shadow-[0_0_24px_rgba(198,244,50,.45)]">
              {firstName ? firstName[0].toUpperCase() : "P"}
            </div>
            <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400">Admin</span>
          </div>

          <p className="intro min-h-[1.25rem] font-mono text-xs text-accent" style={{ "--d": "250ms" } as React.CSSProperties}>
            {hello && <Typewriter words={[hello]} once />}
          </p>
          <h1 className="intro mt-1 font-display text-2xl font-bold" style={{ "--d": "300ms" } as React.CSSProperties}>Masuk ke Dashboard</h1>
          <p className="intro mb-7 mt-1 text-sm text-zinc-400" style={{ "--d": "380ms" } as React.CSSProperties}>Kelola isi website portofolio Anda.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <Field icon={Mail} delay={460} error={err}>
              <input name="email" type="email" required placeholder="Email" autoComplete="username" className="peer w-full bg-transparent py-3 pl-10 pr-3 text-sm outline-none placeholder:text-zinc-600" />
            </Field>
            <Field icon={Lock} delay={540} error={err}>
              <input name="password" type={show ? "text" : "password"} required placeholder="Password" autoComplete="current-password" className="peer w-full bg-transparent py-3 pl-10 pr-11 text-sm outline-none placeholder:text-zinc-600" />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Sembunyikan password" : "Lihat password"}
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-white">
                <span key={String(show)} className="animate-pop">{show ? <EyeOff size={16} /> : <Eye size={16} />}</span>
              </button>
            </Field>

            <div className="min-h-[1.25rem]">
              {err && <p key={state?.t} className="animate-pop text-sm text-red-400">{state?.error}</p>}
            </div>

            <div className="intro" style={{ "--d": "620ms" } as React.CSSProperties}>
              <Magnetic className="w-full" strength={0.15}>
                <button disabled={pending || success}
                  className={clsx("relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-sm font-semibold text-black transition-all duration-300",
                    success ? "bg-emerald-400 shadow-[0_0_30px_rgba(52,211,153,.5)]" : "bg-accent hover:bg-accent-soft hover:shadow-[0_0_30px_-4px_rgba(198,244,50,.6)] disabled:opacity-80")}>
                  {success ? (
                    <span className="animate-pop flex items-center gap-2"><Check size={18} strokeWidth={3} /> Berhasil</span>
                  ) : pending ? (
                    <><Loader2 size={16} className="animate-spin" /> Memeriksa...</>
                  ) : (
                    "Masuk"
                  )}
                </button>
              </Magnetic>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, delay, error, children }: { icon: typeof Mail; delay: number; error: boolean; children: React.ReactNode }) {
  return (
    <div className="intro" style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      <div className={clsx("group relative rounded-xl border bg-ink-900/80 transition-colors focus-within:border-accent/40",
        error ? "border-red-500/50 shadow-[0_0_0_3px_rgba(239,68,68,.12)]" : "border-white/10")}>
        <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-accent" />
        {children}
        {/* garis menyala dari tengah saat fokus */}
        <span className="pointer-events-none absolute -bottom-px left-1/2 h-px w-0 bg-accent shadow-[0_0_8px_#c6f432] transition-all duration-500 group-focus-within:left-3 group-focus-within:w-[calc(100%-1.5rem)]" />
      </div>
    </div>
  );
}
