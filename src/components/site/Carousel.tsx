"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { delay } from "@/lib/motion";

/**
 * Carousel horizontal: swipe di HP, tombol panah + titik navigasi di desktop.
 * `slideClassName` menentukan lebar tiap slide (berapa kartu per layar).
 */
export function Carousel({
  children,
  slideClassName,
  label,
}: {
  children: React.ReactNode;
  slideClassName: string;
  label: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const slides = Children.toArray(children);
  const [state, setState] = useState({ prev: false, next: false, active: 0, perView: 1 });

  const update = useCallback(() => {
    const el = track.current;
    if (!el || !el.children.length) return;
    const first = el.children[0] as HTMLElement;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = first.offsetWidth + gap;
    const perView = Math.max(1, Math.round((el.clientWidth + gap) / step));
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setState({
      prev: el.scrollLeft > 4,
      next: !atEnd,
      active: atEnd ? slides.length - 1 : Math.round(el.scrollLeft / step),
      perView,
    });
  }, [slides.length]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const goTo = (i: number) => {
    const el = track.current;
    const target = el?.children[Math.max(0, Math.min(i, slides.length - 1))] as HTMLElement | undefined;
    // track berposisi relative, jadi offsetLeft slide dihitung dari awal track
    if (el && target) el.scrollTo({ left: target.offsetLeft - (el.children[0] as HTMLElement).offsetLeft, behavior: "smooth" });
  };
  const move = (dir: 1 | -1) => goTo(state.active + dir * state.perView);

  const pages = Math.max(1, slides.length - state.perView + 1);
  const scrollable = state.prev || state.next;

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={track}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
        }}
        className="no-scrollbar relative flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        {slides.map((s, i) => (
          <div key={i} style={delay(i % 4, 110)} className={clsx("reveal flex shrink-0 snap-start", slideClassName)} aria-roledescription="slide" aria-label={`${i + 1} dari ${slides.length}`}>
            {s}
          </div>
        ))}
      </div>

      {scrollable && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {pages <= 12 ? (
              Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Ke slide ${i + 1}`}
                  className={clsx("h-1.5 rounded-full transition-all", Math.min(state.active, pages - 1) === i ? "w-8 bg-accent" : "w-1.5 bg-white/20 hover:bg-white/40")}
                />
              ))
            ) : (
              <span className="font-mono text-xs text-zinc-500">{Math.min(state.active + 1, slides.length)} / {slides.length}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => move(-1)} disabled={!state.prev} aria-label="Sebelumnya"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-zinc-300 transition hover:border-accent/60 hover:text-accent disabled:pointer-events-none disabled:opacity-30">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => move(1)} disabled={!state.next} aria-label="Berikutnya"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-zinc-300 transition hover:border-accent/60 hover:text-accent disabled:pointer-events-none disabled:opacity-30">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
