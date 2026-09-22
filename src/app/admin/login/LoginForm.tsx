"use client";

import { Loader2 } from "lucide-react";
import { login, type FormState } from "@/app/admin/actions";
import { useFormAction } from "@/lib/useFormAction";

const cls = "w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20";

export function LoginForm({ next }: { next: string }) {
  const [state, onSubmit, pending] = useFormAction(login, undefined as FormState);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <input name="email" type="email" required placeholder="Email" autoComplete="username" className={cls} />
      <input name="password" type="password" required placeholder="Password" autoComplete="current-password" className={cls} />
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-black hover:bg-accent-soft disabled:opacity-60">
        {pending && <Loader2 size={16} className="animate-spin" />} Masuk
      </button>
    </form>
  );
}
