import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/session";
import { getProfile } from "@/lib/data";
import { HeroGrid } from "@/components/site/HeroGrid";
import { LoginCard } from "./LoginCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Login Admin" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  // Sudah login → langsung ke dashboard. Kecuali saat render ulang dari aksi login,
  // supaya animasi "Berhasil" sempat tampil sebelum pindah halaman.
  const fromLoginAction = (await headers()).has("next-action");
  if (!fromLoginAction && (await getSession())) redirect("/admin");
  const { next } = await searchParams;
  const profile = await getProfile().catch(() => null);
  const firstName = profile?.name.split(" ")[0] ?? "";

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-4 text-white">
      <HeroGrid />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-violet-600/20 blur-[120px]" />
      <LoginCard next={next ?? ""} firstName={firstName} />
    </div>
  );
}
