import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-5 text-center">
      <div>
        <p className="font-display text-8xl font-bold text-accent">404</p>
        <p className="mt-2 text-zinc-400">Halaman tidak ditemukan.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-accent">Kembali ke beranda</Link>
      </div>
    </div>
  );
}
