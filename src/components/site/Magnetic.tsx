"use client";

import { useRef } from "react";

/** Elemen di dalamnya sedikit "tertarik" mengikuti kursor (hanya di perangkat bermouse). */
export function Magnetic({ children, strength = 0.35, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.translate = `${x}px ${y}px`;
  };
  const leave = () => { if (ref.current) ref.current.style.translate = "0 0"; };

  return (
    <span ref={ref} onPointerMove={move} onPointerLeave={leave}
      className={`inline-block transition-[translate] duration-300 ease-out ${className ?? ""}`}>
      {children}
    </span>
  );
}
