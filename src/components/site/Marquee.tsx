export function Marquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const list = [...items, ...items];
  return (
    <div className="relative border-y border-white/5 bg-ink-900 py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-900 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-900 to-transparent" />
      <div className="flex overflow-hidden">
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
          {list.map((s, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-2xl font-semibold text-zinc-500">
              {s} <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
