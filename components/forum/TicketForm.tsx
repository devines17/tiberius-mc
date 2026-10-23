"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, X } from "lucide-react";
import type { Field } from "@/lib/forum/config";

export type FormMeta = {
  key: string;
  label: string;
  bodyLabel: string;
  notices: string[];
  autoTitle: boolean;
  allowsDraft: boolean;
  identity: string | null;
};

const MAX_FILES = 4;
const MAX_TOTAL = 4 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain";

/** Modulo di una nuova pratica: i campi arrivano dalla configurazione della sezione. */
export type DraftEdit = { number: number; title: string; body: string; values: Record<string, string> };

export function TicketForm({ meta, fields, edit }: { meta: FormMeta; fields: Field[]; edit?: DraftEdit }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(edit?.values ?? {});
  const [title, setTitle] = useState(edit?.title ?? "");
  const [body, setBody] = useState(edit?.body ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "error"; msg?: string }>({ kind: "idle" });

  const visible = useMemo(() => fields.filter((f) => !f.when || f.when.in.includes(values[f.when.field] ?? "")), [fields, values]);
  const totalSize = files.reduce((n, f) => n + f.size, 0);

  function set(name: string, v: string) {
    setValues((prev) => ({ ...prev, [name]: v }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, MAX_FILES);
    setFiles(next);
  }

  async function submit(draft: boolean) {
    if (totalSize > MAX_TOTAL) return setStatus({ kind: "error", msg: "Gli allegati superano 4 MB in totale." });
    setStatus({ kind: "busy" });
    if (edit) return saveDraft(!draft);
    const fd = new FormData();
    fd.set("sub", meta.key);
    fd.set("title", title);
    fd.set("body", body);
    fd.set("fields", JSON.stringify(Object.fromEntries(visible.map((f) => [f.name, values[f.name] ?? ""]))));
    if (draft) fd.set("draft", "1");
    files.forEach((f) => fd.append("file", f));
    try {
      const res = await fetch("/api/forum/pratiche", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.details ?? {});
        setStatus({ kind: "error", msg: data.details?._form ?? data.error ?? "Invio non riuscito." });
        document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
        return;
      }
      router.push(`/forum/pratica?n=${data.number}&nuova=1`);
    } catch {
      setStatus({ kind: "error", msg: "Connessione non riuscita. I dati sono ancora qui: riprova." });
    }
  }

  /** Bozza esistente: salva le modifiche e, se richiesto, la invia allo staff. */
  async function saveDraft(send: boolean) {
    if (!edit) return;
    const call = async (data: Record<string, string>) => {
      const fd = new FormData();
      for (const [k, v] of Object.entries(data)) fd.set(k, v);
      const res = await fetch(`/api/forum/pratiche/${edit.number}`, { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(json.details ?? {});
        throw new Error(json.error ?? "Salvataggio non riuscito.");
      }
    };
    try {
      await call({ azione: "modifica_bozza", title, body, fields: JSON.stringify(Object.fromEntries(visible.map((f) => [f.name, values[f.name] ?? ""]))) });
      if (send) await call({ azione: "invia_bozza" });
      setStatus({ kind: "idle" });
      router.refresh();
    } catch (e) {
      setStatus({ kind: "error", msg: e instanceof Error ? e.message : "Salvataggio non riuscito." });
    }
  }

  const err = (name: string) => errors[name] || undefined;

  return (
    <form
      className="panel grid gap-6 p-6 md:p-10"
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
      noValidate
    >
      {meta.identity && (
        <p className="text-sm text-white/60">
          Scrivi come <strong className="text-white">{meta.identity}</strong>.
        </p>
      )}

      {!meta.autoTitle && (
        <FieldShell label="Titolo della richiesta" required error={err("title")} htmlFor="f-title">
          <input id="f-title" className="field" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} aria-invalid={Boolean(err("title"))} required />
        </FieldShell>
      )}

      {visible.map((f) => (
        <FieldShell key={f.name} label={f.label} required={f.required} help={f.help} error={err(f.name)} htmlFor={`f-${f.name}`}>
          <Input field={f} value={values[f.name] ?? ""} onChange={(v) => set(f.name, v)} invalid={Boolean(err(f.name))} />
        </FieldShell>
      ))}

      <FieldShell label={meta.bodyLabel} required error={err("body")} htmlFor="f-body">
        <textarea id="f-body" className="field min-h-40" value={body} onChange={(e) => setBody(e.target.value)} maxLength={8000} aria-invalid={Boolean(err("body"))} required />
      </FieldShell>

      {!edit && <div className="grid gap-3">
        <span className="text-sm font-semibold">Allegati (facoltativi)</span>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 px-4 py-3 text-sm text-white/70 transition-colors hover:border-white/40 hover:text-white">
          <Paperclip className="size-4" aria-hidden />
          Aggiungi immagini, PDF o file di testo (max {MAX_FILES} file, 4 MB in totale)
          <input type="file" className="sr-only" accept={ACCEPT} multiple onChange={(e) => addFiles(e.target.files)} disabled={files.length >= MAX_FILES} />
        </label>
        {files.length > 0 && (
          <ul className="grid gap-2">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-2 text-sm">
                <span className="truncate">{f.name}</span>
                <span className="flex items-center gap-3 text-white/50">
                  {(f.size / 1024 / 1024).toFixed(1)} MB
                  <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={`Rimuovi ${f.name}`} className="rounded p-1 hover:bg-white/10">
                    <X className="size-4" aria-hidden />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        {totalSize > MAX_TOTAL && <p className="text-sm text-[#ffb4ad]">Gli allegati superano 4 MB: per i video usa un link.</p>}
      </div>}

      {status.kind === "error" && (
        <p role="alert" className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-[#ffb4ad]">
          {status.msg}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-accent" disabled={status.kind === "busy"}>
          {status.kind === "busy" ? "invio in corso…" : edit ? "salva e invia allo staff" : "invia la richiesta"}
        </button>
        {meta.allowsDraft && (
          <button type="button" className="btn" disabled={status.kind === "busy"} onClick={() => submit(true)}>
            {edit ? "salva la bozza" : "salva come bozza"}
          </button>
        )}
      </div>
    </form>
  );
}

function FieldShell({ label, required, help, error, htmlFor, children }: { label: string; required?: boolean; help?: string; error?: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {children}
      {help && <p className="text-xs text-white/50">{help}</p>}
      {error && (
        <p className="text-sm text-[#ffb4ad]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Input({ field: f, value, onChange, invalid }: { field: Field; value: string; onChange: (v: string) => void; invalid: boolean }) {
  const id = `f-${f.name}`;
  const common = { id, className: "field", value, "aria-invalid": invalid, required: f.required };
  switch (f.type) {
    case "textarea":
      return <textarea {...common} maxLength={f.max ?? 4000} onChange={(e) => onChange(e.target.value)} />;
    case "url-list":
      return <textarea {...common} className="field min-h-24 font-mono text-sm" maxLength={f.max ?? 2000} placeholder="https://…" onChange={(e) => onChange(e.target.value)} />;
    case "select":
      return (
        <select {...common} onChange={(e) => onChange(e.target.value)}>
          <option value="">Scegli…</option>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "date":
      return <input {...common} type="date" max={new Date().toISOString().slice(0, 10)} onChange={(e) => onChange(e.target.value)} />;
    case "datetime":
      return <input {...common} type="datetime-local" onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return <input {...common} type="number" inputMode="numeric" min={1} max={120} onChange={(e) => onChange(e.target.value)} />;
    case "nick":
      return <input {...common} autoComplete="off" spellCheck={false} maxLength={16} pattern="[A-Za-z0-9_]{3,16}" onChange={(e) => onChange(e.target.value)} />;
    default:
      return <input {...common} maxLength={f.max ?? 300} onChange={(e) => onChange(e.target.value)} />;
  }
}
