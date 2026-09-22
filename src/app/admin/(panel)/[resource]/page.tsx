import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Trash2, Star, EyeOff, FileText } from "lucide-react";
import { isPdf } from "@/lib/file";
import { prisma } from "@/lib/prisma";
import { getResource } from "@/lib/resources";
import { deleteItem } from "@/app/admin/actions";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export default async function ResourceList({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { resource } = await params;
  const { saved } = await searchParams;
  const res = getResource(resource);
  if (!res) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: Record<string, any>[] = await (prisma as any)[res.model].findMany({ orderBy: [{ order: "asc" }, { id: "desc" }] });

  return (
    <>
      <PageHeader title={res.label} desc={`${items.length} data`}>
        <Link href={`/admin/${res.key}/new`} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-soft">
          <Plus size={16} /> Tambah {res.singular}
        </Link>
      </PageHeader>

      {saved && <p className="mb-4 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">Data berhasil disimpan.</p>}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-zinc-500">
          Belum ada data. Klik <b>Tambah {res.singular}</b> untuk memulai.
        </div>
      ) : (
        <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-ink-800">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-4 py-3">
              {res.imageField && (
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-ink-700">
                  {isPdf(item[res.imageField]) ? (
                    <FileText size={20} className="text-zinc-400" />
                  ) : item[res.imageField] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img loading="lazy" decoding="async" src={item[res.imageField]} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-medium">
                  {item[res.titleField]}
                  {item.featured && <Star size={14} className="fill-accent text-accent" />}
                  {item.published === false && <EyeOff size={14} className="text-zinc-500" />}
                </p>
                {res.subtitleField && <p className="truncate text-sm text-zinc-500">{item[res.subtitleField]}</p>}
              </div>
              {res.model === "skill" && <span className="hidden text-sm text-zinc-400 sm:block">{item.level}%</span>}
              <span className="hidden text-xs text-zinc-600 sm:block">#{item.order}</span>
              <Link href={`/admin/${res.key}/${item.id}`} className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white" title="Edit">
                <Pencil size={16} />
              </Link>
              <ConfirmButton action={deleteItem.bind(null, res.key, item.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400" title="Hapus">
                <Trash2 size={16} />
              </ConfirmButton>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
