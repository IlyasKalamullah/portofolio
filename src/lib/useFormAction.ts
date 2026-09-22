"use client";

import { useActionState, startTransition, type FormEvent } from "react";

/**
 * Seperti useActionState, tetapi TIDAK mengosongkan isi form setelah submit
 * (React 19 otomatis me-reset form yang memakai `action={...}`),
 * sehingga isian tetap ada saat terjadi error validasi.
 */
export function useFormAction<S>(action: (state: Awaited<S>, fd: FormData) => Promise<S>, initial: Awaited<S>) {
  const [state, dispatch, pending] = useActionState(action, initial);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
  return [state, onSubmit, pending] as const;
}
