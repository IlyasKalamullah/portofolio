"use client";

import { useRef, useState } from "react";
import { FileText, ImageUp, Loader2, X } from "lucide-react";
import { isPdf } from "@/lib/file";
import type { Field } from "@/lib/resources";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20";

export function FieldInput({ field, value }: { field: Field; value: unknown }) {
  const id = `f-${field.name}`;

  if (field.type === "checkbox") {
    return (
      <label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-zinc-300">
        <input id={id} name={field.name} type="checkbox" defaultChecked={Boolean(value)} className="h-4 w-4 accent-[#c6f432]" />
        {field.label}
      </label>
    );
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
        {field.label} {field.required && <span className="text-accent">*</span>}
      </label>
      {field.type === "textarea" ? (
        <textarea id={id} name={field.name} rows={field.name === "content" || field.name === "bio" ? 8 : 4} defaultValue={(value as string) ?? ""} placeholder={field.placeholder} required={field.required} className={inputCls} />
      ) : field.type === "image" ? (
        <ImageField id={id} name={field.name} initial={(value as string) ?? ""} />
      ) : field.type === "select" ? (
        <select id={id} name={field.name} defaultValue={(value as string) ?? ""} className={inputCls}>
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={field.name}
          type={field.type === "tags" || field.type === "url" ? "text" : field.type}
          defaultValue={field.type === "tags" ? ((value as string[]) ?? []).join(", ") : ((value as string | number) ?? "")}
          placeholder={field.placeholder}
          required={field.required}
          className={inputCls}
        />
      )}
      {field.help && <p className="text-xs text-zinc-500">{field.help}</p>}
    </div>
  );
}

function ImageField({ id, name, initial }: { id: string; name: string; initial: string }) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(original: File) {
    setBusy(true);
    setErr("");
    try {
      const file = await compressImage(original);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload gagal");
      setUrl(json.url);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="relative flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/15 bg-ink-900 sm:w-36">
        {url ? (
          <>
            {isPdf(url) ? (
              <a href={url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-xs text-zinc-300 hover:text-accent">
                <FileText size={28} /> Lihat PDF
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading="lazy" decoding="async" src={url} alt="" className="h-full w-full object-cover" />
            )}
            <button type="button" onClick={() => setUrl("")} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black" aria-label="Hapus gambar">
              <X size={12} />
            </button>
          </>
        ) : (
          <span className="text-xs text-zinc-600">Belum ada gambar</span>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <input id={id} name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://... atau upload gambar / PDF" className={inputCls} />
        <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-accent/50 hover:text-white disabled:opacity-50">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <ImageUp size={14} />}
          {busy ? "Mengupload..." : "Upload file"}
        </button>
        {err && <p className="text-xs text-red-400">{err}</p>}
      </div>
    </div>
  );
}

/**
 * Perkecil & kompres foto di browser sebelum di-upload (maks. 1920px, WebP/JPEG).
 * File kecil, SVG, GIF, dan PDF dikirim apa adanya.
 */
async function compressImage(file: File, maxDim = 1920, quality = 0.82): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 300 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const toBlob = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, quality));
    let blob = await toBlob("image/webp");
    if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg");
    if (!blob || blob.size >= file.size) return file;
    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type: blob.type });
  } catch {
    return file;
  }
}
