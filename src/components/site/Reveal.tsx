"use client";

import { useEffect } from "react";

/**
 * Mengaktifkan animasi .reveal saat elemen masuk viewport (termasuk elemen yang
 * ditambahkan belakangan, mis. setelah filter proyek) + efek spotlight kursor.
 */
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
    const observeAll = (root: ParentNode) =>
      root.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    observeAll(document);

    const mo = new MutationObserver((muts) => {
      for (const m of muts)
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches(".reveal:not(.in)")) io.observe(n);
          observeAll(n);
        });
    });
    mo.observe(document.body, { childList: true, subtree: true });

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
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return null;
}

