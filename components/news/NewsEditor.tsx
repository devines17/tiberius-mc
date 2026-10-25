"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, ImagePlus, PenLine, Trash2, X } from "lucide-react";
import { NEWS_CATEGORIES, NEWS_DEFAULT_COVER, NEWS_LIMITS, categoryLabel, formatNewsDate } from "@/lib/news/config";
import { NewsBody, NewsCover, newsHref } from "@/components/news/parts";

export type EditorNews = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  cover: string;
  event_at: string | null;
  published_at: string | null;
  created_at: string;
};

type Draft = { id: string | null; title: string; category: string; summary: string; body: string; eventAt: string; cover: string };

const EMPTY: Draft = { id: null, title: "", category: "annuncio", summary: "", body: "", eventAt: "", cover: NEWS_DEFAULT_COVER };

/** ISO → valore per <input type="datetime-local"> nell'ora locale del browser. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Editor delle news per il Founder: elenco, scrittura, anteprima, pubblicazione. */
export function NewsEditor({ items }: { items: EditorNews[] }) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const [imgBusy, setImgBusy] = useState(false);

  /** Carica un'immagine e la inserisce nel testo dove c'è il cursore, su una riga da sola. */
  async function insertImage(f: File) {
    setImgBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.set("action", "immagine");
      fd.set("file", f);
      const res = await fetch("/api/news", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Caricamento non riuscito.");
      const ta = bodyRef.current;
      const at = ta ? ta.selectionStart : d.body.length;
      const before = d.body.slice(0, at).replace(/\s*$/, "");
      const after = d.body.slice(at).replace(/^\s*/, "");
      const line = `![](${data.url})`;
      set("body", [before, line, after].filter(Boolean).join("\n\n"));
    } catch (e) {
      setMsg({ kind: "error", text: e instanceof Error ? e.message : "Caricamento non riuscito." });
    } finally {
      setImgBusy(false);
    }
  }

  const current = d.id ? items.find((n) => n.id === d.id) : undefined;
  const coverShown = file ? URL.createObjectURL(file) : removeCover ? NEWS_DEFAULT_COVER : d.cover;

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setD((prev) => ({ ...prev, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: "" }));
  }

  function edit(n: EditorNews) {
    setD({ id: n.id, title: n.title, category: n.category, summary: n.summary, body: n.body, eventAt: toLocalInput(n.event_at), cover: n.cover });
    setFile(null);
    setRemoveCover(false);
    setPreview(false);
    setErrors({});
    setMsg(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reset() {
    setD(EMPTY);
    setFile(null);
    setRemoveCover(false);
    setPreview(false);
    setErrors({});
  }

  async function send(action: "salva" | "pubblica" | "ritira" | "elimina", target?: EditorNews) {
    if (action === "elimina" && !window.confirm(`Eliminare per sempre "${target?.title ?? d.title}"?`)) return;
    setBusy(true);
    setMsg(null);
    const fd = new FormData();
    fd.set("action", action);
    const id = target?.id ?? d.id;
    if (id) fd.set("id", id);
    if (action === "salva" || action === "pubblica") {
      fd.set("title", d.title);
      fd.set("category", d.category);
      fd.set("summary", d.summary);
      fd.set("body", d.body);
      fd.set("event_at", d.category === "evento" && d.eventAt ? new Date(d.eventAt).toISOString() : "");
      if (file) fd.set("cover", file);
      if (removeCover) fd.set("remove_cover", "1");
    }
    try {
      const res = await fetch("/api/news", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.details ?? {});
        setMsg({ kind: "error", text: data.error ?? "Operazione non riuscita." });
        return;
      }
      const text = { salva: "Bozza salvata.", pubblica: "News pubblicata.", ritira: "News ritirata: ora è una bozza.", elimina: "News eliminata." }[action];
      setMsg({ kind: "ok", text });
      if (action === "elimina" && (!target || target.id === d.id)) reset();
      else if ((action === "salva" || action === "pubblica") && data.id) setD((prev) => ({ ...prev, id: data.id }));
      setFile(null);
      setRemoveCover(false);
      router.refresh();
    } catch {
      setMsg({ kind: "error", text: "Connessione non riuscita. Il testo è ancora qui: riprova." });
    } finally {
      setBusy(false);
    }
  }

  const label = "mb-2 block text-sm font-bold text-white/80";
  const err = (k: string) => errors[k] && <p className="mt-1.5 text-sm text-[#ff8a80]">{errors[k]}</p>;

  return (
    <div className="grid gap-10">
      {/* Modulo */}
      <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="grid gap-6 rounded-2xl bg-white/[0.03] p-6 ring-1 ring-inset ring-white/10 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl">{d.id ? "Modifica news" : "Nuova news"}</h2>
          {d.id && (
            <button type="button" onClick={reset} className="text-sm font-bold text-white/60 hover:text-white">
              + scrivine una nuova
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_14rem]">
          <div>
            <label htmlFor="n-title" className={label}>Titolo</label>
            <input id="n-title" className="field" value={d.title} maxLength={NEWS_LIMITS.title} onChange={(e) => set("title", e.target.value)} aria-invalid={Boolean(errors.title)} />
            {err("title")}
          </div>
          <div>
            <label htmlFor="n-cat" className={label}>Categoria</label>
            <select id="n-cat" className="field" value={d.category} onChange={(e) => set("category", e.target.value)}>
              {NEWS_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {d.category === "evento" && (
          <div className="max-w-xs">
            <label htmlFor="n-ev" className={label}>Giorno e ora dell&apos;evento</label>
            <input id="n-ev" type="datetime-local" className="field" value={d.eventAt} onChange={(e) => set("eventAt", e.target.value)} aria-invalid={Boolean(errors.event_at)} />
            {err("event_at")}
          </div>
        )}

        <div>
          <label htmlFor="n-sum" className={label}>
            Riassunto <span className="font-medium text-white/45">({d.summary.length}/{NEWS_LIMITS.summary}, si vede nelle schede)</span>
          </label>
          <textarea id="n-sum" className="field min-h-20" value={d.summary} maxLength={NEWS_LIMITS.summary} onChange={(e) => set("summary", e.target.value)} aria-invalid={Boolean(errors.summary)} />
          {err("summary")}
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
            <label htmlFor="n-body" className="text-sm font-bold text-white/80">Testo</label>
            <span className="flex flex-wrap items-center gap-4">
            {!preview && (
              <label className={`inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-white/60 hover:text-white ${imgBusy ? "pointer-events-none opacity-50" : ""}`}>
                <ImagePlus className="size-4" aria-hidden /> {imgBusy ? "carico…" : "inserisci immagine"}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void insertImage(f); }} />
              </label>
            )}
            <button type="button" onClick={() => setPreview((v) => !v)} className="inline-flex items-center gap-1.5 text-sm font-bold text-white/60 hover:text-white">
              {preview ? <PenLine className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />} {preview ? "torna a scrivere" : "anteprima"}
            </button>
            </span>
          </div>
          {preview ? (
            <div className="min-h-48 rounded-xl bg-black/30 p-5 ring-1 ring-inset ring-white/10">{d.body ? <NewsBody text={d.body} /> : <p className="text-white/50">Niente da mostrare.</p>}</div>
          ) : (
            <textarea ref={bodyRef} id="n-body" className="field min-h-72 font-mono text-[0.95rem]" value={d.body} maxLength={NEWS_LIMITS.body} onChange={(e) => set("body", e.target.value)} aria-invalid={Boolean(errors.body)} />
          )}
          <p className="mt-2 text-sm text-white/50">
            Riga vuota = nuovo paragrafo · <code>## Titoletto</code> · <code>- voce di elenco</code> · <code>**grassetto**</code> · <code>*corsivo*</code> · <code>[testo](https://link)</code> · <code>![didascalia](immagine)</code>
          </p>
          {err("body")}
        </div>

        <div>
          <span className={label}>Copertina</span>
          <div className="grid items-start gap-4 sm:grid-cols-[16rem_1fr]">
            <NewsCover src={coverShown} className="aspect-[16/9] rounded-xl" />
            <div className="grid gap-2 text-sm">
              <label className="btn !h-10 w-fit cursor-pointer !px-4 !text-xs">
                <ImagePlus className="size-4" aria-hidden /> scegli immagine
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setRemoveCover(false); }} />
              </label>
              {(file || (d.cover !== NEWS_DEFAULT_COVER && !removeCover)) && (
                <button type="button" onClick={() => { setFile(null); setRemoveCover(d.cover !== NEWS_DEFAULT_COVER); }} className="inline-flex w-fit items-center gap-1.5 font-bold text-white/60 hover:text-white">
                  <X className="size-4" aria-hidden /> usa la copertina predefinita
                </button>
              )}
              <p className="text-white/50">Meglio orizzontale (16:9), al massimo 4 MB. Senza immagine si usa il banditore.</p>
            </div>
          </div>
        </div>

        {msg && <p className={`rounded-xl px-4 py-3 text-sm font-bold ${msg.kind === "ok" ? "bg-emerald-500/15 text-emerald-300" : "bg-accent/15 text-[#ff8a80]"}`}>{msg.text}</p>}

        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={busy} onClick={() => send("pubblica")} className="btn btn-accent disabled:opacity-60">
            {current?.published_at ? "salva e aggiorna" : "pubblica"}
          </button>
          {!current?.published_at && (
            <button type="button" disabled={busy} onClick={() => send("salva")} className="btn !bg-white/10 !text-white ring-1 ring-inset ring-white/20 disabled:opacity-60">
              salva come bozza
            </button>
          )}
          {current?.published_at && (
            <a href={newsHref(current.slug)} target="_blank" rel="noopener noreferrer" className="btn !bg-white/10 !text-white ring-1 ring-inset ring-white/20">
              apri la news
            </a>
          )}
        </div>
      </form>

      {/* Elenco */}
      <div>
        <h2 className="mb-4 text-2xl">Tutte le news</h2>
        {items.length === 0 ? (
          <p className="text-white/60">Non hai ancora scritto nessuna news.</p>
        ) : (
          <ul className="divide-y divide-white/10 rounded-2xl ring-1 ring-inset ring-white/10">
            {items.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${n.published_at ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/70"}`}>
                  {n.published_at ? "pubblicata" : "bozza"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{n.title}</span>
                  <span className="text-sm text-white/50">
                    {categoryLabel(n.category)} · {formatNewsDate(n.published_at ?? n.created_at)}
                  </span>
                </span>
                <span className="flex flex-wrap gap-2 text-sm font-bold">
                  <button type="button" onClick={() => edit(n)} className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/15">modifica</button>
                  {n.published_at && (
                    <button type="button" disabled={busy} onClick={() => send("ritira", n)} className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/15">ritira</button>
                  )}
                  <button type="button" disabled={busy} onClick={() => send("elimina", n)} aria-label={`Elimina ${n.title}`} className="rounded-lg bg-accent/15 px-3 py-1.5 text-[#ff8a80] hover:bg-accent/25">
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
