"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip } from "lucide-react";

type Opt = { value: string; label: string };

async function post(number: number, data: Record<string, string>, files: File[] = []) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  files.forEach((f) => fd.append("file", f));
  const res = await fetch(`/api/forum/pratiche/${number}`, { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.details ? Object.values(json.details).join(" ") || json.error : json.error ?? "Operazione non riuscita.");
}

function useAction(number: number) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  async function run(data: Record<string, string>, files: File[] = [], okMsg = "Fatto.") {
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      await post(number, data, files);
      setDone(okMsg);
      router.refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operazione non riuscita.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, done, run };
}

function Feedback({ error, done }: { error: string | null; done: string | null }) {
  if (error)
    return (
      <p role="alert" className="text-sm text-[#ffb4ad]">
        {error}
      </p>
    );
  if (done)
    return (
      <p role="status" className="text-sm text-emerald-300">
        {done}
      </p>
    );
  return null;
}

function FilePicker({ files, setFiles }: { files: File[]; setFiles: (f: File[]) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-white/65 hover:text-white">
      <Paperclip className="size-4" aria-hidden />
      {files.length ? `${files.length} allegat${files.length === 1 ? "o" : "i"}` : "allega file (max 4 MB)"}
      <input
        type="file"
        className="sr-only"
        multiple
        accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain"
        onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 4))}
      />
    </label>
  );
}

/* ---------------- Giocatore ---------------- */

export function PlayerReply({ number, awaitingInfo, label }: { number: number; awaitingInfo: boolean; label?: string }) {
  const { busy, error, done, run } = useAction(number);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  return (
    <form
      className="panel grid gap-3 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await run({ azione: "rispondi", body }, files, "Risposta inviata.")) {
          setBody("");
          setFiles([]);
        }
      }}
    >
      <label htmlFor="reply" className="font-semibold">
        {label ?? (awaitingInfo ? "Rispondi allo staff con le informazioni richieste" : "Aggiungi informazioni")}
      </label>
      <textarea id="reply" className="field" value={body} onChange={(e) => setBody(e.target.value)} maxLength={8000} required />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilePicker files={files} setFiles={setFiles} />
        <button type="submit" className="btn btn-accent" disabled={busy || body.trim().length < 2}>
          {busy ? "invio…" : "invia"}
        </button>
      </div>
      <Feedback error={error} done={done} />
    </form>
  );
}

export function PlayerButtons({ number, actions, withdrawLabel }: { number: number; actions: string[]; withdrawLabel: string }) {
  const { busy, error, done, run } = useAction(number);
  const [mode, setMode] = useState<"withdraw" | "reopen" | null>(null);
  const [reason, setReason] = useState("");
  if (!actions.some((a) => ["withdraw", "request_reopen", "submit_draft"].includes(a))) return null;
  return (
    <div className="panel grid gap-3 p-6">
      <div className="flex flex-wrap gap-3">
        {actions.includes("submit_draft") && (
          <button type="button" className="btn btn-accent" disabled={busy} onClick={() => run({ azione: "invia_bozza" }, [], "Richiesta inviata allo staff.")}>
            invia la bozza allo staff
          </button>
        )}
        {actions.includes("request_reopen") && (
          <button type="button" className="btn" disabled={busy} onClick={() => setMode(mode === "reopen" ? null : "reopen")}>
            chiedi la riapertura
          </button>
        )}
        {actions.includes("withdraw") && (
          <button type="button" className="btn" disabled={busy} onClick={() => setMode(mode === "withdraw" ? null : "withdraw")}>
            {withdrawLabel}
          </button>
        )}
      </div>
      {mode && (
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await run(mode === "reopen" ? { azione: "chiedi_riapertura", motivo: reason } : { azione: "ritira", motivo: reason }, [], mode === "reopen" ? "Richiesta di riapertura inviata." : "Pratica ritirata.");
            if (ok) setMode(null);
          }}
        >
          <label htmlFor="reason" className="text-sm font-semibold">
            {mode === "reopen" ? "Perché va riaperta?" : "Motivo (facoltativo)"}
          </label>
          <textarea id="reason" className="field min-h-24" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} />
          <div>
            <button type="submit" className="btn btn-accent" disabled={busy || (mode === "reopen" && reason.trim().length < 10)}>
              conferma
            </button>
          </div>
        </form>
      )}
      <Feedback error={error} done={done} />
    </div>
  );
}

/* ---------------- Staff ---------------- */

export function StaffPanel({
  number,
  statuses,
  finalStatuses,
  needsReason,
  assignee,
  staffOptions,
  priority,
  isFinal,
  reopenRequested,
  verifiable,
}: {
  number: number;
  statuses: Opt[];
  finalStatuses: string[];
  needsReason: string[];
  assignee: string | null;
  staffOptions: Opt[];
  priority: string;
  isFinal: boolean;
  reopenRequested: boolean;
  verifiable: Opt[];
}) {
  const reply = useAction(number);
  const status = useAction(number);
  const meta = useAction(number);
  const note = useAction(number);
  const [body, setBody] = useState("");
  const [askInfo, setAskInfo] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteFiles, setNoteFiles] = useState<File[]>([]);
  const canAskInfo = statuses.some((s) => s.value === "info_richieste");

  return (
    <div className="grid gap-4">
      {!isFinal && (
        <form
          className="panel grid gap-3 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await reply.run({ azione: "staff_rispondi", body, stato: askInfo ? "info_richieste" : "" }, files, "Risposta inviata al giocatore.")) {
              setBody("");
              setFiles([]);
              setAskInfo(false);
            }
          }}
        >
          <label htmlFor="staff-reply" className="font-semibold">
            Rispondi al giocatore
          </label>
          <textarea id="staff-reply" className="field" value={body} onChange={(e) => setBody(e.target.value)} maxLength={8000} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <FilePicker files={files} setFiles={setFiles} />
              {canAskInfo && (
                <label className="flex items-center gap-2 text-sm text-white/75">
                  <input type="checkbox" checked={askInfo} onChange={(e) => setAskInfo(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
                  richiedi informazioni
                </label>
              )}
            </div>
            <button type="submit" className="btn btn-accent" disabled={reply.busy || body.trim().length < 2}>
              {reply.busy ? "invio…" : "invia risposta"}
            </button>
          </div>
          <Feedback error={reply.error} done={reply.done} />
        </form>
      )}

      <form
        className="panel grid gap-3 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const data: Record<string, string> = isFinal ? { azione: "staff_riapri", motivo: reason } : { azione: "staff_stato", stato: newStatus, motivo: reason };
          if (await status.run(data, [], isFinal ? "Pratica riaperta." : "Stato aggiornato.")) {
            setReason("");
            setNewStatus("");
          }
        }}
      >
        <h3 className="font-semibold">{isFinal ? "Riapri la pratica" : "Cambia stato o registra la decisione"}</h3>
        {isFinal && reopenRequested && <p className="text-sm text-gold">Il giocatore ha chiesto la riapertura: leggi il suo ultimo messaggio.</p>}
        {!isFinal && (
          <select className="field" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} aria-label="Nuovo stato">
            <option value="">Scegli il nuovo stato…</option>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
                {finalStatuses.includes(s.value) ? " (chiude la pratica)" : ""}
              </option>
            ))}
          </select>
        )}
        <label htmlFor="status-reason" className="text-sm font-semibold">
          Motivazione {needsReason.includes(newStatus) ? <span className="text-accent">*</span> : "(registrata nello storico e visibile al giocatore)"}
        </label>
        <textarea id="status-reason" className="field min-h-24" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000} />
        <div>
          <button type="submit" className="btn" disabled={status.busy || (!isFinal && !newStatus) || (needsReason.includes(newStatus) && reason.trim().length < 5)}>
            {isFinal ? "riapri" : "aggiorna stato"}
          </button>
        </div>
        <Feedback error={status.error} done={status.done} />
      </form>

      <div className="panel grid gap-4 p-6">
        <h3 className="font-semibold">Gestione</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Assegnata a</span>
            <select className="field" defaultValue={assignee ?? ""} onChange={(e) => meta.run({ azione: "staff_assegna", assegnatario: e.target.value }, [], "Assegnazione aggiornata.")} disabled={meta.busy}>
              <option value="">Nessuno</option>
              {staffOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Priorità</span>
            <select className="field" defaultValue={priority} onChange={(e) => meta.run({ azione: "staff_priorita", priorita: e.target.value }, [], "Priorità aggiornata.")} disabled={meta.busy}>
              <option value="bassa">Bassa</option>
              <option value="normale">Normale</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </label>
        </div>
        {verifiable.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {verifiable.map((v) => (
              <button key={v.value} type="button" className="btn !h-10 !px-4 !text-xs" disabled={meta.busy} onClick={() => meta.run({ azione: "staff_verifica", campo: v.value }, [], "Verifica registrata.")}>
                {v.label}
              </button>
            ))}
          </div>
        )}
        <Feedback error={meta.error} done={meta.done} />
      </div>

      <form
        className="panel grid gap-3 border-gold/30 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await note.run({ azione: "staff_nota", body: noteBody }, noteFiles, "Nota salvata.")) {
            setNoteBody("");
            setNoteFiles([]);
          }
        }}
      >
        <label htmlFor="note" className="font-semibold">
          Nota interna <span className="text-sm font-normal text-gold">· mai visibile al giocatore</span>
        </label>
        <textarea id="note" className="field min-h-24" value={noteBody} onChange={(e) => setNoteBody(e.target.value)} maxLength={8000} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilePicker files={noteFiles} setFiles={setNoteFiles} />
          <button type="submit" className="btn" disabled={note.busy || noteBody.trim().length < 2}>
            salva nota
          </button>
        </div>
        <Feedback error={note.error} done={note.done} />
      </form>
    </div>
  );
}
