"use client";

import { useState, type ReactNode } from "react";
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

const TONE_BTN: Record<string, string> = {
  aperta: "ring-accent/40 text-[#ff8a80] hover:bg-accent/15",
  attesa: "ring-sky-400/40 text-sky-300 hover:bg-sky-400/15",
  positiva: "ring-emerald-400/40 text-emerald-300 hover:bg-emerald-400/15",
  negativa: "ring-white/25 text-white/75 hover:bg-white/10",
  chiusa: "ring-white/15 text-white/55 hover:bg-white/5",
  bozza: "ring-gold/40 text-gold hover:bg-gold/15",
};

type StatusOpt = Opt & { tone: string; final: boolean; reason: boolean };

/** Risposta dello staff, sotto la discussione: si può cambiare lo stato nello stesso invio. */
export function StaffReply({ number, statuses, currentLabel }: { number: number; statuses: StatusOpt[]; currentLabel: string }) {
  const reply = useAction(number);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [next, setNext] = useState("");
  const chosen = statuses.find((s) => s.value === next);
  return (
    <form
      className="fbox grid gap-3 !border-accent/35 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await reply.run({ azione: "staff_rispondi", body, stato: next }, files, chosen ? `Risposta inviata e richiesta segnata come «${chosen.label}».` : "Risposta inviata.")) {
          setBody("");
          setFiles([]);
          setNext("");
        }
      }}
    >
      <label htmlFor="staff-reply" className="flex items-center gap-2 font-bold">
        <span className="rounded bg-accent px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wider text-white">staff</span>
        Rispondi come staff
      </label>
      <textarea id="staff-reply" className="field min-h-32" value={body} onChange={(e) => setBody(e.target.value)} maxLength={8000} placeholder="Scrivi la risposta…" />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <FilePicker files={files} setFiles={setFiles} />
        <label className="flex items-center gap-2 text-sm text-white/65">
          Dopo l&apos;invio
          <select className="field !h-9 !w-auto !py-0 text-sm" value={next} onChange={(e) => setNext(e.target.value)} aria-label="Stato dopo la risposta">
            <option value="">resta «{currentLabel}»</option>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                segna come «{s.label}»
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-accent ml-auto" disabled={reply.busy || body.trim().length < 2}>
          {reply.busy ? "invio…" : "invia risposta"}
        </button>
      </div>
      {chosen?.final && <p className="text-xs text-white/50">La richiesta verrà chiusa: la tua risposta resta come motivazione nello storico.</p>}
      <Feedback error={reply.error} done={reply.done} />
    </form>
  );
}

/** Pannello laterale dello staff: stato con un clic, presa in carico, assegnazione, priorità, note interne. */
export function StaffPanel({
  number,
  badge,
  statuses,
  assignee,
  me,
  staffOptions,
  priority,
  isFinal,
  reopenRequested,
  verifiable,
  workingStatus,
}: {
  number: number;
  badge: ReactNode;
  statuses: StatusOpt[];
  assignee: string | null;
  me: string | null;
  staffOptions: Opt[];
  priority: string;
  isFinal: boolean;
  reopenRequested: boolean;
  verifiable: Opt[];
  workingStatus: string | null;
}) {
  const status = useAction(number);
  const meta = useAction(number);
  const note = useAction(number);
  const [pending, setPending] = useState<StatusOpt | null>(null);
  const [reason, setReason] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteFiles, setNoteFiles] = useState<File[]>([]);
  const [busyTake, setBusyTake] = useState(false);
  const mine = Boolean(me && assignee === me);
  const working = statuses.find((s) => s.value === workingStatus);

  async function setStatus(s: StatusOpt, why = "") {
    if (await status.run({ azione: "staff_stato", stato: s.value, motivo: why }, [], `Richiesta segnata come «${s.label}».`)) {
      setPending(null);
      setReason("");
    }
  }

  async function take() {
    if (!me) return;
    setBusyTake(true);
    const ok = await meta.run({ azione: "staff_assegna", assegnatario: me }, [], "Hai preso in carico la richiesta.");
    if (ok && working) await status.run({ azione: "staff_stato", stato: working.value, motivo: "" }, [], `Richiesta presa in carico.`);
    setBusyTake(false);
  }

  return (
    <div className="grid gap-4">
      <section className="fbox fside">
        <h2>Gestione staff</h2>
        <div className="grid gap-4 p-4">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-white/55">Stato attuale</span>
            {badge}
          </div>

          {!isFinal && !mine && me && (
            <button type="button" onClick={take} disabled={busyTake} className="btn btn-accent w-full justify-center">
              {busyTake ? "un attimo…" : "Prendi in carico"}
            </button>
          )}
          {mine && !isFinal && <p className="rounded-md bg-emerald-400/10 px-3 py-2 text-center text-sm text-emerald-300">La stai seguendo tu</p>}

          {isFinal ? (
            <form
              className="grid gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (await status.run({ azione: "staff_riapri", motivo: reason }, [], "Richiesta riaperta.")) setReason("");
              }}
            >
              {reopenRequested && <p className="text-sm text-gold">Il giocatore ha chiesto la riapertura: leggi il suo ultimo messaggio.</p>}
              <textarea className="field min-h-20 text-sm" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000} placeholder="Motivo della riapertura (facoltativo)" />
              <button type="submit" className="btn w-full justify-center" disabled={status.busy}>
                Riapri la richiesta
              </button>
            </form>
          ) : (
            <div className="grid gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-white/45">Cambia stato</p>
              <div className="flex flex-wrap gap-1.5">
                {statuses.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    disabled={status.busy}
                    onClick={() => (s.reason ? setPending(pending?.value === s.value ? null : s) : setStatus(s))}
                    aria-pressed={pending?.value === s.value}
                    className={`rounded-md px-2.5 py-1.5 text-[0.8rem] font-semibold ring-1 ring-inset transition-colors disabled:opacity-50 aria-pressed:bg-white/10 ${TONE_BTN[s.tone] ?? TONE_BTN.aperta}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {pending && (
                <form
                  className="grid gap-2 rounded-md bg-black/25 p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStatus(pending, reason);
                  }}
                >
                  <label htmlFor="status-reason" className="text-sm">
                    Motivazione per «{pending.label}» <span className="text-white/45">(la vede il giocatore)</span>
                  </label>
                  <textarea id="status-reason" className="field min-h-20 text-sm" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000} autoFocus />
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-accent !h-9 !px-3 !text-xs" disabled={status.busy || reason.trim().length < 5}>
                      conferma
                    </button>
                    <button type="button" className="btn !h-9 !px-3 !text-xs" onClick={() => setPending(null)}>
                      annulla
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          <Feedback error={status.error} done={status.done} />

          <div className="grid gap-3 border-t border-white/[0.07] pt-4">
            <label className="grid gap-1.5 text-sm">
              <span className="text-white/55">Assegnata a</span>
              <select key={assignee ?? ""} className="field !h-10 !py-0" defaultValue={assignee ?? ""} onChange={(e) => meta.run({ azione: "staff_assegna", assegnatario: e.target.value }, [], "Assegnazione aggiornata.")} disabled={meta.busy}>
                <option value="">Nessuno</option>
                {staffOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                    {o.value === me ? " (tu)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-white/55">Priorità</span>
              <select className="field !h-10 !py-0" defaultValue={priority} onChange={(e) => meta.run({ azione: "staff_priorita", priorita: e.target.value }, [], "Priorità aggiornata.")} disabled={meta.busy}>
                <option value="bassa">Bassa</option>
                <option value="normale">Normale</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </label>
            {verifiable.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {verifiable.map((v) => (
                  <button key={v.value} type="button" className="btn !h-9 !px-3 !text-xs" disabled={meta.busy} onClick={() => meta.run({ azione: "staff_verifica", campo: v.value }, [], "Verifica registrata.")}>
                    {v.label}
                  </button>
                ))}
              </div>
            )}
            <Feedback error={meta.error} done={meta.done} />
          </div>
        </div>
      </section>

      <form
        className="fbox fside"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await note.run({ azione: "staff_nota", body: noteBody }, noteFiles, "Nota salvata.")) {
            setNoteBody("");
            setNoteFiles([]);
          }
        }}
      >
        <h2>
          Nota interna <span className="font-normal normal-case text-gold">· solo staff</span>
        </h2>
        <div className="grid gap-3 p-4">
          <textarea id="note" aria-label="Nota interna" className="field min-h-20 text-sm" value={noteBody} onChange={(e) => setNoteBody(e.target.value)} maxLength={8000} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilePicker files={noteFiles} setFiles={setNoteFiles} />
            <button type="submit" className="btn !h-9 !px-3 !text-xs" disabled={note.busy || noteBody.trim().length < 2}>
              salva nota
            </button>
          </div>
          <Feedback error={note.error} done={note.done} />
        </div>
      </form>
    </div>
  );
}

/* ---------------- Amministrazione ---------------- */

/** Elimina la discussione per sempre (con conferma), poi torna alla sezione. */
export function AdminDelete({ number, backHref }: { number: number; backHref: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="panel grid gap-3 p-5">
      <p className="text-sm font-bold text-white/80">Amministrazione</p>
      {!confirm ? (
        <button type="button" onClick={() => setConfirm(true)} className="btn !h-10 !border-accent/40 !text-sm !text-[#ff8a80] hover:!bg-accent/15">
          elimina discussione
        </button>
      ) : (
        <div className="grid gap-3">
          <p className="text-sm text-white/70">La discussione, i messaggi e gli allegati verranno cancellati per sempre. Non si può annullare.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                try {
                  await post(number, { azione: "elimina" });
                  router.push(backHref);
                  router.refresh();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Operazione non riuscita.");
                  setBusy(false);
                }
              }}
              className="btn btn-accent !h-10 !text-sm"
            >
              {busy ? "elimino…" : "sì, elimina"}
            </button>
            <button type="button" disabled={busy} onClick={() => setConfirm(false)} className="btn !h-10 !text-sm">
              annulla
            </button>
          </div>
        </div>
      )}
      <Feedback error={error} done={null} />
    </div>
  );
}
