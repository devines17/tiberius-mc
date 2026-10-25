"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

/**
 * Modulo del gestionale: invia i campi a /api/citta con il campo "azione",
 * poi ricarica i dati della pagina. Gli errori compaiono sotto il modulo.
 */
export function ActionForm({
  azione,
  children,
  className = "",
  confirm,
  ok,
  resetOnSuccess = true,
}: {
  azione: string;
  children: ReactNode;
  className?: string;
  confirm?: string;
  ok?: string;
  resetOnSuccess?: boolean;
}) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (confirm && !window.confirm(confirm)) return;
    const fd = new FormData(e.currentTarget);
    fd.set("azione", azione);
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetch("/api/citta", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string; details?: Record<string, string>; redirect?: string };
      if (!res.ok) throw new Error(data.details ? Object.values(data.details).join(" ") || data.error : data.error ?? "Operazione non riuscita.");
      if (resetOnSuccess) ref.current?.reset();
      if (ok) setDone(ok);
      if (data.redirect) router.push(data.redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operazione non riuscita.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={ref} onSubmit={submit} className={className}>
      <fieldset disabled={busy} className="contents">
        {children}
      </fieldset>
      {error && (
        <p role="alert" className="mt-2 text-sm text-[#ffb4ad]">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="mt-2 text-sm text-emerald-300">
          {done}
        </p>
      )}
    </form>
  );
}

/** Carica subito un'immagine appena scelta (stemma o foto). */
export function ImageUpload({ azione, label }: { azione: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <label className={`btn !h-10 !text-xs ${busy ? "pointer-events-none opacity-60" : "cursor-pointer"}`}>
        {busy ? "carico…" : label}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            setBusy(true);
            setError(null);
            const fd = new FormData();
            fd.set("azione", azione);
            fd.set("file", f);
            try {
              const res = await fetch("/api/citta", { method: "POST", body: fd });
              const data = (await res.json().catch(() => ({}))) as { error?: string };
              if (!res.ok) throw new Error(data.error ?? "Caricamento non riuscito.");
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Caricamento non riuscito.");
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {error && <p className="mt-2 text-sm text-[#ffb4ad]">{error}</p>}
    </div>
  );
}
