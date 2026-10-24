/**
 * Operazioni sulle pratiche. Ogni funzione riceve la sessione e controlla
 * i permessi con le regole di lib/forum/rules.ts PRIMA di toccare il
 * database. Una pratica che l'utente non può vedere risulta "non trovata":
 * non si rivela nemmeno che esiste.
 */

import { db, pgList } from "./db";
import { audit, HttpError, rateLimit } from "./http";
import { displayName, type Session } from "./auth";
import { prepareFiles, removeFiles, uploadFile } from "./storage";
import type { Attachment, InternalNote, Profile, StatusChange, Ticket, TicketMessage } from "./types";
import { getSubcategory, SUBCATEGORIES, type CandidatureSettings, type Subcategory } from "@/lib/forum/config";
import { STAFF } from "@/lib/staff";
import {
  canReplyOpen,
  canSeeInternal,
  canView,
  cleanText,
  isAdmin,
  isFinal,
  isStaffFor,
  notifyKindFor,
  playerActions,
  requiresReason,
  staffSettableStatuses,
  staffSubcategories,
  statusAfterPlayerReply,
  validateSubmission,
  withdrawStatus,
  workingStatus,
} from "@/lib/forum/rules";

export async function getCandidatureSettings(): Promise<CandidatureSettings> {
  const row = await db.one<{ value: CandidatureSettings }>("forum_settings", "value", { key: "eq.candidature" });
  return row?.value ?? { aperte: false, ruoli: [], eta_minima: null, domande: [] };
}

function requireSub(key: string): Subcategory {
  const s = getSubcategory(key);
  if (!s) throw new HttpError(404, "Sezione non trovata.");
  return s;
}

/* ------------------------------------------------------------------ */
/* Creazione                                                            */
/* ------------------------------------------------------------------ */

export async function createTicket(session: Session, subKey: string, input: { title?: unknown; body?: unknown; fields?: unknown; draft?: boolean }, files: File[]) {
  const s = requireSub(subKey);
  const { profile, viewer } = session;
  if (s.requiresVerifiedMc && !profile.mc_uuid) throw new HttpError(403, "Per questa sezione serve un account Minecraft collegato.");
  const draft = Boolean(input.draft && s.allowsDraft);

  await rateLimit(`ticket:${viewer.profileId}`, 3600, 6);
  await rateLimit(`ticket-day:${viewer.profileId}`, 86400, 15);

  const settings = s.key === "candidature" ? await getCandidatureSettings() : undefined;
  const v = validateSubmission(s, input, { settings, draft });
  if (!v.ok) throw new HttpError(422, "Controlla i campi evidenziati.", v.errors);
  const prepared = await prepareFiles(files);

  const ticket = await db.rpc<Ticket>("forum_create_ticket", {
    p_author: profile.id,
    p_subcategory: s.key,
    p_title: v.title,
    p_fields: v.fields,
    p_body: v.body || null,
    p_status: draft ? "bozza" : s.initialStatus,
    p_mc_uuid: profile.mc_uuid,
    p_mc_name: profile.mc_name,
    p_mc_verified: Boolean(profile.mc_uuid),
  });

  if (prepared.length) {
    const firstMsg = await db.one<{ id: string }>("ticket_messages", "id", { ticket_id: `eq.${ticket.id}`, order: "created_at.asc" });
    await saveAttachments(ticket.id, prepared, { messageId: firstMsg?.id ?? null, uploader: profile.id, internal: false });
  }
  return ticket;
}

async function saveAttachments(ticketId: string, files: Awaited<ReturnType<typeof prepareFiles>>, opts: { messageId?: string | null; noteId?: string | null; uploader: string; internal: boolean }) {
  const uploaded: string[] = [];
  try {
    for (const f of files) {
      const path = await uploadFile(ticketId, f);
      uploaded.push(path);
      await db.insert(
        "ticket_attachments",
        { ticket_id: ticketId, message_id: opts.messageId ?? null, note_id: opts.noteId ?? null, uploader_id: opts.uploader, storage_path: path, filename: f.filename, mime: f.mime, size_bytes: f.size, internal: opts.internal },
        { returning: false },
      );
    }
  } catch (e) {
    await removeFiles(uploaded).catch(() => {});
    throw e;
  }
}

/* ------------------------------------------------------------------ */
/* Lettura                                                              */
/* ------------------------------------------------------------------ */

/** Scheda dell'autore accanto a ogni messaggio, come nei forum classici. */
export type AuthorCard = {
  name: string;
  /** Nick per la testa della skin (null = Steve). */
  head: string | null;
  role: string;
  staff: boolean;
  messages: number | null;
  since: string | null;
};

export type TicketView = {
  ticket: Ticket;
  sub: Subcategory;
  role: "autore" | "staff" | "lettore";
  /** Chi guarda può rispondere: come autore o in una discussione aperta a tutti. */
  canReply: boolean;
  messages: (TicketMessage & { author_name: string; card: AuthorCard })[];
  history: (StatusChange & { actor_name: string })[];
  attachments: Attachment[];
  notes: (InternalNote & { author_name: string })[];
  assignee: { id: string; name: string } | null;
  staffOptions: { id: string; name: string }[];
  playerActions: ReturnType<typeof playerActions>;
  staffStatuses: string[];
  authorProfile: Pick<Profile, "discord_username" | "mc_name" | "mc_uuid" | "mc_verified_by"> | null;
};

async function namesFor(ids: (string | null)[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter(Boolean) as string[])];
  if (!unique.length) return new Map();
  const rows = await db.select<Pick<Profile, "id" | "mc_name" | "discord_username">>("profiles", "id,mc_name,discord_username", { id: `in.${pgList(unique)}` });
  return new Map(rows.map((r) => [r.id, displayName(r)]));
}

/** Staff con il permesso di una sezione (per l'assegnazione). */
async function staffFor(sub: Subcategory): Promise<{ id: string; name: string }[]> {
  const rows = await db.select<{ profile_id: string; profiles: Pick<Profile, "mc_name" | "discord_username"> }>("staff_permissions", "profile_id,profiles(mc_name,discord_username)", {
    permission: `eq.${sub.permission}`,
  });
  return rows.map((r) => ({ id: r.profile_id, name: displayName(r.profiles) }));
}

async function loadVisible(session: Session | null, number: number): Promise<Ticket> {
  const t = await db.one<Ticket>("tickets", "*", { number: `eq.${number}` });
  if (!t || !canView(session?.viewer ?? null, t)) throw new HttpError(404, "Pratica non trovata.");
  return t;
}

/** Ruolo pubblico di un membro dello staff: quello della pagina /staff se il nick è in elenco. */
export function staffRoleFor(name: string): { role: string; head: string } | null {
  const n = name.toLowerCase();
  for (const r of STAFF) {
    const m = r.membri.find((x) => x.nick.toLowerCase() === n);
    if (m) return { role: r.ruolo, head: m.nick };
  }
  return null;
}

type CardRow = { id: string; name: string; mc_name: string | null; created_at: string; messages: number; is_staff: boolean };

function toCard(r: CardRow): AuthorCard {
  const listed = staffRoleFor(r.name);
  return {
    name: r.name,
    head: r.mc_name ?? listed?.head ?? null,
    role: listed?.role ?? (r.is_staff ? "Staff" : "Giocatore"),
    staff: r.is_staff || Boolean(listed),
    messages: Number(r.messages),
    since: r.created_at,
  };
}

export async function getTicketView(session: Session | null, number: number): Promise<TicketView> {
  const t = await loadVisible(session, number);
  const sub = requireSub(t.subcategory);
  const viewer = session?.viewer ?? null;
  const staff = viewer != null && isStaffFor(viewer, t);
  const author = viewer != null && viewer.profileId === t.author_id;
  const internal = canSeeInternal(viewer, t);
  // Nelle discussioni pubbliche i nomi dello staff sono visibili come in ogni forum; nelle pratiche private no
  const publicThread = Boolean(t.is_public) && t.status !== "bozza";

  const [messages, history, attachments, notes] = await Promise.all([
    db.select<TicketMessage>("ticket_messages", "*", { ticket_id: `eq.${t.id}`, order: "created_at.asc" }),
    db.select<StatusChange>("ticket_status_history", "*", { ticket_id: `eq.${t.id}`, order: "created_at.asc" }),
    db.select<Attachment>("ticket_attachments", "*", { ticket_id: `eq.${t.id}`, ...(internal ? {} : { internal: "eq.false" }), order: "created_at.asc" }),
    internal ? db.select<InternalNote>("ticket_internal_notes", "*", { ticket_id: `eq.${t.id}`, order: "created_at.asc" }) : Promise.resolve([] as InternalNote[]),
  ]);

  const names = await namesFor([...messages.map((m) => m.author_id), ...history.map((h) => h.actor_id), ...notes.map((n) => n.author_id), t.assigned_to]);
  // Al giocatore lo staff appare come "Staff TiberiusMC": i nomi degli operatori restano interni.
  const staffLabel = (id: string | null) => (staff || publicThread ? names.get(id ?? "") ?? "Staff" : "Staff TiberiusMC");

  const ids = [...new Set(messages.map((m) => m.author_id).filter(Boolean) as string[])];
  const cardRows = ids.length ? await db.rpc<CardRow[]>("forum_author_cards", { p_ids: ids }).catch(() => [] as CardRow[]) : [];
  const cards = new Map(cardRows.map((r) => [r.id, toCard(r)]));
  const cardFor = (m: TicketMessage): AuthorCard => {
    if (m.is_staff && !staff && !publicThread) return { name: "Staff TiberiusMC", head: null, role: "Staff", staff: true, messages: null, since: null };
    const c = cards.get(m.author_id ?? "");
    if (c) return c;
    const name = names.get(m.author_id ?? "") ?? (m.is_staff ? "Staff" : "Giocatore");
    return { name, head: null, role: m.is_staff ? "Staff" : "Giocatore", staff: m.is_staff, messages: null, since: null };
  };

  if (session) {
    // Aprire la pratica segna come lette le sue notifiche
    await db.update("notifications", { profile_id: `eq.${session.profile.id}`, ticket_id: `eq.${t.id}`, read_at: "is.null" }, { read_at: new Date().toISOString() }).catch(() => {});
  }

  if (author && !staff) {
    // Il giocatore ha visto gli aggiornamenti
    await db.update("tickets", { id: `eq.${t.id}` }, { author_seen_at: new Date().toISOString() }).catch(() => {});
  }

  const authorProfile = staff
    ? await db.one<Pick<Profile, "discord_username" | "mc_name" | "mc_uuid" | "mc_verified_by">>("profiles", "discord_username,mc_name,mc_uuid,mc_verified_by", { id: `eq.${t.author_id}` })
    : null;

  return {
    ticket: t,
    sub,
    role: staff ? "staff" : author ? "autore" : "lettore",
    canReply: !staff && (playerActions(viewer ?? NOBODY, t).includes("reply") || canReplyOpen(viewer, t)),
    messages: messages.map((m) => ({ ...m, author_name: m.is_staff ? staffLabel(m.author_id) : names.get(m.author_id ?? "") ?? "Giocatore", card: cardFor(m) })),
    history: history.map((h) => ({ ...h, actor_name: h.actor_role === "staff" ? staffLabel(h.actor_id) : h.actor_role === "sistema" ? "Sistema" : names.get(h.actor_id ?? "") ?? "Giocatore" })),
    attachments,
    notes: notes.map((n) => ({ ...n, author_name: names.get(n.author_id ?? "") ?? "Staff" })),
    assignee: staff && t.assigned_to ? { id: t.assigned_to, name: names.get(t.assigned_to) ?? "Staff" } : null,
    staffOptions: staff ? await staffFor(sub) : [],
    playerActions: playerActions(viewer ?? NOBODY, t),
    staffStatuses: viewer ? staffSettableStatuses(viewer, t) : [],
    authorProfile,
  };
}

const NOBODY = { profileId: "", permissions: new Set() } as Session["viewer"];

export async function listMine(session: Session): Promise<Ticket[]> {
  return db.select<Ticket>("tickets", "*", { author_id: `eq.${session.profile.id}`, order: "updated_at.desc", limit: 200 });
}

/* ------------------------------------------------------------------ */
/* Azioni del giocatore                                                 */
/* ------------------------------------------------------------------ */

export async function playerReply(session: Session, number: number, body: unknown, files: File[]) {
  const t = await loadVisible(session, number);
  const asAuthor = playerActions(session.viewer, t).includes("reply");
  if (!asAuthor && !canReplyOpen(session.viewer, t)) throw new HttpError(409, "Non puoi rispondere a questa discussione.");
  await rateLimit(`msg:${session.profile.id}`, 3600, 40);
  const text = cleanText(body, 8000);
  if (text.length < 2) throw new HttpError(422, "Scrivi un messaggio.");
  const prepared = await prepareFiles(files);
  const msg = await db.rpc<TicketMessage>("forum_add_message", { p_ticket: t.id, p_author: session.profile.id, p_is_staff: false, p_body: text, p_new_status: asAuthor ? statusAfterPlayerReply(t) : null });
  if (prepared.length) await saveAttachments(t.id, prepared, { messageId: msg.id, uploader: session.profile.id, internal: false });
}

export async function playerAction(session: Session, number: number, action: string, reason: unknown) {
  const t = await loadVisible(session, number);
  const allowed = playerActions(session.viewer, t);
  const why = cleanText(reason, 1000);

  if (action === "withdraw" && allowed.includes("withdraw")) {
    const to = withdrawStatus(t);
    if (!to) throw new HttpError(409, "Questa pratica non si può ritirare.");
    await db.rpc("forum_set_status", { p_ticket: t.id, p_actor: session.profile.id, p_actor_role: "giocatore", p_status: to, p_reason: why || "Ritirata dal giocatore", p_notify_kind: null });
    return;
  }
  if (action === "submit_draft" && allowed.includes("submit_draft")) {
    const s = requireSub(t.subcategory);
    const v = validateSubmission(s, { title: t.title, body: await firstMessageBody(t.id), fields: t.fields });
    if (!v.ok) throw new HttpError(422, "Completa la bozza prima di inviarla.", v.errors);
    await db.rpc("forum_set_status", { p_ticket: t.id, p_actor: session.profile.id, p_actor_role: "giocatore", p_status: s.initialStatus, p_reason: "Bozza inviata", p_notify_kind: null });
    await db.rpc("forum_notify_staff_new", { p_ticket: t.id }).catch(() => {});
    return;
  }
  if (action === "request_reopen" && allowed.includes("request_reopen")) {
    if (why.length < 10) throw new HttpError(422, "Spiega in almeno 10 caratteri perché va riaperta.");
    await rateLimit(`reopen:${session.profile.id}`, 86400, 5);
    await db.update("tickets", { id: `eq.${t.id}`, reopen_requested_at: "is.null" }, { reopen_requested_at: new Date().toISOString() });
    await db.insert("ticket_messages", { ticket_id: t.id, author_id: session.profile.id, is_staff: false, body: `Richiesta di riapertura: ${why}` }, { returning: false });
    await notifyStaffOf(t, "riapertura_richiesta", `Richiesta di riapertura della pratica #${t.number}`);
    return;
  }
  throw new HttpError(409, "Azione non consentita.");
}

async function firstMessageBody(ticketId: string): Promise<string> {
  const m = await db.one<{ body: string }>("ticket_messages", "body", { ticket_id: `eq.${ticketId}`, is_staff: "eq.false", order: "created_at.asc" });
  return m?.body ?? "";
}

/** Modifica di una bozza (solo autore, solo in stato bozza). */
export async function updateDraft(session: Session, number: number, input: { title?: unknown; body?: unknown; fields?: unknown }) {
  const t = await loadVisible(session, number);
  if (!playerActions(session.viewer, t).includes("edit_draft")) throw new HttpError(409, "Solo le bozze si possono modificare.");
  const s = requireSub(t.subcategory);
  const v = validateSubmission(s, input, { draft: true });
  if (!v.ok) throw new HttpError(422, "Controlla i campi evidenziati.", v.errors);
  await db.update("tickets", { id: `eq.${t.id}`, status: "eq.bozza" }, { title: v.title, fields: v.fields, updated_at: new Date().toISOString() });
  const first = await db.one<{ id: string }>("ticket_messages", "id", { ticket_id: `eq.${t.id}`, order: "created_at.asc" });
  if (first && v.body) await db.update("ticket_messages", { id: `eq.${first.id}` }, { body: v.body });
  else if (!first && v.body) await db.insert("ticket_messages", { ticket_id: t.id, author_id: session.profile.id, is_staff: false, body: v.body }, { returning: false });
}

/* ------------------------------------------------------------------ */
/* Azioni dello staff                                                   */
/* ------------------------------------------------------------------ */

async function loadForStaff(session: Session, number: number): Promise<Ticket> {
  const t = await loadVisible(session, number);
  if (!isStaffFor(session.viewer, t)) throw new HttpError(404, "Pratica non trovata.");
  return t;
}

async function notifyStaffOf(t: Ticket, kind: string, title: string) {
  const s = requireSub(t.subcategory);
  const target = t.assigned_to ? [t.assigned_to] : (await staffFor(s)).map((x) => x.id);
  const rows = target.filter((id) => id !== t.author_id).map((id) => ({ profile_id: id, ticket_id: t.id, kind, title }));
  if (rows.length) await db.insert("notifications", rows, { returning: false });
}

export async function staffReply(session: Session, number: number, body: unknown, newStatus: unknown, files: File[]) {
  const t = await loadForStaff(session, number);
  const text = cleanText(body, 8000);
  if (text.length < 2) throw new HttpError(422, "Scrivi un messaggio.");
  const status = typeof newStatus === "string" && newStatus ? newStatus : null;
  if (status && !staffSettableStatuses(session.viewer, t).includes(status)) throw new HttpError(422, "Stato non valido.");
  if (status && requiresReason(t, status)) throw new HttpError(422, "Per una decisione usa il pannello \"Cambia stato\" con la motivazione.");
  const prepared = await prepareFiles(files);
  const msg = await db.rpc<TicketMessage>("forum_add_message", { p_ticket: t.id, p_author: session.profile.id, p_is_staff: true, p_body: text, p_new_status: status });
  if (prepared.length) await saveAttachments(t.id, prepared, { messageId: msg.id, uploader: session.profile.id, internal: false });
  if (!t.assigned_to) await assign(session, t, session.profile.id, true);
  await audit(session.profile.id, "risposta_staff", { ticketId: t.id, details: { stato: status } });
}

export async function staffSetStatus(session: Session, number: number, status: string, reason: unknown) {
  const t = await loadForStaff(session, number);
  if (!staffSettableStatuses(session.viewer, t).includes(status)) throw new HttpError(422, "Stato non valido.");
  const why = cleanText(reason, 2000);
  if (requiresReason(t, status) && why.length < 5) throw new HttpError(422, "Per questa decisione scrivi una motivazione.");
  await db.rpc("forum_set_status", { p_ticket: t.id, p_actor: session.profile.id, p_actor_role: "staff", p_status: status, p_reason: why || null, p_notify_kind: notifyKindFor(t, status) });
  await audit(session.profile.id, "cambio_stato", { ticketId: t.id, details: { da: t.status, a: status, motivazione: why || null } });
}

/** Lo staff accoglie una richiesta di riapertura (o riapre di sua iniziativa). */
export async function staffReopen(session: Session, number: number, reason: unknown) {
  const t = await loadForStaff(session, number);
  if (!isFinal(t)) throw new HttpError(409, "La pratica è già aperta.");
  const why = cleanText(reason, 2000) || "Pratica riaperta";
  const to = workingStatus(requireSub(t.subcategory));
  await db.rpc("forum_set_status", { p_ticket: t.id, p_actor: session.profile.id, p_actor_role: "staff", p_status: to, p_reason: why, p_notify_kind: "cambio_stato" });
  await audit(session.profile.id, "riapertura", { ticketId: t.id, details: { motivazione: why } });
}

export async function staffAssign(session: Session, number: number, assignee: unknown) {
  const t = await loadForStaff(session, number);
  await assign(session, t, typeof assignee === "string" && assignee ? assignee : null, false);
}

async function assign(session: Session, t: Ticket, assignee: string | null, silent: boolean) {
  const s = requireSub(t.subcategory);
  if (assignee) {
    const allowed = (await staffFor(s)).some((x) => x.id === assignee);
    if (!allowed) throw new HttpError(422, "Questa persona non ha i permessi per la sezione.");
  }
  await db.update("tickets", { id: `eq.${t.id}` }, { assigned_to: assignee, updated_at: new Date().toISOString() });
  await db.insert("ticket_assignments", { ticket_id: t.id, assigned_to: assignee, assigned_by: session.profile.id }, { returning: false });
  if (assignee && assignee !== session.profile.id) {
    await db.insert("notifications", { profile_id: assignee, ticket_id: t.id, kind: "assegnazione", title: `Ti è stata assegnata la pratica #${t.number}` }, { returning: false });
  }
  if (!silent) await audit(session.profile.id, "assegnazione", { ticketId: t.id, targetId: assignee ?? undefined });
}

export async function staffPriority(session: Session, number: number, priority: unknown) {
  const t = await loadForStaff(session, number);
  if (!["bassa", "normale", "alta", "urgente"].includes(String(priority))) throw new HttpError(422, "Priorità non valida.");
  await db.update("tickets", { id: `eq.${t.id}` }, { priority });
  await audit(session.profile.id, "priorita", { ticketId: t.id, details: { priorita: priority } });
}

export async function staffNote(session: Session, number: number, body: unknown, files: File[]) {
  const t = await loadForStaff(session, number);
  const text = cleanText(body, 8000);
  if (text.length < 2) throw new HttpError(422, "Scrivi la nota.");
  const prepared = await prepareFiles(files);
  const [note] = await db.insert<InternalNote>("ticket_internal_notes", { ticket_id: t.id, author_id: session.profile.id, body: text });
  if (prepared.length) await saveAttachments(t.id, prepared, { noteId: note.id, uploader: session.profile.id, internal: true });
  await audit(session.profile.id, "nota_interna", { ticketId: t.id });
}

/** Lo staff conferma il ruolo Towny dichiarato o l'identità di un unban (non esiste ancora un'integrazione col server). */
export async function staffVerifyField(session: Session, number: number, field: string) {
  const t = await loadForStaff(session, number);
  if (!["ruolo", "nickname"].includes(field) || !t.fields[field]) throw new HttpError(422, "Campo non verificabile.");
  const fields = { ...t.fields, [`${field}_verificato_da`]: displayName(session.profile) };
  await db.update("tickets", { id: `eq.${t.id}` }, { fields });
  await audit(session.profile.id, "verifica_campo", { ticketId: t.id, details: { campo: field, valore: t.fields[field] } });
}

/* ------------------------------------------------------------------ */
/* Coda dello staff, ricerca, archivio                                  */
/* ------------------------------------------------------------------ */

export type QueueFilters = { sub?: string; status?: string; priority?: string; mine?: boolean; from?: string; to?: string; closed?: boolean };

export async function staffQueue(session: Session, f: QueueFilters): Promise<Ticket[]> {
  const subs = staffSubcategories(session.viewer);
  if (!subs.length) return [];
  const chosen = f.sub && subs.includes(f.sub) ? [f.sub] : subs;
  const filters: Record<string, string> = {
    subcategory: `in.${pgList(chosen)}`,
    status: f.status ? `eq.${f.status}` : "neq.bozza",
    order: "updated_at.desc",
    limit: "200",
  };
  if (f.priority) filters.priority = `eq.${f.priority}`;
  if (f.mine) filters.assigned_to = `eq.${session.profile.id}`;
  filters.closed_at = f.closed ? "not.is.null" : "is.null";
  const rows = await db.select<Ticket>("tickets", "*", filters);
  return rows.filter((t) => (!f.from || t.created_at >= f.from) && (!f.to || t.created_at.slice(0, 10) <= f.to) && t.status !== "bozza");
}

export type SearchParams = { q?: string; number?: number | null; sub?: string; status?: string; from?: string; to?: string; author?: string; closed?: boolean | null };

export async function search(session: Session | null, p: SearchParams, ip = "anon"): Promise<Ticket[]> {
  await rateLimit(session ? `search:${session.profile.id}` : `search-ip:${ip.slice(0, 64)}`, 60, 30);
  const isDate = (d?: string) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null);
  return db.rpc<Ticket[]>("forum_search", {
    p_viewer: session?.profile.id ?? null,
    p_staff_subs: session ? staffSubcategories(session.viewer) : [],
    p_q: cleanText(p.q, 100) || null,
    p_number: p.number ?? null,
    p_subcategory: p.sub && getSubcategory(p.sub) ? p.sub : null,
    p_status: p.status ? cleanText(p.status, 40) : null,
    p_from: isDate(p.from),
    p_to: isDate(p.to),
    p_author: cleanText(p.author, 16) || null,
    p_closed: p.closed ?? null,
    p_limit: 100,
  });
}

export async function notificationsFor(session: Session, limit = 50) {
  return db.select<{ id: string; ticket_id: string | null; kind: string; title: string; created_at: string; read_at: string | null; tickets: { number: number } | null }>(
    "notifications",
    "id,ticket_id,kind,title,created_at,read_at,tickets(number)",
    { profile_id: `eq.${session.profile.id}`, order: "created_at.desc", limit: String(limit) },
  );
}

export async function markNotificationsRead(session: Session, ids: string[] | "all") {
  const filters: Record<string, string> = { profile_id: `eq.${session.profile.id}`, read_at: "is.null" };
  if (ids !== "all") {
    const clean = ids.filter((i) => /^[0-9a-f-]{36}$/i.test(i));
    if (!clean.length) return;
    filters.id = `in.${pgList(clean)}`;
  }
  await db.update("notifications", filters, { read_at: new Date().toISOString() });
}

/* ------------------------------------------------------------------ */
/* Forum pubblico: elenchi, statistiche, membri, utenti online          */
/* Solo discussioni pubbliche: le sezioni private non compaiono mai.   */
/* ------------------------------------------------------------------ */

export type ThreadRow = {
  number: number;
  subcategory: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_mc: string | null;
  replies: number;
  last_at: string | null;
  last_name: string | null;
  last_mc: string | null;
  total: number;
};

export const THREADS_PER_PAGE = 20;

/** Discussioni pubbliche (di una sezione o di tutte), dall'attività più recente. Vuoto se la migrazione 005 manca. */
export async function publicThreads(opts: { sub?: string | null; status?: string | null; page?: number; limit?: number } = {}): Promise<{ rows: ThreadRow[]; total: number }> {
  const limit = opts.limit ?? THREADS_PER_PAGE;
  const page = Math.max(1, Math.floor(opts.page ?? 1));
  try {
    const rows = await db.rpc<ThreadRow[]>("forum_public_threads", {
      p_subcategory: opts.sub ?? null,
      p_status: opts.status ?? null,
      p_limit: limit,
      p_offset: (page - 1) * limit,
    });
    return { rows: rows.map((r) => ({ ...r, replies: Number(r.replies), total: Number(r.total) })), total: Number(rows[0]?.total ?? 0) };
  } catch {
    return { rows: [], total: 0 };
  }
}

/** Per ogni sezione pubblica: discussioni, messaggi e ultima discussione attiva. */
export async function sectionOverview(): Promise<Map<string, { threads: number; messages: number; last: ThreadRow | null }>> {
  const out = new Map<string, { threads: number; messages: number; last: ThreadRow | null }>();
  const pub = SUBCATEGORIES.filter((s) => s.public);
  try {
    const counts = await db.rpc<{ subcategory: string; threads: number; messages: number }[]>("forum_section_counts", {});
    const lasts = await Promise.all(pub.map((s) => publicThreads({ sub: s.key, limit: 1 })));
    pub.forEach((s, i) => {
      const c = counts.find((x) => x.subcategory === s.key);
      out.set(s.key, { threads: Number(c?.threads ?? 0), messages: Number(c?.messages ?? 0), last: lasts[i].rows[0] ?? null });
    });
  } catch {
    // Migrazione 005 non ancora eseguita: sezioni senza numeri
  }
  return out;
}

export type ForumStats = { threads: number; messages: number; members: number; newest: string | null; newestMc: string | null };

export async function forumStats(): Promise<ForumStats | null> {
  try {
    const [r] = await db.rpc<{ threads: number; messages: number; members: number; newest: string | null; newest_mc: string | null }[]>("forum_stats", {});
    return r ? { threads: Number(r.threads), messages: Number(r.messages), members: Number(r.members), newest: r.newest, newestMc: r.newest_mc } : null;
  } catch {
    return null;
  }
}

export type OnlineUser = { name: string; head: string | null; role: string; staff: boolean };

export async function onlineNow(): Promise<OnlineUser[]> {
  try {
    const rows = await db.rpc<{ name: string; mc_name: string | null; is_staff: boolean }[]>("forum_online", {});
    return rows.map((r) => {
      const listed = staffRoleFor(r.name);
      return { name: r.name, head: r.mc_name ?? listed?.head ?? null, role: listed?.role ?? (r.is_staff ? "Staff" : "Giocatore"), staff: r.is_staff || Boolean(listed) };
    });
  } catch {
    return [];
  }
}

export type MemberRow = { name: string; head: string | null; role: string; staff: boolean; since: string; lastSeen: string | null; messages: number };
export const MEMBERS_PER_PAGE = 30;

export async function members(q: string, page: number): Promise<{ rows: MemberRow[]; total: number }> {
  try {
    const rows = await db.rpc<{ name: string; mc_name: string | null; created_at: string; last_seen_at: string | null; messages: number; is_staff: boolean; total: number }[]>("forum_members", {
      p_q: cleanText(q, 32) || null,
      p_limit: MEMBERS_PER_PAGE,
      p_offset: (Math.max(1, page) - 1) * MEMBERS_PER_PAGE,
    });
    return {
      rows: rows.map((r) => {
        const listed = staffRoleFor(r.name);
        return { name: r.name, head: r.mc_name ?? listed?.head ?? null, role: listed?.role ?? (r.is_staff ? "Staff" : "Giocatore"), staff: r.is_staff || Boolean(listed), since: r.created_at, lastSeen: r.last_seen_at, messages: Number(r.messages) };
      }),
      total: Number(rows[0]?.total ?? 0),
    };
  } catch {
    return { rows: [], total: 0 };
  }
}

/** Le proprie pratiche di una sezione (per le sezioni private). */
export async function listMineIn(session: Session, subKey: string): Promise<Ticket[]> {
  return db.select<Ticket>("tickets", "*", { author_id: `eq.${session.profile.id}`, subcategory: `eq.${subKey}`, order: "updated_at.desc", limit: 100 });
}

/* ------------------------------------------------------------------ */
/* Allegati                                                             */
/* ------------------------------------------------------------------ */

export async function attachmentForDownload(session: Session | null, id: string): Promise<Attachment> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new HttpError(404, "Allegato non trovato.");
  const a = await db.one<Attachment>("ticket_attachments", "*", { id: `eq.${id}` });
  if (!a) throw new HttpError(404, "Allegato non trovato.");
  const t = await db.one<Ticket>("tickets", "*", { id: `eq.${a.ticket_id}` });
  if (!t || !canView(session?.viewer ?? null, t) || (a.internal && !canSeeInternal(session?.viewer ?? null, t))) throw new HttpError(404, "Allegato non trovato.");
  return a;
}

/* ------------------------------------------------------------------ */
/* Amministrazione                                                      */
/* ------------------------------------------------------------------ */

export function requireAdmin(session: Session) {
  if (!isAdmin(session.viewer)) throw new HttpError(404, "Pagina non trovata.");
}

/** Applica la politica di conservazione: elimina le pratiche chiuse da più di N giorni, con i loro allegati. */
export async function applyRetention(session: Session): Promise<number> {
  requireAdmin(session);
  const row = await db.one<{ value: { conservazione_giorni: number | null } }>("forum_settings", "value", { key: "eq.archivio" });
  const days = row?.value.conservazione_giorni;
  if (!days || days < 30) throw new HttpError(422, "Imposta prima una conservazione di almeno 30 giorni.");
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
  const old = await db.select<{ id: string; number: number }>("tickets", "id,number", { closed_at: `lt.${cutoff}`, limit: "500" });
  if (!old.length) return 0;
  const ids = old.map((t) => t.id);
  const files = await db.select<{ storage_path: string }>("ticket_attachments", "storage_path", { ticket_id: `in.${pgList(ids)}` });
  await removeFiles(files.map((f) => f.storage_path));
  await db.remove("tickets", { id: `in.${pgList(ids)}` });
  await audit(session.profile.id, "conservazione_applicata", { details: { giorni: days, pratiche: old.map((t) => t.number) } });
  return old.length;
}
