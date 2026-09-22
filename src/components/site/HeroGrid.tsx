"use client";

import { useEffect, useRef } from "react";

const CELL = 56; // ukuran kotak grid (px)

/**
 * Background grid hero yang hidup:
 * 1. grid bergeser pelan secara diagonal
 * 2. kotak-kotak acak menyala hijau lalu memudar
 * 3. garis grid bercahaya mengikuti kursor
 */
export function HeroGrid() {
  const wrap = useRef<HTMLDivElement>(null);
  const cells = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const layer = cells.current;
    if (!el || !layer) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Spotlight mengikuti kursor
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (e.clientY > r.bottom || e.clientY < r.top) return;
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
      el.style.setProperty("--spot", "1");
    };
    const onLeave = () => el.style.setProperty("--spot", "0");
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    // Kotak acak menyala — hanya saat hero terlihat
    let timer: ReturnType<typeof setInterval> | undefined;
    const spawn = () => {
      const cols = Math.ceil(el.clientWidth / CELL) + 2;
      const rows = Math.ceil(el.clientHeight / CELL) + 2;
      const c = document.createElement("span");
      c.className = "grid-cell";
      c.style.left = `${Math.floor(Math.random() * cols) * CELL}px`;
      c.style.top = `${Math.floor(Math.random() * rows) * CELL}px`;
      layer.appendChild(c);
      c.addEventListener("animationend", () => c.remove());
    };
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer);
      el.dataset.paused = e.isIntersecting ? "false" : "true";
      if (e.isIntersecting && !reduce) timer = setInterval(spawn, 450);
    });
    io.observe(el);

    return () => {
      clearInterval(timer);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrap} className="hero-grid pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* grid dasar + kotak menyala (bergerak bersama) */}
      <div className="hero-grid-fade absolute inset-0">
        <div className="grid-move grid-lines absolute" style={{ inset: -CELL }}>
          <div ref={cells} className="absolute inset-0" />
        </div>
      </div>
      {/* garis hijau terang yang hanya terlihat di sekitar kursor */}
      <div className="hero-grid-spot absolute inset-0">
        <div className="grid-move grid-lines-accent absolute" style={{ inset: -CELL }} />
      </div>
    </div>
  );
}
