"use client";

import { useEffect, useState } from "react";

/** Mengetik & menghapus beberapa teks secara bergantian. */
export function Typewriter({ words, className }: { words: string[]; className?: string }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState(words[0] ?? "");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (words.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const word = words[i % words.length];
    let delay = deleting ? 35 : 70;
    if (!deleting && text === word) delay = 1800; // jeda saat kata lengkap
    if (deleting && text === "") delay = 300;

    const t = setTimeout(() => {
      if (!deleting && text === word) setDeleting(true);
      else if (deleting && text === "") {
        setDeleting(false);
        setI((n) => (n + 1) % words.length);
      } else setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, i, words]);

  return (
    <span className={className} aria-label={words.join(", ")}>
      <span aria-hidden>{text}</span>
      {words.length > 1 && <span aria-hidden className="ml-0.5 inline-block w-[2px] animate-blink self-stretch bg-accent align-[-0.1em]">&nbsp;</span>}
    </span>
  );
}
