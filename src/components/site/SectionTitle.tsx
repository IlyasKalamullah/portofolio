export function SectionTitle({ label, title, desc }: { label: string; title: string; desc?: string }) {
  return (
    <div className="reveal mb-12 max-w-2xl">
      <p className="section-label"><span className="h-px w-8 bg-accent" />{label}</p>
      <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h2>
      {desc && <p className="mt-4 text-zinc-400">{desc}</p>}
    </div>
  );
}
