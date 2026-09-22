export function PageHeader({ title, desc, children }: { title: string; desc?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {desc && <p className="mt-1 text-sm text-zinc-400">{desc}</p>}
      </div>
      {children}
    </div>
  );
}
