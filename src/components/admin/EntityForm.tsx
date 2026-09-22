"use client";

import { Loader2, Save } from "lucide-react";
import type { Field } from "@/lib/resources";
import type { FormState } from "@/app/admin/actions";
import { FieldInput } from "./FieldInput";
import { useFormAction } from "@/lib/useFormAction";

export function EntityForm({
  fields,
  values,
  action,
  submitLabel = "Simpan",
}: {
  fields: Field[];
  values: Record<string, unknown>;
  action: (state: FormState, fd: FormData) => Promise<FormState>;
  submitLabel?: string;
}) {
  const [state, onSubmit, pending] = useFormAction(action, undefined as FormState);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
            <FieldInput field={f} value={values[f.name]} />
          </div>
        ))}
      </div>

      {state?.error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.error}</p>}
      {state?.ok && <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">{state.ok}</p>}

      <div className="sticky bottom-0 -mx-1 flex justify-end border-t border-white/5 bg-ink/80 px-1 py-4 backdrop-blur">
        <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-accent-soft disabled:opacity-60">
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {pending ? "Menyimpan..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
