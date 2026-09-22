import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Login Admin" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getSession()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-4 text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-ink-800/80 p-8 backdrop-blur">
        <div className="mb-6 grid h-10 w-10 place-items-center rounded-xl bg-accent font-display font-bold text-black">P</div>
        <h1 className="font-display text-2xl font-bold">Masuk ke Admin</h1>
        <p className="mb-6 mt-1 text-sm text-zinc-400">Kelola isi website portofolio Anda.</p>
        <LoginForm next={next ?? ""} />
      </div>
    </div>
  );
}
