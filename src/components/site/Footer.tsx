export function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-zinc-500 sm:flex-row">
        <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
        <a href="#top" className="hover:text-white">Kembali ke atas ↑</a>
      </div>
    </footer>
  );
}
