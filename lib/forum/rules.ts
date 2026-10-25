/**
 * Regole del forum: validazione dei moduli, permessi e flusso degli stati.
 * Modulo puro (nessun accesso a rete o database): testato in tests/forum.
 * Tutte le API lo usano lato server; il browser non decide nulla.
 */

import { getStatus, formFields, type CandidatureSettings, type Field, type PermissionKey, type Subcategory, SUBCATEGORIES } from "./config.ts";

/* ------------------------------------------------------------------ */
/* Chi sta guardando                                                    */
/* ------------------------------------------------------------------ */

export type Viewer = {
  profileId: string;
  permissions: ReadonlySet<PermissionKey>;
};

export type TicketLike = {
  author_id: string;
  subcategory: string;
  status: string;
  reopen_requested_at?: string | null;
  /** Aperta in una sezione pubblica: la legge chiunque (tranne le bozze). */
  is_public?: boolean;
};

/** Sottosezioni che il viewer può gestire come staff. */
export function staffSubcategories(viewer: Viewer): string[] {
  // L'amministrazione modera le sezioni pubbliche; quelle private restano a chi ha il permesso della sezione
  const admin = viewer.permissions.has("admin");
  return SUBCATEGORIES.filter((s) => viewer.permissions.has(s.permission) || (admin && s.public)).map((s) => s.key);
}

export function isAdmin(viewer: Viewer): boolean {
  return viewer.permissions.has("admin");
}

export function isStaff(viewer: Viewer): boolean {
  return viewer.permissions.size > 0;
}

export function isAuthor(viewer: Viewer, t: TicketLike): boolean {
  return t.author_id === viewer.profileId;
}

/** Staff con il permesso della sezione. Le bozze restano dell'autore. */
export function isStaffFor(viewer: Viewer, t: TicketLike): boolean {
  if (t.status === "bozza") return false;
  return staffSubcategories(viewer).includes(t.subcategory);
}

/** Discussione pubblica: leggibile da tutti, anche senza account. Le bozze restano dell'autore. */
export function isPublicTicket(t: TicketLike): boolean {
  return Boolean(t.is_public) && t.status !== "bozza";
}

export function canView(viewer: Viewer | null, t: TicketLike): boolean {
  if (isPublicTicket(t)) return true;
  return viewer != null && (isAuthor(viewer, t) || isStaffFor(viewer, t));
}

/**
 * Chi può rispondere: l'autore (finché la pratica è aperta), oppure, nelle
 * sezioni a risposte aperte, qualunque utente collegato. Lo staff della
 * sezione risponde dal proprio pannello.
 */
export function canReplyOpen(viewer: Viewer | null, t: TicketLike): boolean {
  if (!viewer || isAuthor(viewer, t) || !isPublicTicket(t) || isFinal(t)) return false;
  return Boolean(sub(t).openReplies);
}

/** Le note interne e gli allegati interni: solo staff della sezione, mai l'autore in quanto autore. */
export function canSeeInternal(viewer: Viewer | null, t: TicketLike): boolean {
  return viewer != null && isStaffFor(viewer, t);
}

/* ------------------------------------------------------------------ */
/* Flusso degli stati                                                   */
/* ------------------------------------------------------------------ */

function sub(t: TicketLike): Subcategory {
  const s = SUBCATEGORIES.find((x) => x.key === t.subcategory);
  if (!s) throw new Error("sottosezione_sconosciuta");
  return s;
}

export function isFinal(t: TicketLike): boolean {
  return getStatus(sub(t), t.status)?.final ?? false;
}

/** Stato "di lavoro" della sezione: dove torna una pratica dopo la risposta del giocatore o la riapertura. */
export function workingStatus(s: Subcategory): string {
  return s.statuses.some((x) => x.key === "in_revisione") ? "in_revisione" : "in_lavorazione";
}

export type PlayerAction = "reply" | "submit_draft" | "withdraw" | "request_reopen" | "edit_draft";

export function playerActions(viewer: Viewer, t: TicketLike): PlayerAction[] {
  if (!isAuthor(viewer, t)) return [];
  const s = sub(t);
  const out: PlayerAction[] = [];
  const final = isFinal(t);
  if (t.status === "bozza") {
    out.push("edit_draft", "submit_draft", "withdraw");
    return out;
  }
  if (!final) out.push("reply");
  if (!final && (s.key === "candidature" || s.key === "candidature_media" || s.key === "diplomazia")) out.push("withdraw");
  if (final && !t.reopen_requested_at && t.status !== "ritirata" && t.status !== "annullata") out.push("request_reopen");
  return out;
}

/** Stato finale quando il giocatore ritira la pratica. */
export function withdrawStatus(t: TicketLike): string | null {
  if (t.subcategory === "candidature" || t.subcategory === "candidature_media") return "ritirata";
  if (t.subcategory === "diplomazia") return "annullata";
  return null;
}

/** Dopo la risposta del giocatore a una richiesta di informazioni, la pratica torna allo staff. */
export function statusAfterPlayerReply(t: TicketLike): string | null {
  return t.status === "info_richieste" ? workingStatus(sub(t)) : null;
}

/** Stati che lo staff può impostare. La bozza appartiene solo all'autore. */
export function staffSettableStatuses(viewer: Viewer, t: TicketLike): string[] {
  if (!isStaffFor(viewer, t)) return [];
  return sub(t)
    .statuses.filter((s) => s.key !== "bozza" && s.key !== t.status)
    .map((s) => s.key);
}

export type NotifyKind = "info_richieste" | "cambio_stato" | "decisione" | "chiusura";

/** Tipo di notifica per un cambio di stato deciso dallo staff. */
export function notifyKindFor(t: TicketLike, newStatus: string): NotifyKind {
  const st = getStatus(sub(t), newStatus);
  if (newStatus === "info_richieste") return "info_richieste";
  if (newStatus === "chiusa") return "chiusura";
  if (st?.final || newStatus === "approvata" || newStatus === "accettata") return "decisione";
  return "cambio_stato";
}

/** Le decisioni finali richiedono una motivazione scritta (registrata nello storico). */
export function requiresReason(t: TicketLike, newStatus: string): boolean {
  const st = getStatus(sub(t), newStatus);
  return Boolean(st?.final && newStatus !== "chiusa") || newStatus === "approvata" || newStatus === "accettata";
}

/* ------------------------------------------------------------------ */
/* Validazione dei moduli (server)                                      */
/* ------------------------------------------------------------------ */

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Testo pulito: niente caratteri di controllo, spazi ai bordi tolti, lunghezza limitata. */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL, "").replace(/\r\n?/g, "\n").trim().slice(0, max);
}

export const NICK_RE = /^[A-Za-z0-9_]{3,16}$/;

function isValidDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v && d.getUTCFullYear() >= 2009;
}

function isValidDateTime(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return false;
  return isValidDate(v.slice(0, 10)) && Number(v.slice(11, 13)) < 24 && Number(v.slice(14, 16)) < 60;
}

function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return (u.protocol === "https:" || u.protocol === "http:") && Boolean(u.hostname.includes("."));
  } catch {
    return false;
  }
}

/** Dati sensibili che non vanno mai scritti nel forum (numeri di carta). */
export function looksLikeCardNumber(text: string): boolean {
  const digits = text.replace(/[\s-]/g, "");
  const runs = digits.match(/\d{13,19}/g) ?? [];
  return runs.some((r) => {
    let sum = 0;
    let dbl = false;
    for (let i = r.length - 1; i >= 0; i--) {
      let n = Number(r[i]);
      if (dbl) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  });
}

export type Submission = {
  title?: unknown;
  body?: unknown;
  fields?: unknown;
};

export type ValidationResult =
  | { ok: true; title: string; body: string; fields: Record<string, string> }
  | { ok: false; errors: Record<string, string> };

function visible(field: Field, values: Record<string, string>): boolean {
  if (!field.when) return true;
  return field.when.in.includes(values[field.when.field] ?? "");
}

export function validateSubmission(s: Subcategory, input: Submission, opts: { settings?: CandidatureSettings; draft?: boolean } = {}): ValidationResult {
  const errors: Record<string, string> = {};
  const raw = input.fields && typeof input.fields === "object" ? (input.fields as Record<string, unknown>) : {};
  const fields = formFields(s, opts.settings);
  const allowed = new Set(fields.map((f) => f.name));
  const out: Record<string, string> = {};
  const draft = Boolean(opts.draft && s.allowsDraft);

  // Prima passata: valori puliti (servono a valutare le condizioni "when")
  for (const f of fields) out[f.name] = cleanText(raw[f.name], f.max ?? (f.type === "textarea" ? 4000 : 300));

  for (const f of fields) {
    const v = out[f.name];
    if (!visible(f, out)) {
      delete out[f.name];
      continue;
    }
    if (!v) {
      if (f.required && !draft) errors[f.name] = "Campo obbligatorio.";
      delete out[f.name];
      continue;
    }
    switch (f.type) {
      case "select":
        if (!f.options?.some((o) => o.value === v)) errors[f.name] = "Scelta non valida.";
        break;
      case "nick":
        if (!NICK_RE.test(v)) errors[f.name] = "Nickname non valido: 3-16 caratteri, lettere, numeri e _.";
        break;
      case "date":
        if (!isValidDate(v)) errors[f.name] = "Data non valida.";
        else if (new Date(`${v}T00:00:00Z`).getTime() > Date.now() + 86_400_000) errors[f.name] = "La data non può essere nel futuro.";
        break;
      case "datetime":
        if (!isValidDateTime(v)) errors[f.name] = "Data e ora non valide.";
        break;
      case "number":
        if (!/^\d{1,3}$/.test(v)) errors[f.name] = "Inserisci un numero.";
        break;
      case "url-list": {
        const lines = v.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length > 10) errors[f.name] = "Al massimo 10 link.";
        else if (lines.some((l) => !isHttpUrl(l))) errors[f.name] = "Ogni riga deve essere un link http(s) valido.";
        else out[f.name] = lines.join("\n");
        break;
      }
    }
    if (looksLikeCardNumber(v)) errors[f.name] = "Sembra un numero di carta: non inserire dati di pagamento.";
  }

  // Nessun campo in più rispetto al modulo della sezione
  for (const k of Object.keys(out)) if (!allowed.has(k)) delete out[k];

  if (s.key === "candidature" && opts.settings) {
    if (!opts.settings.aperte) errors._form = "Le candidature sono chiuse in questo momento.";
    const min = opts.settings.eta_minima;
    if (min != null && out.eta && Number(out.eta) < min) errors.eta = `L'età minima è ${min} anni.`;
  }

  const body = cleanText(input.body, 8000);
  if (!draft && body.length < 10) errors.body = "Scrivi almeno 10 caratteri.";
  if (looksLikeCardNumber(body)) errors.body = "Sembra un numero di carta: non inserire dati di pagamento.";

  let title = s.autoTitle ? s.autoTitle(out) : cleanText(input.title, 140);
  title = title.slice(0, 140);
  if (title.length < 3) errors.title = "Il titolo deve avere almeno 3 caratteri.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, title, body, fields: out };
}

/* ------------------------------------------------------------------ */
/* Allegati                                                             */
/* ------------------------------------------------------------------ */

export const ATTACHMENT_MAX_BYTES = 4 * 1024 * 1024;
export const ATTACHMENT_MAX_TOTAL = 4 * 1024 * 1024;
export const ATTACHMENT_MAX_FILES = 4;

/** Tipo reale del file dai primi byte (non ci si fida dell'estensione né del tipo dichiarato). */
export function sniffMime(bytes: Uint8Array): string | null {
  const b = bytes;
  const starts = (sig: number[], off = 0) => sig.every((v, i) => b[off + i] === v);
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (starts([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (starts([0x47, 0x49, 0x46, 0x38])) return "image/gif";
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  if (starts([0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";
  // Testo semplice: UTF-8 valido senza byte di controllo binari
  const sample = b.subarray(0, 4096);
  if (sample.length && sample.every((c) => c === 9 || c === 10 || c === 13 || c >= 32)) {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(sample);
      return "text/plain";
    } catch {
      return null;
    }
  }
  return null;
}

export const MIME_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "text/plain": "txt",
};

/** Nome file sicuro: niente percorsi, solo caratteri innocui, estensione coerente col tipo reale. */
export function safeFilename(name: string, mime: string): string {
  const base = (name.split(/[\\/]/).pop() ?? "allegato").replace(/\.[^.]*$/, "");
  const clean = base.normalize("NFKD").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "allegato";
  return `${clean}.${MIME_EXT[mime] ?? "bin"}`;
}

/* ------------------------------------------------------------------ */
/* Varie                                                                */
/* ------------------------------------------------------------------ */

/** Percorso di ritorno dopo il login: solo percorsi interni. */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/forum";
  return next.slice(0, 300);
}

/** Formato del numero di pratica mostrato agli utenti. */
export function ticketCode(n: number | string): string {
  return `TIB-${String(n).padStart(5, "0")}`;
}

/** Interpreta "TIB-01234", "#1234" o "1234". */
export function parseTicketCode(q: string): number | null {
  const m = q.trim().match(/^(?:tib-?|#)?0*(\d{1,9})$/i);
  return m ? Number(m[1]) : null;
}

export function permissionFor(subKey: string): PermissionKey | undefined {
  return SUBCATEGORIES.find((s) => s.key === subKey)?.permission;
}
