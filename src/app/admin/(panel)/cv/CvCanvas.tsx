"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import type { CvData, CvItem } from "@/lib/cv/data";

/**
 * Kanvas editor CV: halaman A4 yang meniru tampilan PDF.
 * Klik teks mana pun untuk mengetik. Enter di poin = poin baru, Backspace di poin kosong = hapus poin.
 */

const PAGE_W = 794; // A4 @96dpi
const PAGE_H = 1123;
const PT = 96 / 72; // 1pt dalam px

type Path = string; // mis. "s1.i0.b2"
type Update = (fn: (d: CvData) => void) => void;

export function CvCanvas({ data, onChange }: { data: CvData; onChange: (d: CvData) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(PAGE_H);
  const [focusPath, setFocusPath] = useState<Path | null>(null);

  // skala kertas mengikuti lebar area
  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => {
      if (wrap.current) setScale(Math.min(1, wrap.current.clientWidth / PAGE_W));
      if (page.current) setHeight(Math.max(PAGE_H, page.current.offsetHeight));
    });
    if (wrap.current) ro.observe(wrap.current);
    if (page.current) ro.observe(page.current);
    return () => ro.disconnect();
  }, []);

  const update: Update = (fn) => {
    const next = structuredClone(data);
    fn(next);
    onChange(next);
  };
  const pages = Math.ceil(height / PAGE_H);

  return (
    <div ref={wrap} className="w-full">
      <div style={{ height: height * scale }} className="relative">
        <div
          ref={page}
          className="cv-paper absolute left-0 top-0 origin-top-left bg-[#fff] text-[#111] shadow-2xl shadow-black/30"
          style={{
            width: PAGE_W, minHeight: PAGE_H, transform: `scale(${scale})`,
            padding: `${40 * PT}px ${48 * PT}px`, fontFamily: "Helvetica, Arial, sans-serif",
            fontSize: 10 * PT, lineHeight: 1.4,
          }}
        >
          {/* garis perkiraan batas halaman */}
          {Array.from({ length: pages - 1 }, (_, i) => (
            <div key={i} className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-[#c9c9c9]" style={{ top: PAGE_H * (i + 1) }}>
              <span className="absolute right-2 -top-5 rounded bg-[#eee] px-1.5 text-[11px] text-[#777]">± halaman {i + 2}</span>
            </div>
          ))}

          <Editable path="name" focusPath={focusPath} setFocusPath={setFocusPath} value={data.name} placeholder="Nama"
            onCommit={(v) => update((d) => { d.name = v; })}
            style={{ fontSize: 20 * PT, fontWeight: 700, lineHeight: 1.2, display: "block" }} />
          <Editable path="title" focusPath={focusPath} setFocusPath={setFocusPath} value={data.title} placeholder="Posisi / headline"
            onCommit={(v) => update((d) => { d.title = v; })}
            style={{ fontSize: 11.5 * PT, marginTop: 2 * PT, color: "#333", display: "block" }} />

          {/* kontak */}
          <div className="group/c flex flex-wrap items-center" style={{ fontSize: 9.5 * PT, marginTop: 6 * PT, color: "#333" }}>
            {data.contacts.map((c, i) => (
              <span key={i} className="group/ci relative inline-flex items-center">
                <Editable path={`c${i}`} focusPath={focusPath} setFocusPath={setFocusPath} value={c} placeholder="kontak"
                  onCommit={(v) => update((d) => { if (v) d.contacts[i] = v; else d.contacts.splice(i, 1); })} />
                <MiniBtn title="Hapus kontak" className="ml-0.5 opacity-0 group-hover/ci:opacity-100" onClick={() => update((d) => { d.contacts.splice(i, 1); })}><X size={10} /></MiniBtn>
                {i < data.contacts.length - 1 && <span className="whitespace-pre">{"  |  "}</span>}
              </span>
            ))}
            <MiniBtn title="Tambah kontak" className="ml-2 opacity-0 group-hover/c:opacity-100"
              onClick={() => { update((d) => { d.contacts.push(""); }); setFocusPath(`c${data.contacts.length}`); }}>
              <Plus size={10} /> kontak
            </MiniBtn>
          </div>

          {data.sections.map((sec, si) => {
            // jenis bagian: teks (ringkasan), baris (skill/sertifikasi), atau item (pengalaman, proyek, dll.)
            const kind = sec.key === "summary" ? "text" : sec.key === "skills" || sec.key === "certificates" ? "lines" : "items";
            return (
            <section key={`${sec.key}-${si}`} className="group/s relative" style={{ marginTop: 14 * PT }}>
              <Toolbar className="group-hover/s:opacity-100" style={{ top: -2, right: -54 }}
                onUp={si > 0 ? () => update((d) => swap(d.sections, si, si - 1)) : undefined}
                onDown={si < data.sections.length - 1 ? () => update((d) => swap(d.sections, si, si + 1)) : undefined}
                onDelete={() => confirm(`Hapus bagian "${sec.label}" dari CV ini?`) && update((d) => { d.sections.splice(si, 1); })}
                label="bagian" />

              <Editable path={`s${si}.label`} focusPath={focusPath} setFocusPath={setFocusPath} value={sec.label} placeholder="Judul bagian"
                onCommit={(v) => update((d) => { d.sections[si].label = v || sec.label; })}
                style={{ display: "block", fontWeight: 700, fontSize: 11 * PT, textTransform: "uppercase", letterSpacing: 0.6 * PT, paddingBottom: 3 * PT, marginBottom: 6 * PT, borderBottom: `${0.8 * PT}px solid #111` }} />

              {kind === "text" && (
                <Editable multiline path={`s${si}.text`} focusPath={focusPath} setFocusPath={setFocusPath} value={sec.text ?? ""} placeholder="Tulis ringkasan..."
                  onCommit={(v) => update((d) => { d.sections[si].text = v; })} style={{ display: "block" }} />
              )}

              {kind === "lines" && (
                <div className="group/l relative">
                  {(sec.lines ?? []).map((l, li) => (
                    <div key={li} className="group/li relative" style={{ marginBottom: 2 * PT }}>
                      <Editable path={`s${si}.l${li}`} focusPath={focusPath} setFocusPath={setFocusPath} value={l} placeholder="Baris..."
                        onCommit={(v) => update((d) => { d.sections[si].lines![li] = v; })}
                        onEnter={(v) => { update((d) => { d.sections[si].lines![li] = v; d.sections[si].lines!.splice(li + 1, 0, ""); }); setFocusPath(`s${si}.l${li + 1}`); }}
                        onBackspaceEmpty={() => { update((d) => { d.sections[si].lines!.splice(li, 1); }); setFocusPath(li > 0 ? `s${si}.l${li - 1}` : null); }} />
                      <MiniBtn title="Hapus baris" className="absolute -right-6 top-0.5 opacity-0 group-hover/li:opacity-100" onClick={() => update((d) => { d.sections[si].lines!.splice(li, 1); })}><X size={10} /></MiniBtn>
                    </div>
                  ))}
                  <AddBtn className="-bottom-4 group-hover/s:opacity-100" onClick={() => { update((d) => { (d.sections[si].lines ??= []).push(""); }); setFocusPath(`s${si}.l${sec.lines?.length ?? 0}`); }}>baris</AddBtn>
                </div>
              )}

              {kind === "items" && (sec.items ?? []).map((it, ii) => (
                <ItemView key={ii} it={it} si={si} ii={ii} count={sec.items!.length} update={update} focusPath={focusPath} setFocusPath={setFocusPath} />
              ))}
              {kind === "items" && (
                <AddBtn className={clsx("-bottom-4 left-auto right-0 group-hover/s:opacity-100", !sec.items?.length && "opacity-100")} onClick={() => {
                  update((d) => { (d.sections[si].items ??= []).push({ heading: "", bullets: [] }); });
                  setFocusPath(`s${si}.i${sec.items?.length ?? 0}.h`);
                }}>item</AddBtn>
              )}
            </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ItemView({ it, si, ii, count, update, focusPath, setFocusPath }: {
  it: CvItem; si: number; ii: number; count: number; update: Update; focusPath: Path | null; setFocusPath: (p: Path | null) => void;
}) {
  const p = `s${si}.i${ii}`;
  const set = (fn: (x: CvItem) => void) => update((d) => fn(d.sections[si].items![ii]));
  const ed = { focusPath, setFocusPath };
  return (
    <div className="cv-item group/i relative rounded-sm outline-1 outline-offset-4 outline-[#c6f43200] hover:outline hover:outline-[#9bd40f66]" style={{ marginBottom: 8 * PT }}>
      <Toolbar className="group-hover/i:opacity-100" style={{ top: 0, right: -54 }}
        onUp={ii > 0 ? () => update((d) => swap(d.sections[si].items!, ii, ii - 1)) : undefined}
        onDown={ii < count - 1 ? () => update((d) => swap(d.sections[si].items!, ii, ii + 1)) : undefined}
        onDelete={() => update((d) => { d.sections[si].items!.splice(ii, 1); })}
        label="item" />
      <div className="flex items-start justify-between">
        <Editable {...ed} path={`${p}.h`} value={it.heading} placeholder="Judul"
          onCommit={(v) => set((x) => { x.heading = v; })}
          style={{ fontWeight: 700, fontSize: 10.5 * PT, flex: 1, paddingRight: 8 * PT }} />
        <Editable {...ed} path={`${p}.m`} value={it.meta ?? ""} placeholder="Tanggal" optional
          onCommit={(v) => set((x) => { x.meta = v || undefined; })}
          style={{ fontSize: 9.5 * PT, color: "#333" }} />
      </div>
      <Editable {...ed} path={`${p}.sub`} value={it.sub ?? ""} placeholder="Keterangan (perusahaan, peran, teknologi...)" optional
        onCommit={(v) => set((x) => { x.sub = v || undefined; })}
        style={{ display: "block", fontSize: 9.5 * PT, color: "#333", marginTop: 1 * PT }} />
      <Editable {...ed} multiline path={`${p}.d`} value={it.desc ?? ""} placeholder="Deskripsi singkat (opsional)" optional
        onCommit={(v) => set((x) => { x.desc = v || undefined; })}
        style={{ display: "block", marginTop: 2 * PT }} />
      {it.bullets.map((b, bi) => (
        <div key={bi} className="group/b relative flex" style={{ marginTop: 2 * PT }}>
          <span style={{ width: 10 * PT, flexShrink: 0 }}>•</span>
          <Editable {...ed} path={`${p}.b${bi}`} value={b} placeholder="Poin..." style={{ flex: 1 }}
            onCommit={(v) => set((x) => { x.bullets[bi] = v; })}
            onEnter={(v) => { set((x) => { x.bullets[bi] = v; x.bullets.splice(bi + 1, 0, ""); }); setFocusPath(`${p}.b${bi + 1}`); }}
            onBackspaceEmpty={() => { set((x) => { x.bullets.splice(bi, 1); }); setFocusPath(bi > 0 ? `${p}.b${bi - 1}` : null); }} />
          <MiniBtn title="Hapus poin" className="absolute -right-6 top-0.5 opacity-0 group-hover/b:opacity-100" onClick={() => set((x) => { x.bullets.splice(bi, 1); })}><X size={10} /></MiniBtn>
        </div>
      ))}
      <Editable {...ed} path={`${p}.n`} value={it.note ?? ""} placeholder="Tautan / catatan (opsional)" optional
        onCommit={(v) => set((x) => { x.note = v || undefined; })}
        style={{ display: "block", fontSize: 9 * PT, color: "#444", marginTop: 2 * PT }} />
      <AddBtn className="-bottom-3.5 group-hover/i:opacity-100" onClick={() => { set((x) => { x.bullets.push(""); }); setFocusPath(`${p}.b${it.bullets.length}`); }}>poin</AddBtn>
    </div>
  );
}

/** Teks yang bisa diedit langsung (contentEditable, hanya teks polos). */
function Editable({
  value, onCommit, onEnter, onBackspaceEmpty, multiline, placeholder, optional, style, path, focusPath, setFocusPath,
}: {
  value: string;
  onCommit: (v: string) => void;
  onEnter?: (v: string) => void;
  onBackspaceEmpty?: () => void;
  multiline?: boolean;
  placeholder?: string;
  optional?: boolean;
  style?: React.CSSProperties;
  path: Path;
  focusPath: Path | null;
  setFocusPath: (p: Path | null) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const dirty = useRef(false); // true hanya jika user mengetik di elemen ini sejak fokus
  const { display, ...css } = style ?? {};
  const block = display === "block";

  // sinkronkan teks dari data (kecuali sedang diketik user).
  // Penting: setelah poin ditambah/dihapus, elemen yang sama bisa mewakili poin lain.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && el.innerText !== value && (document.activeElement !== el || !dirty.current)) el.innerText = value;
  }, [value]);

  // fokus otomatis (mis. setelah Enter membuat poin baru)
  useEffect(() => {
    const el = ref.current;
    if (!el || focusPath !== path) return;
    el.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
    setFocusPath(null);
  }, [focusPath, path, setFocusPath]);

  const read = () => (ref.current?.innerText ?? "").replace(/ /g, " ").replace(multiline ? /[ \t]+/g : /\s+/g, " ").trim();

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={multiline}
      aria-label={placeholder}
      data-placeholder={placeholder}
      className={clsx("cv-edit", block && "cv-block", optional && "cv-opt")}
      style={css}
      spellCheck={false}
      onFocus={() => { dirty.current = false; }}
      onInput={() => { dirty.current = true; }}
      onBlur={() => {
        const v = read();
        if (dirty.current && v !== value) onCommit(v);
        dirty.current = false;
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, multiline ? text : text.replace(/\s*\n\s*/g, " "));
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") (e.currentTarget as HTMLElement).blur();
        if (e.key === "Enter" && !(multiline && e.shiftKey)) {
          if (multiline && !onEnter) return; // Enter biasa = baris baru di teks panjang
          e.preventDefault();
          if (onEnter) { dirty.current = false; onEnter(read()); }
          else (e.currentTarget as HTMLElement).blur();
        }
        if (e.key === "Backspace" && onBackspaceEmpty && read() === "") {
          e.preventDefault();
          dirty.current = false;
          onBackspaceEmpty();
        }
      }}
    />
  );
}

function Toolbar({ onUp, onDown, onDelete, label, className, style }: {
  onUp?: () => void; onDown?: () => void; onDelete: () => void; label: string; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div className={clsx("cv-tool absolute z-10 flex flex-col gap-0.5 opacity-0 transition-opacity", className)} style={style}>
      <MiniBtn title={`Naikkan ${label}`} disabled={!onUp} onClick={onUp}><ArrowUp size={12} /></MiniBtn>
      <MiniBtn title={`Turunkan ${label}`} disabled={!onDown} onClick={onDown}><ArrowDown size={12} /></MiniBtn>
      <MiniBtn title={`Hapus ${label}`} danger onClick={onDelete}><Trash2 size={12} /></MiniBtn>
    </div>
  );
}

function MiniBtn({ children, onClick, title, className, danger, disabled }: {
  children: React.ReactNode; onClick?: () => void; title: string; className?: string; danger?: boolean; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "cv-tool inline-flex items-center gap-0.5 rounded border px-1 py-0.5 text-[10px] leading-none transition-opacity disabled:opacity-20",
        danger ? "border-[#f3c2c2] bg-[#fff5f5] text-[#c53030] hover:bg-[#ffe3e3]" : "border-[#dcdcdc] bg-[#fafafa] text-[#555] hover:bg-[#ecf9c8]",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Tombol tambah yang melayang (tidak memakan tempat → tata letak kanvas = PDF). */
function AddBtn({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <MiniBtn title={`Tambah ${children}`} onClick={onClick} className={clsx("absolute left-0 z-10 opacity-0 shadow-sm", className)}>
      <Plus size={10} /> {children}
    </MiniBtn>
  );
}

function swap<T>(list: T[], a: number, b: number) {
  [list[a], list[b]] = [list[b], list[a]];
}
