import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getResource } from "@/lib/resources";
import { saveItem } from "@/app/admin/actions";
import { EntityForm } from "@/components/admin/EntityForm";
import { PageHeader } from "@/components/admin/PageHeader";

const defaults: Record<string, Record<string, unknown>> = {
  project: { published: true, order: 0 },
  skill: { level: 80, order: 0 },
};

export default async function ResourceEdit({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  const res = getResource(resource);
  if (!res) notFound();

  const isNew = id === "new";
  const numId = isNew ? null : Number(id);
  if (!isNew && !Number.isInteger(numId)) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const item = isNew ? defaults[res.model] ?? {} : await (prisma as any)[res.model].findUnique({ where: { id: numId } });
  if (!item) notFound();

  return (
    <>
      <Link href={`/admin/${res.key}`} className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft size={16} /> Kembali ke {res.label}
      </Link>
      <PageHeader title={isNew ? `Tambah ${res.singular}` : `Edit ${res.singular}`} />
      <div className="rounded-2xl border border-white/5 bg-ink-800 p-5 sm:p-6">
        <EntityForm fields={res.fields} values={item} action={saveItem.bind(null, res.key, numId)} />
      </div>
    </>
  );
}
