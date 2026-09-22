import { Mail, MailOpen, Trash2, Reply } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteMessage, toggleMessageRead } from "@/app/admin/actions";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export default async function MessagesPage() {
  const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader title="Pesan Masuk" desc="Pesan yang dikirim pengunjung melalui form kontak." />
      {messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-zinc-500">Belum ada pesan.</div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <article key={m.id} className={`rounded-2xl border p-5 ${m.read ? "border-white/5 bg-ink-800" : "border-accent/30 bg-accent/[0.04]"}`}>
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {m.name} {!m.read && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-black">BARU</span>}
                  </p>
                  <p className="text-sm text-zinc-400">{m.email}</p>
                </div>
                <time className="text-xs text-zinc-500">{m.createdAt.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })}</time>
              </div>
              {m.subject && <p className="mt-3 font-medium">{m.subject}</p>}
              <p className="mt-2 whitespace-pre-line text-sm text-zinc-300">{m.message}</p>
              <div className="mt-4 flex gap-2">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject ?? "Pesan dari portofolio"))}`} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:border-accent/50">
                  <Reply size={14} /> Balas
                </a>
                <ConfirmButton action={toggleMessageRead.bind(null, m.id, !m.read)} confirmText={null} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:border-accent/50">
                  {m.read ? <><Mail size={14} /> Tandai belum dibaca</> : <><MailOpen size={14} /> Tandai dibaca</>}
                </ConfirmButton>
                <ConfirmButton action={deleteMessage.bind(null, m.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-red-300 hover:border-red-500/50">
                  <Trash2 size={14} /> Hapus
                </ConfirmButton>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
