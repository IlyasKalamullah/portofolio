"use client";

import { useEffect } from "react";

/** Mengaktifkan animasi .reveal saat elemen masuk viewport + efek spotlight kursor pada .spotlight */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    const onMove = (ev: PointerEvent) => {
      const el = (ev.target as HTMLElement).closest?.(".spotlight") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${ev.clientX - r.left}px`);
      el.style.setProperty("--y", `${ev.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return null;
}
