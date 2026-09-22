import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Sidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const unread = await prisma.message.count({ where: { read: false } });
  return (
    <div className="min-h-screen bg-ink text-zinc-100 lg:flex">
      <Sidebar unread={unread} email={session.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
