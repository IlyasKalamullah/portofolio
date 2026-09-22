import type { CSSProperties } from "react";

/** Jeda animasi reveal (stagger) untuk item ke-i */
export const delay = (i: number, step = 90, max = 6) => ({ "--d": `${Math.min(i, max) * step}ms` }) as CSSProperties;
