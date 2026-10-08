"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Download, ExternalLink, FileText, Globe, Info, Languages, Loader2, PencilLine, RotateCcw, Save, Undo2, Eye, Cloud, CloudOff } from "lucide-react";
import type { CvData } from "@/lib/cv/data";
import { CvCanvas } from "./CvCanvas";

type Section = "summary" | "experience" | "education" | "skills" | "projects" | "activities" | "certificates";
const SECTIONS: { key: Section; label: string }[] = [
  { key: "summary", label: "Ringkasan" },
  { key: "experience", label: "Pengalaman" },
  { key: "education", label: "Pendidikan" },
  { key: "skills", label: "Skill" },
  { key: "projects", label: "Proyek" },
  { key: "activities", label: "Organisasi & Kegiatan" },
  { key: "certificates", label: "Sertifikat" },
];

const input = "w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm outline-none transition placeholder:text-zinc-600 focus:border-accent/60 focus:ring-2 focus:ring-accent/20";

export function CvBuilder({
  defaultTitle, defaultSummary, projects, certificates, resumeUrl, resumeUrlEn,
}: {
  defaultTitle: string;
  defaultSummary: string;
  projects: { id: number; title: string; year: string | null }[];
  certificates: { id: number; title: string; issuer: string; type: string }[];
  resumeUrl: string | null;
  resumeUrlEn: string | null;
}) {
  const [lang, setLang] = useState<"id" | "en">("id");
  const [sections, setSections] = useState<Section[]>(SECTIONS.map((s) => s.key));
  const [title, setTitle] = useState(defaultTitle);
  const [summary, setSummary] = useState(defaultSummary);
  const [projectIds, setProjectIds] = useState<number[]>(projects.slice(0, 4).map((p) => p.id));
  const [certificateIds, setCertificateIds] = useState<number[]>(certificates.map((c) => c.id));

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"" | "pdf" | "docx" | "publish">("");
  const [msg, setMsg] = useState<{ ok?: string; error?: string; url?: string }>({});
  const urlRef = useRef<string | null>(null);
  const [links, setLinks] = useState({ id: resumeUrl, en: resumeUrlEn });
  const [rev, setRev] = useState(0); // naik setelah koreksi terjemahan disimpan → pratinjau diperbarui

  const options = { lang, sections: SECTIONS.map((s) => s.key).filter((k) => sections.includes(k)), title, summary, projectIds, certificateIds };
  const optKey = JSON.stringify(options);

  // ===== Kanvas editor =====
  const [view, setView] = useState<"edit" | "pdf">("edit");
  const [base, setBase] = useState<CvData | null>(null);          // CV hasil susun otomatis dari data
  const [draft, setDraft] = useState<CvData | null>(null);        // CV hasil edit manual (disimpan per bahasa)
  const [draftAt, setDraftAt] = useState<Date | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [history, setHistory] = useState<CvData[]>([]);
  const [baseLoading, setBaseLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const effective = draft ?? base;
  const draftKey = draft ? JSON.stringify(draft) : "";

  // susun CV otomatis dari opsi
  useEffect(() => {
    let cancel = false;
    setBaseLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/cv/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(options) });
        const json = await res.json();
        if (!cancel && res.ok) setBase(json.data);
      } finally {
        if (!cancel) setBaseLoading(false);
      }
    }, 500);
    return () => { cancel = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optKey, rev]);

  // muat hasil edit manual saat bahasa berganti
  useEffect(() => {
    let cancel = false;
    setDraft(null); setHistory([]); setSaveState("idle");
    fetch(`/api/cv/draft?lang=${lang}`).then((r) => r.json()).then((j) => {
      if (cancel) return;
      setDraft(j.data ?? null);
      setDraftAt(j.updatedAt ? new Date(j.updatedAt) : null);
    }).catch(() => {});
    return () => { cancel = true; };
  }, [lang]);

  const persist = (data: CvData) => {
    clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/cv/draft", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang, data }) });
        if (!res.ok) throw new Error();
        setDraftAt(new Date((await res.json()).updatedAt));
        setSaveState("saved");
      } catch { setSaveState("error"); }
    }, 800);
  };
  const onCanvasChange = (next: CvData) => {
    if (effective) setHistory((h) => [...h.slice(-49), effective]);
    setDraft(next);
    persist(next);
  };
  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setDraft(prev);
    persist(prev);
  };
  const resetDraft = async () => {
    if (!confirm("Hapus semua edit manual dan susun ulang CV dari data terbaru?")) return;
    clearTimeout(saveTimer.current);
    await fetch("/api/cv/draft", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang }) });
    setDraft(null); setHistory([]); setDraftAt(null); setSaveState("idle");
  };

  const request = async (format: "pdf" | "docx") => {
    const res = await fetch("/api/cv", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...options, format, data: draft ?? undefined }) });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Gagal membuat CV");
    const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? `CV.${format}`;
    return { blob: await res.blob(), name };
  };

  // Pratinjau PDF diperbarui saat tab PDF dibuka / opsi / hasil edit berubah
  useEffect(() => {
    if (view !== "pdf") return;
    let cancel = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const { blob } = await request("pdf");
        if (cancel) return;
        const url = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setPreview(url);
      } catch (e) {
        if (!cancel) setMsg({ error: (e as Error).message });
      } finally {
        if (!cancel) setLoading(false);
      }
    }, 600);
    return () => { cancel = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optKey, rev, view, draftKey]);
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  const download = async (format: "pdf" | "docx") => {
    setBusy(format); setMsg({});
    try {
      const { blob, name } = await request(format);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) { setMsg({ error: (e as Error).message }); }
    setBusy("");
  };

  const publish = async () => {
    setBusy("publish"); setMsg({});
    try {
      const res = await fetch("/api/cv/publish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...options, data: draft ?? undefined }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (lang === "en") setLinks((l) => ({ ...l, en: json.url })); else setLinks((l) => ({ ...l, id: json.url }));
      setMsg({ ok: `CV ${lang === "en" ? "bahasa Inggris" : "bahasa Indonesia"} terpasang di tombol "Unduh CV" website.`, url: json.url });
    } catch (e) { setMsg({ error: (e as Error).message }); }
    setBusy("");
  };

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
      {/* ===== Opsi ===== */}
      <div className="space-y-5">
        {draft && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200 light:text-amber-800">
            <p className="font-medium">Mode edit manual aktif ({lang === "en" ? "English" : "Indonesia"})</p>
            <p className="mt-1 text-xs opacity-90">CV memakai hasil edit Anda di kanvas. Perubahan opsi & data admin di bawah baru diterapkan setelah Anda menyusun ulang.</p>
            <button type="button" onClick={resetDraft} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 px-2.5 py-1 text-xs hover:bg-amber-500/10">
              <RotateCcw size={12} /> Susun ulang dari data
            </button>
          </div>
        )}
        <Card title="Bahasa CV">
          <div className="grid grid-cols-2 gap-2">
            {(["id", "en"] as const).map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)}
                className={clsx("rounded-lg border px-3 py-2 text-sm transition", lang === l ? "border-accent bg-accent text-black" : "border-white/10 text-zinc-400 hover:text-white")}>
                {l === "id" ? "🇮🇩 Indonesia" : "🇬🇧 English"}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            {lang === "en" ? "Semua isi diterjemahkan otomatis ke bahasa Inggris. Periksa & koreksi hasilnya di panel Terjemahan." : "Isi CV sesuai data yang Anda tulis di admin."}
          </p>
        </Card>

        <Card title="Posisi yang dilamar">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} placeholder="mis. Frontend Developer" />
          <p className="mt-2 text-xs text-zinc-500">Samakan dengan judul lowongan agar skor ATS lebih tinggi.</p>
        </Card>

        <Card title="Ringkasan profesional" action={summary !== defaultSummary && <Reset onClick={() => setSummary(defaultSummary)} />}>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={5} className={input} />
          <p className="mt-2 text-xs text-zinc-500">{summary.length}/1500 · Masukkan kata kunci dari lowongan yang dituju.</p>
        </Card>

        <Card title="Bagian yang ditampilkan">
          <div className="grid grid-cols-2 gap-2">
            {SECTIONS.map((s) => (
              <Check key={s.key} checked={sections.includes(s.key)} onChange={() => setSections(toggle(sections, s.key))} label={s.label} />
            ))}
          </div>
        </Card>

        {lang === "en" && <TranslationPanel optKey={optKey} options={options} rev={rev} onSaved={() => setRev((n) => n + 1)} />}

        {sections.includes("projects") && projects.length > 0 && (
          <Card title={`Proyek (${projectIds.length} dipilih)`}>
            <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
              {projects.map((p) => (
                <Check key={p.id} checked={projectIds.includes(p.id)} onChange={() => setProjectIds(toggle(projectIds, p.id))} label={p.title} hint={p.year ?? undefined} />
              ))}
            </div>
            <p className="mt-2 text-xs text-zinc-500">Idealnya 2–4 proyek paling relevan.</p>
          </Card>
        )}

        {(sections.includes("certificates") || sections.includes("activities")) && certificates.length > 0 && (
          <Card title={`Sertifikat & kegiatan (${certificateIds.length} dipilih)`}>
            <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
              {certificates.map((c) => (
                <Check key={c.id} checked={certificateIds.includes(c.id)} onChange={() => setCertificateIds(toggle(certificateIds, c.id))} label={c.title} hint={c.type === "Organisasi & Kegiatan" ? "Kegiatan" : "Sertifikasi"} />
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ===== Pratinjau & aksi ===== */}
      <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <div className="flex flex-wrap gap-2">
          <ActionButton primary onClick={() => download("pdf")} busy={busy === "pdf"} icon={<Download size={16} />}>Unduh PDF</ActionButton>
          <ActionButton onClick={() => download("docx")} busy={busy === "docx"} icon={<FileText size={16} />}>Unduh Word</ActionButton>
          <ActionButton onClick={publish} busy={busy === "publish"} icon={<Globe size={16} />}>Pasang di website ({lang === "en" ? "EN" : "ID"})</ActionButton>
        </div>

        {msg.error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{msg.error}</p>}
        {msg.ok && (
          <p className="flex flex-wrap items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
            <CheckCircle2 size={16} /> {msg.ok}
            {msg.url && <a href={msg.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">Lihat <ExternalLink size={12} /></a>}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex rounded-full border border-white/10 bg-ink-900/70 p-1" role="tablist">
            {([["edit", "Edit di kanvas", PencilLine], ["pdf", "Pratinjau PDF", Eye]] as const).map(([k, label, Icon]) => (
              <button key={k} type="button" role="tab" aria-selected={view === k} onClick={() => setView(k)}
                className={clsx("inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition", view === k ? "bg-accent font-medium text-black" : "text-zinc-400 hover:text-white")}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
          {view === "edit" && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              {saveState === "saving" && <span className="inline-flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Menyimpan...</span>}
              {saveState === "saved" && <span className="inline-flex items-center gap-1 text-accent"><Cloud size={12} /> Tersimpan</span>}
              {saveState === "error" && <span className="inline-flex items-center gap-1 text-red-400"><CloudOff size={12} /> Gagal menyimpan</span>}
              {saveState === "idle" && draft && draftAt && <span>Edit terakhir {draftAt.toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</span>}
              <button type="button" onClick={undo} disabled={!history.length} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-zinc-300 hover:border-accent/50 disabled:opacity-40">
                <Undo2 size={12} /> Undo
              </button>
              {draft && (
                <button type="button" onClick={resetDraft} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-zinc-300 hover:border-red-500/50 hover:text-red-400">
                  <RotateCcw size={12} /> Reset
                </button>
              )}
            </div>
          )}
        </div>

        {view === "edit" && (
          <div className="relative rounded-2xl border border-white/10 bg-ink-700 p-3 sm:p-6">
            <p className="mb-3 text-xs text-zinc-500">
              Klik teks untuk mengedit · <b>Enter</b> = poin/baris baru · <b>Backspace</b> di poin/baris kosong = hapus · baris kosong = spasi di CV · arahkan kursor ke item/bagian untuk memindah atau menghapus
            </p>
            {effective ? (
              <CvCanvas data={effective} onChange={onCanvasChange} />
            ) : (
              <div className="grid h-[60vh] place-items-center text-sm text-zinc-500"><Loader2 className="animate-spin" /></div>
            )}
            {baseLoading && !draft && effective && (
              <span className="absolute right-4 top-3 inline-flex items-center gap-1.5 text-xs text-zinc-500"><Loader2 size={12} className="animate-spin" /> menyusun ulang...</span>
            )}
          </div>
        )}

        <div className={clsx("relative overflow-hidden rounded-2xl border border-white/10 bg-ink-700", view !== "pdf" && "hidden")}>
          {preview && <iframe src={`${preview}#toolbar=0&navpanes=0&view=FitH`} title="Pratinjau CV" className="h-[78vh] min-h-[520px] w-full bg-[#fff]" />}
          {preview && (
            <a href={preview} target="_blank" rel="noreferrer" className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-xs text-[#fff] backdrop-blur hover:bg-black">
              <ExternalLink size={12} /> Buka di tab baru
            </a>
          )}
          {loading && (
            <div className="absolute inset-0 grid place-items-center bg-ink/40 backdrop-blur-[2px]">
              <span className="inline-flex items-center gap-2 rounded-full bg-ink-800 px-4 py-2 text-sm text-zinc-300"><Loader2 size={16} className="animate-spin" /> Menyusun CV...</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 bg-ink-800 p-4 text-sm text-zinc-400">
          <p className="mb-2 flex items-center gap-2 font-medium text-white"><Info size={16} className="text-accent" /> Kenapa CV ini ramah ATS?</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Satu kolom, tanpa tabel, ikon, foto, atau grafik yang sulit dibaca mesin.</li>
            <li>Teks asli (bisa di-copy), font standar, dan judul bagian yang dikenali ATS.</li>
            <li>Tips: isi deskripsi pengalaman dengan poin berisi angka/hasil, mis. &quot;Meningkatkan kecepatan halaman 40%&quot;.</li>
          </ul>
          <p className="mt-3 text-xs">
            CV di website saat ini:{" "}
            {links.id ? <a href={links.id} target="_blank" rel="noreferrer" className="text-accent underline">🇮🇩 Indonesia</a> : <span>🇮🇩 belum ada</span>}
            {" · "}
            {links.en ? <a href={links.en} target="_blank" rel="noreferrer" className="text-accent underline">🇬🇧 English</a> : <span>🇬🇧 belum ada</span>}
          </p>
          <p className="mt-1 text-xs">Pilih bahasa di atas lalu klik &quot;Pasang di website&quot; untuk masing-masing versi.</p>
        </div>
      </div>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/5 bg-ink-800 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-400">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Check({ checked, onChange, label, hint }: { checked: boolean; onChange: () => void; label: string; hint?: string }) {
  return (
    <label className={clsx("flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition", checked ? "border-accent/40 bg-accent/[0.06] text-white" : "border-white/10 text-zinc-400")}>
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-[#9bd40f]" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {hint && <span className="shrink-0 text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

function Reset({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white">
      <RotateCcw size={12} /> Kembalikan
    </button>
  );
}

function ActionButton({ children, onClick, busy, icon, primary }: { children: React.ReactNode; onClick: () => void; busy: boolean; icon: React.ReactNode; primary?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={busy}
      className={clsx("inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60",
        primary ? "bg-accent text-black hover:bg-accent-soft" : "border border-white/10 hover:border-accent/50")}>
      {busy ? <Loader2 size={16} className="animate-spin" /> : icon} {children}
    </button>
  );
}

type Tr = { source: string; text: string; auto: boolean; failed?: boolean };

/** Daftar teks yang diterjemahkan otomatis + kolom untuk mengoreksi. */
function TranslationPanel({ optKey, options, rev, onSaved }: { optKey: string; options: object; rev: number; onSaved: () => void }) {
  const [items, setItems] = useState<Tr[]>([]);
  const [engine, setEngine] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/cv/translations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(options) });
        const json = await res.json();
        if (!cancel && res.ok) { setItems([...json.translations].sort((a: Tr, b: Tr) => Number(!!b.failed) - Number(!!a.failed))); setEngine(json.engine); setErrors(json.errors ?? []); setEdits({}); }
      } finally {
        if (!cancel) setLoading(false);
      }
    }, 700);
    return () => { cancel = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optKey, rev]);

  const changed = Object.entries(edits).filter(([src, txt]) => txt.trim() && txt !== items.find((i) => i.source === src)?.text);
  const failed = items.filter((i) => i.failed).length;

  const save = async () => {
    setSaving(true);
    await fetch("/api/cv/translations", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: changed.map(([source, text]) => ({ source, text })) }) });
    setSaving(false);
    onSaved();
  };
  const reset = async (source: string) => {
    await fetch("/api/cv/translations", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source }) });
    onSaved();
  };

  return (
    <Card
      title={`Terjemahan${items.length ? ` (${items.length} teks)` : ""}`}
      action={loading ? <Loader2 size={14} className="animate-spin text-zinc-500" /> : <Languages size={14} className="text-zinc-500" />}
    >
      <p className="mb-3 text-xs text-zinc-500">
        Mesin: {engine === "gemini" ? "Gemini AI (cadangan: Google Translate)" : "Google Translate"}. Nama perusahaan, sekolah, proyek, sertifikat & teknologi tidak diterjemahkan.
        Hasil disimpan, jadi cukup dikoreksi sekali.
      </p>
      {failed > 0 && (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {failed} teks gagal diterjemahkan otomatis. Isi terjemahannya manual di bawah, atau buka ulang halaman ini untuk mencoba lagi.
          {errors.length > 0 && (
            <span className="mt-1.5 block break-words font-mono text-[11px] opacity-80">Penyebab: {errors.join(" · ")}</span>
          )}
        </p>
      )}
      <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {items.map((it) => {
          const value = edits[it.source] ?? it.text;
          return (
            <div key={it.source} className="rounded-lg border border-white/5 bg-ink-900/60 p-2.5">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <p className="line-clamp-2 text-xs text-zinc-500">{it.source}</p>
                <span className={clsx("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  it.failed ? "bg-red-500/15 text-red-400" : it.auto ? "bg-white/5 text-zinc-400" : "bg-accent/15 text-accent")}>
                  {it.failed ? "Gagal" : it.auto ? "Otomatis" : "Dikoreksi"}
                </span>
              </div>
              <textarea
                value={value}
                onChange={(e) => setEdits({ ...edits, [it.source]: e.target.value })}
                rows={Math.min(5, Math.max(1, Math.ceil(value.length / 48)))}
                className="w-full resize-y rounded-md border border-white/10 bg-ink-800 px-2.5 py-1.5 text-sm outline-none focus:border-accent/60"
              />
              {!it.auto && (
                <button type="button" onClick={() => reset(it.source)} className="mt-1 inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-white">
                  <RotateCcw size={11} /> Terjemahkan ulang otomatis
                </button>
              )}
            </div>
          );
        })}
        {!loading && items.length === 0 && <p className="text-sm text-zinc-500">Tidak ada teks yang perlu diterjemahkan.</p>}
      </div>
      {changed.length > 0 && (
        <button type="button" onClick={save} disabled={saving}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-soft disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan {changed.length} koreksi
        </button>
      )}
    </Card>
  );
}
