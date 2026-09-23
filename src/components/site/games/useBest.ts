"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Skor terbaik pengunjung, disimpan di browser mereka sendiri. */
export function useBest(key: string) {
  const [best, setBest] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    try {
      ref.current = Number(localStorage.getItem(key)) || 0;
      setBest(ref.current);
    } catch { /* storage diblokir, abaikan */ }
  }, [key]);
  /** Simpan skor; mengembalikan true jika rekor baru. */
  const submit = useCallback((score: number) => {
    if (score <= ref.current) return false;
    ref.current = score;
    setBest(score);
    try { localStorage.setItem(key, String(score)); } catch { /* abaikan */ }
    return true;
  }, [key]);
  return [best, submit] as const;
}
