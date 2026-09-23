"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Play, RotateCcw, Timer, Trophy, Zap } from "lucide-react";
import { useBest } from "./useBest";

type Kind = "bug" | "fast" | "feature";
type Mole = { id: number; cell: number; kind: Kind; born: number; ttl: number; hit?: number };
type Pop = { id: number; cell: number; text: string; good: boolean };

const COLS = 4;
const CELLS = COLS * COLS;
const DURATION = 30_000;
const POINTS: Record<Kind, number> = { bug: 10, fast: 20, feature: -15 };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function BugSmasher() {
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [, force] = useState(0);
  const [best, submitBest] = useBest("game-bug-smasher-best");
  const [newBest, setNewBest] = useState(false);
  const [shake, setShake] = useState(false);

  const g = useRef({ start: 0, score: 0, combo: 0, hits: 0, misses: 0, moles: [] as Mole[], pops: [] as Pop[], nextSpawn: 0, id: 0 });
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  const end = useCallback(() => {
    clearInterval(timer.current);
    setNewBest(submitBest(g.current.score));
    setPhase("over");
  }, [submitBest]);

  const tick = useCallback(() => {
    const s = g.current;
    const now = performance.now();
    const elapsed = now - s.start;
    if (elapsed >= DURATION) return end();
    const p = elapsed / DURATION; // 0 → 1, makin lama makin cepat

    // bug yang tidak dipukul kabur → combo putus
    s.moles = s.moles.filter((m) => {
      if (m.hit) return now - m.hit < 260;
      if (now - m.born > m.ttl) {
        if (m.kind !== "feature") { s.combo = 0; s.misses++; }
        return false;
      }
      return true;
    });

    const maxAlive = 1 + Math.floor(p * 3);
    if (now >= s.nextSpawn && s.moles.filter((m) => !m.hit).length < maxAlive) {
      const used = new Set(s.moles.map((m) => m.cell));
      const free = Array.from({ length: CELLS }, (_, i) => i).filter((i) => !used.has(i));
      if (free.length) {
        const r = Math.random();
        const kind: Kind = r < 0.14 ? "feature" : r < 0.32 ? "fast" : "bug";
        const ttl = lerp(1300, 700, p) * (kind === "fast" ? 0.6 : 1);
        s.moles.push({ id: ++s.id, cell: free[Math.floor(Math.random() * free.length)], kind, born: now, ttl });
      }
      s.nextSpawn = now + lerp(780, 360, p) * (0.7 + Math.random() * 0.6);
    }
    force((n) => n + 1);
  }, [end]);

  const start = () => {
    g.current = { start: performance.now(), score: 0, combo: 0, hits: 0, misses: 0, moles: [], pops: [], nextSpawn: performance.now() + 400, id: 0 };
    setNewBest(false);
    setPhase("playing");
    clearInterval(timer.current);
    timer.current = setInterval(tick, 50);
  };
  useEffect(() => () => clearInterval(timer.current), []);

  const hit = (m: Mole) => {
    if (m.hit || phase !== "playing") return;
    const s = g.current;
    m.hit = performance.now();
    let pts = POINTS[m.kind];
    if (m.kind === "feature") {
      s.combo = 0;
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } else {
      s.combo++;
      s.hits++;
      pts *= s.combo >= 8 ? 3 : s.combo >= 4 ? 2 : 1;
    }
    s.score = Math.max(0, s.score + pts);
    const pop = { id: m.id, cell: m.cell, text: pts > 0 ? `+${pts}` : `${pts}`, good: pts > 0 };
    s.pops.push(pop);
    setTimeout(() => { s.pops = s.pops.filter((x) => x !== pop); }, 700);
    force((n) => n + 1);
  };

  const s = g.current;
  const left = phase === "playing" ? Math.max(0, DURATION - (performance.now() - s.start)) : phase === "over" ? 0 : DURATION;
  const mult = s.combo >= 8 ? 3 : s.combo >= 4 ? 2 : 1;

  return (
    <div className="mx-auto w-full max-w-md select-none">
      {/* HUD */}
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Skor" value={s.score} accent />
        <Stat label="Combo" value={`x${mult}`} icon={<Zap size={12} />} />
        <Stat label="Terbaik" value={best} icon={<Trophy size={12} />} />
      </div>
      <div className="mb-4 flex items-center gap-2">
        <Timer size={14} className="text-zinc-500" />
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
          <div className={clsx("h-full rounded-full transition-[width] duration-100", left < 8000 ? "bg-red-400" : "bg-accent")} style={{ width: `${(left / DURATION) * 100}%` }} />
        </div>
        <span className="w-8 text-right font-mono text-xs tabular-nums text-zinc-400">{Math.ceil(left / 1000)}s</span>
      </div>

      {/* Papan */}
      <div className={clsx("relative", shake && "animate-shake")}>
        <div className="grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-ink-900/60 p-2 sm:gap-2.5 sm:p-3">
          {Array.from({ length: CELLS }, (_, cell) => {
            const m = s.moles.find((x) => x.cell === cell);
            const pop = s.pops.find((x) => x.cell === cell);
            return (
              <button
                key={cell}
                type="button"
                aria-label={m ? (m.kind === "feature" ? "Fitur, jangan dipukul" : "Bug, pukul!") : "Kosong"}
                onPointerDown={(e) => { e.preventDefault(); if (m) hit(m); }}
                className={clsx(
                  "relative aspect-square overflow-hidden rounded-xl border transition-colors",
                  m?.hit && m.kind === "feature" ? "border-red-500/60 bg-red-500/15" : m?.hit ? "border-accent/60 bg-accent/15" : "border-white/[0.06] bg-white/[0.02]",
                )}
                style={{ backgroundImage: "radial-gradient(circle at 50% 120%, rgba(198,244,50,.06), transparent 60%)" }}
              >
                {m && (
                  <span key={m.id} className={clsx("absolute inset-0 grid place-items-center", m.hit ? "animate-splat" : "animate-mole-up")}>
                    {m.kind === "feature" ? <FeatureIcon /> : <BugIcon fast={m.kind === "fast"} />}
                  </span>
                )}
                {pop && (
                  <span key={pop.id} className={clsx("pointer-events-none absolute inset-x-0 top-1 animate-float-up text-center font-display text-sm font-bold", pop.good ? "text-accent" : "text-red-400")}>
                    {pop.text}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {phase !== "playing" && (
          <Overlay>
            {phase === "idle" ? (
              <>
                <p className="font-display text-2xl font-bold">Bug Smasher 🐛</p>
                <ul className="mt-3 space-y-1.5 text-left text-sm text-zinc-300">
                  <li className="flex items-center gap-2"><BugIcon className="h-6 w-6 shrink-0" /> Pukul bug: <b className="text-accent">+10</b></li>
                  <li className="flex items-center gap-2"><BugIcon fast className="h-6 w-6 shrink-0" /> Bug cepat: <b className="text-accent">+20</b></li>
                  <li className="flex items-center gap-2"><FeatureIcon className="h-6 w-6 shrink-0" /> Jangan pukul fitur: <b className="text-red-400">−15</b></li>
                </ul>
                <p className="mt-2 text-xs text-zinc-500">Pukul berturut-turut untuk combo x2 & x3 · 30 detik</p>
                <StartButton onClick={start}><Play size={16} /> Mulai</StartButton>
              </>
            ) : (
              <>
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Waktu habis</p>
                <p className="mt-1 font-display text-5xl font-bold text-accent">{s.score}</p>
                {newBest && s.score > 0 && <p className="mt-1 animate-pop text-sm font-semibold text-accent">🏆 Rekor baru!</p>}
                <p className="mt-2 text-sm text-zinc-400">{s.hits} bug dibasmi · {s.misses} lolos</p>
                <p className="mt-1 text-xs text-zinc-500">{rank(s.score)}</p>
                <StartButton onClick={start}><RotateCcw size={16} /> Main lagi</StartButton>
              </>
            )}
          </Overlay>
        )}
      </div>
    </div>
  );
}

function rank(score: number) {
  if (score >= 600) return "Senior Bug Hunter 🧙";
  if (score >= 350) return "Mid-level Debugger 🔧";
  if (score >= 150) return "Junior Developer 💻";
  return "Intern — coba lagi! ☕";
}

export function Stat({ label, value, icon, accent }: { label: string; value: React.ReactNode; icon?: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-2 py-2">
      <p className="flex items-center justify-center gap-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">{icon}{label}</p>
      <p className={clsx("font-display text-xl font-bold tabular-nums", accent && "text-accent")}>{value}</p>
    </div>
  );
}

export function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex animate-pop flex-col items-center justify-center rounded-2xl bg-ink/85 p-6 text-center backdrop-blur-sm">
      {children}
    </div>
  );
}

export function StartButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-accent-soft hover:shadow-[0_0_30px_-4px_rgba(198,244,50,.6)]">
      {children}
    </button>
  );
}

export function BugIcon({ fast = false, className = "h-3/5 w-3/5" }: { fast?: boolean; className?: string }) {
  const c = fast ? "#f59e0b" : "#f87171";
  return (
    <svg viewBox="0 0 48 48" className={`${className} drop-shadow-[0_0_10px_rgba(248,113,113,.45)]`} aria-hidden>
      <g stroke={c} strokeWidth="2.5" strokeLinecap="round">
        <path d="M17 12l-4-5M31 12l4-5" />
        <path d="M13 22H6M35 22h7M13 30l-6 3M35 30l6 3M14 37l-5 5M34 37l5 5" />
      </g>
      <ellipse cx="24" cy="15" rx="7" ry="5.5" fill={c} />
      <ellipse cx="24" cy="29" rx="11" ry="13" fill={c} />
      <path d="M24 17v24" stroke="#09090b" strokeWidth="2" opacity=".5" />
      <circle cx="21" cy="14" r="1.6" fill="#09090b" /><circle cx="27" cy="14" r="1.6" fill="#09090b" />
      {fast && <path d="M2 26h5M1 31h6M3 36h4" stroke={c} strokeWidth="2" strokeLinecap="round" opacity=".7" />}
    </svg>
  );
}

export function FeatureIcon({ className = "h-3/5 w-3/5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`${className} drop-shadow-[0_0_12px_rgba(167,139,250,.6)]`} aria-hidden>
      <path d="M24 4l4.5 13.5L42 22l-13.5 4.5L24 40l-4.5-13.5L6 22l13.5-4.5z" fill="#a78bfa" />
      <path d="M38 34l1.5 4.5L44 40l-4.5 1.5L38 46l-1.5-4.5L32 40l4.5-1.5z" fill="#c4b5fd" />
    </svg>
  );
}
