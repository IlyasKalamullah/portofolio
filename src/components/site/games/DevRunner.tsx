"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Trophy, Coffee, Gauge } from "lucide-react";
import { useBest } from "./useBest";
import { Overlay, StartButton, Stat } from "./BugSmasher";

type Obstacle = { x: number; w: number; h: number; y: number; kind: "bug" | "bug2" | "deadline" };
type Coffee = { x: number; y: number; taken: boolean };

const H = 240;              // tinggi area game (px)
const GROUND = H - 34;      // posisi tanah
const PLAYER = { x: 56, w: 26, h: 38 };
const GRAVITY = 2300;
const JUMP_V = 780;
let LIME = "#c6f432";
let GRID = "rgba(255,255,255,.05)";
let DASH = "rgba(198,244,50,.35)";
function readTheme() {
  const light = document.documentElement.classList.contains("light");
  LIME = light ? "#65a30d" : "#c6f432";
  GRID = light ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.05)";
  DASH = light ? "rgba(101,163,13,.45)" : "rgba(198,244,50,.35)";
}

export function DevRunner() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [hud, setHud] = useState({ score: 0, coffee: 0, speed: 1 });
  const [best, submitBest] = useBest("game-dev-runner-best");
  const [newBest, setNewBest] = useState(false);

  const s = useRef({
    w: 600, y: 0, vy: 0, onGround: true, dist: 0, speed: 360, bonus: 0, coffee: 0,
    obstacles: [] as Obstacle[], coffees: [] as Coffee[], nextObs: 500, nextCoffee: 900,
    t: 0, last: 0, raf: 0, visible: true, phase: "idle" as "idle" | "playing" | "over", jumpBuffer: 0,
  });

  // ---------- Gambar ----------
  const draw = useCallback(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const st = s.current;
    const W = st.w;
    readTheme();
    ctx.clearRect(0, 0, W, H);

    // grid bergerak (senada dengan hero)
    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1;
    const cell = 28;
    const off = (st.dist * 0.5) % cell;
    ctx.beginPath();
    for (let x = -off; x < W; x += cell) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, GROUND); }
    for (let y = GROUND; y > 0; y -= cell) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
    ctx.stroke();

    // tanah
    ctx.shadowColor = LIME; ctx.shadowBlur = 12;
    ctx.fillStyle = LIME; ctx.fillRect(0, GROUND, W, 2);
    ctx.shadowBlur = 0;
    ctx.fillStyle = DASH;
    const dOff = st.dist % 40;
    for (let x = -dOff; x < W; x += 40) ctx.fillRect(x, GROUND + 10, 14, 2);
    for (let x = -((st.dist * 1.3) % 90); x < W; x += 90) ctx.fillRect(x + 30, GROUND + 20, 6, 2);

    // kopi
    for (const k of st.coffees) if (!k.taken) drawCoffee(ctx, k.x, k.y, st.t);
    // rintangan
    for (const o of st.obstacles) {
      if (o.kind === "deadline") drawDeadline(ctx, o, st.t);
      else { drawBug(ctx, o.x, GROUND, o.kind === "bug2" ? 1 : 0, st.t); if (o.kind === "bug2") drawBug(ctx, o.x + 4, GROUND - 22, 1, st.t + 0.3); }
    }
    // pemain
    drawDev(ctx, PLAYER.x, GROUND - st.y, st.onGround, st.t, st.phase === "over");
  }, []);

  // ---------- Loop ----------
  const loop = useCallback((now: number) => {
    const st = s.current;
    if (st.phase !== "playing" || !st.visible) return;
    const dt = Math.min(0.034, (now - (st.last || now)) / 1000);
    st.last = now;
    st.t += dt;

    // lompat (dengan buffer input kecil agar responsif)
    if (st.jumpBuffer > 0) {
      st.jumpBuffer -= dt;
      if (st.onGround) { st.vy = JUMP_V; st.onGround = false; st.jumpBuffer = 0; }
    }
    st.vy -= GRAVITY * dt;
    st.y += st.vy * dt;
    if (st.y <= 0) { st.y = 0; st.vy = 0; st.onGround = true; }

    st.speed = Math.min(880, 360 + st.t * 14);
    const dx = st.speed * dt;
    st.dist += dx;

    for (const o of st.obstacles) o.x -= dx;
    for (const k of st.coffees) k.x -= dx;
    st.obstacles = st.obstacles.filter((o) => o.x + o.w > -20);
    st.coffees = st.coffees.filter((k) => k.x > -30);

    // spawn rintangan
    st.nextObs -= dx;
    if (st.nextObs <= 0) {
      const score = Math.floor(st.dist / 10);
      const r = Math.random();
      let o: Obstacle;
      if (score > 120 && r < 0.22) o = { x: st.w + 20, w: 34, h: 26, y: GROUND - 64, kind: "deadline" };
      else if (score > 60 && r < 0.5) o = { x: st.w + 20, w: 30, h: 44, y: GROUND - 44, kind: "bug2" };
      else o = { x: st.w + 20, w: 30, h: 22, y: GROUND - 22, kind: "bug" };
      st.obstacles.push(o);
      const gap = st.speed * (0.62 + Math.random() * 0.7);
      st.nextObs = Math.max(gap, 240);
    }
    st.nextCoffee -= dx;
    if (st.nextCoffee <= 0) {
      st.coffees.push({ x: st.w + 20, y: GROUND - 70 - Math.random() * 40, taken: false });
      st.nextCoffee = 900 + Math.random() * 1400;
    }

    // tabrakan (hitbox sedikit dikecilkan agar adil)
    const px = PLAYER.x + 5, pw = PLAYER.w - 10, py = GROUND - st.y - PLAYER.h + 6, ph = PLAYER.h - 8;
    for (const o of st.obstacles) {
      if (px < o.x + o.w - 6 && px + pw > o.x + 6 && py < o.y + o.h - 4 && py + ph > o.y + 4) {
        st.phase = "over";
        draw();
        const final = Math.floor(st.dist / 10) + st.bonus;
        setHud({ score: final, coffee: st.coffee, speed: st.speed / 360 });
        setNewBest(submitBest(final));
        setPhase("over");
        return;
      }
    }
    for (const k of st.coffees) {
      if (!k.taken && Math.abs(k.x - (PLAYER.x + PLAYER.w / 2)) < 22 && Math.abs(k.y - (GROUND - st.y - PLAYER.h / 2)) < 30) {
        k.taken = true; st.bonus += 50; st.coffee++;
      }
    }

    draw();
    if (Math.floor(st.t * 10) !== Math.floor((st.t - dt) * 10))
      setHud({ score: Math.floor(st.dist / 10) + st.bonus, coffee: st.coffee, speed: st.speed / 360 });
    st.raf = requestAnimationFrame(loop);
  }, [draw, submitBest]);

  const start = useCallback(() => {
    const st = s.current;
    Object.assign(st, { y: 0, vy: 0, onGround: true, dist: 0, speed: 360, bonus: 0, coffee: 0, obstacles: [], coffees: [], nextObs: 500, nextCoffee: 900, t: 0, last: 0, phase: "playing", jumpBuffer: 0 });
    setHud({ score: 0, coffee: 0, speed: 1 });
    setNewBest(false);
    setPhase("playing");
    cancelAnimationFrame(st.raf);
    st.raf = requestAnimationFrame(loop);
    box.current?.focus({ preventScroll: true });
  }, [loop]);

  const jump = useCallback(() => {
    const st = s.current;
    if (st.phase === "playing") st.jumpBuffer = 0.12;
    else start();
  }, [start]);

  // ukuran canvas mengikuti lebar container (tajam di layar retina)
  useEffect(() => {
    const c = canvas.current, b = box.current;
    if (!c || !b) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = b.clientWidth;
      s.current.w = w;
      c.width = w * dpr; c.height = H * dpr;
      c.style.width = `${w}px`; c.style.height = `${H}px`;
      c.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(b);
    window.addEventListener("themechange", draw);
    return () => { ro.disconnect(); window.removeEventListener("themechange", draw); };
  }, [draw]);

  // keyboard: Spasi / ↑ / W — hanya saat game aktif atau area game difokus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!["Space", "ArrowUp", "KeyW"].includes(e.code)) return;
      const focused = box.current?.contains(document.activeElement);
      if (s.current.phase === "playing" || focused) { e.preventDefault(); if (!e.repeat) jump(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  // jeda otomatis saat tidak terlihat / pindah tab
  useEffect(() => {
    const resume = () => {
      const st = s.current;
      if (st.phase === "playing" && st.visible && !document.hidden) { st.last = 0; cancelAnimationFrame(st.raf); st.raf = requestAnimationFrame(loop); }
    };
    const io = new IntersectionObserver(([e]) => { s.current.visible = e.isIntersecting; resume(); });
    if (box.current) io.observe(box.current);
    const onVis = () => { s.current.visible = !document.hidden; resume(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); cancelAnimationFrame(s.current.raf); };
  }, [loop]);

  return (
    <div className="mx-auto w-full max-w-3xl select-none">
      <div className="mb-4 grid grid-cols-3 gap-2 text-center sm:mx-auto sm:max-w-md">
        <Stat label="Skor" value={hud.score} accent />
        <Stat label="Kopi" value={hud.coffee} icon={<Coffee size={12} />} />
        <Stat label="Terbaik" value={best} icon={<Trophy size={12} />} />
      </div>
      <div
        ref={box}
        tabIndex={0}
        role="application"
        aria-label="Game Dev Runner. Tekan spasi atau ketuk untuk melompat."
        onPointerDown={(e) => { if ((e.target as HTMLElement).closest("button")) return; e.preventDefault(); box.current?.focus({ preventScroll: true }); jump(); }}
        className="relative touch-manipulation overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        style={{ height: H }}
      >
        <canvas ref={canvas} className="block" />
        {phase === "playing" && (
          <span className="pointer-events-none absolute right-3 top-2 flex items-center gap-1 font-mono text-[10px] text-zinc-500"><Gauge size={11} /> {hud.speed.toFixed(1)}x</span>
        )}
        {phase !== "playing" && (
          <Overlay>
            {phase === "idle" ? (
              <>
                <p className="font-display text-2xl font-bold">Dev Runner 🏃</p>
                <p className="mt-2 max-w-xs text-sm text-zinc-300">Lompati <span className="text-red-400">bug</span>, ambil <span className="text-amber-300">kopi</span> (+50), dan <b>jangan lompat</b> saat <span className="text-sky-300">deadline</span> terbang lewat!</p>
                <p className="mt-2 text-xs text-zinc-500">Spasi / ↑ untuk lompat · ketuk layar di HP</p>
                <StartButton onClick={start}><Play size={16} /> Mulai</StartButton>
              </>
            ) : (
              <>
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Kena bug!</p>
                <p className="mt-1 font-display text-5xl font-bold text-accent">{hud.score}</p>
                {newBest && hud.score > 0 && <p className="mt-1 animate-pop text-sm font-semibold text-accent">🏆 Rekor baru!</p>}
                <p className="mt-2 text-sm text-zinc-400">☕ {hud.coffee} kopi diminum</p>
                <StartButton onClick={start}><RotateCcw size={16} /> Main lagi</StartButton>
              </>
            )}
          </Overlay>
        )}
      </div>
    </div>
  );
}

// ---------- Sprite sederhana ----------
function drawDev(ctx: CanvasRenderingContext2D, x: number, footY: number, onGround: boolean, t: number, dead: boolean) {
  const top = footY - PLAYER.h;
  ctx.save();
  ctx.shadowColor = LIME; ctx.shadowBlur = 14;
  // kaki
  ctx.fillStyle = LIME;
  const step = onGround && !dead ? Math.sin(t * 22) * 4 : 0;
  ctx.fillRect(x + 6, footY - 9 + Math.max(0, step), 5, 9 - Math.max(0, step));
  ctx.fillRect(x + 15, footY - 9 + Math.max(0, -step), 5, 9 - Math.max(0, -step));
  // badan (hoodie)
  roundRect(ctx, x + 2, top + 13, PLAYER.w - 4, 18, 4); ctx.fill();
  // kepala
  roundRect(ctx, x + 3, top, PLAYER.w - 6, 14, 4); ctx.fill();
  ctx.shadowBlur = 0;
  // visor / kacamata
  ctx.fillStyle = "#09090b";
  roundRect(ctx, x + 7, top + 4, PLAYER.w - 11, 5, 2); ctx.fill();
  if (dead) { ctx.fillStyle = "#f87171"; ctx.fillRect(x + 9, top + 5, 3, 3); ctx.fillRect(x + 16, top + 5, 3, 3); }
  // laptop
  ctx.fillStyle = "#e4e4e7"; ctx.fillRect(x + PLAYER.w - 4, top + 19, 10, 7);
  ctx.fillStyle = "#71717a"; ctx.fillRect(x + PLAYER.w - 4, top + 26, 12, 2);
  ctx.restore();
}

function drawBug(ctx: CanvasRenderingContext2D, x: number, baseY: number, variant: number, t: number) {
  const c = variant ? "#fb923c" : "#f87171";
  const y = baseY - 11;
  const leg = Math.sin(t * 30) * 2;
  ctx.save();
  ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.lineCap = "round";
  ctx.beginPath();
  for (const [dx, dy] of [[6, -4], [15, -5], [24, -4]]) {
    ctx.moveTo(x + dx, y + dy + 6); ctx.lineTo(x + dx - 4 + leg, y + 11);
    ctx.moveTo(x + dx, y + dy + 6); ctx.lineTo(x + dx + 4 - leg, y + 11);
  }
  ctx.moveTo(x + 2, y - 4); ctx.lineTo(x - 3, y - 10);
  ctx.moveTo(x + 6, y - 6); ctx.lineTo(x + 4, y - 12);
  ctx.stroke();
  ctx.shadowColor = c; ctx.shadowBlur = 10;
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.ellipse(x + 16, y, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 4, y - 3, 5, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#09090b"; ctx.fillRect(x + 2, y - 5, 2, 2);
  ctx.globalAlpha = 0.4; ctx.fillRect(x + 16, y - 7, 1.5, 14);
  ctx.restore();
}

function drawCoffee(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const by = y + Math.sin(t * 5 + x * 0.05) * 3;
  ctx.save();
  ctx.shadowColor = "#fcd34d"; ctx.shadowBlur = 12;
  ctx.fillStyle = "#fcd34d";
  roundRect(ctx, x - 8, by - 6, 14, 14, 3); ctx.fill();
  ctx.strokeStyle = "#fcd34d"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x + 7, by + 1, 4, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(252,211,77,.6)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x - 3, by - 9); ctx.quadraticCurveTo(x - 6, by - 13, x - 3, by - 17);
  ctx.moveTo(x + 2, by - 9); ctx.quadraticCurveTo(x - 1, by - 13, x + 2, by - 17); ctx.stroke();
  ctx.restore();
}

function drawDeadline(ctx: CanvasRenderingContext2D, o: Obstacle, t: number) {
  const cx = o.x + o.w / 2, cy = o.y + o.h / 2 + Math.sin(t * 6) * 2;
  ctx.save();
  ctx.shadowColor = "#7dd3fc"; ctx.shadowBlur = 14;
  ctx.strokeStyle = "#7dd3fc"; ctx.fillStyle = "rgba(125,211,252,.15)"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0; ctx.lineWidth = 2;
  const a = t * 8;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8);
  ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 6); ctx.stroke();
  // sayap
  ctx.fillStyle = "rgba(125,211,252,.5)";
  const f = Math.sin(t * 25) * 3;
  ctx.beginPath(); ctx.ellipse(cx - 15, cy - 4 + f, 7, 3, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 15, cy - 4 + f, 7, 3, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.font = "bold 9px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#7dd3fc";
  ctx.fillText("DEADLINE", cx, cy - 18);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
