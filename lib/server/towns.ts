/**
 * Gestionale delle città (fase 1). Ogni funzione controlla chi sta agendo
 * prima di toccare il database: ruoli nella città (sindaco, assistente,
 * cittadino) e permesso staff "citta" per le registrazioni.
 */

import { randomUUID } from "node:crypto";
import { db, DbError, pgList, storageEndpoint } from "./db";
import { audit, HttpError, rateLimit } from "./http";
import { displayName, type Session } from "./auth";
import type { Profile } from "./types";
import { can, isManager, LIMITS, townSlug, validTownName, type ProjectStatus, type TownAction, type TownRole, type TownStatus } from "@/lib/gestionale/config";
import { cleanText, isAdmin, MIME_EXT, sniffMime } from "@/lib/forum/rules";

const BUCKET = "citta-immagini";
const IMAGE_MAX = 4 * 1024 * 1024;

export type Town = {
  id: string;
  slug: string;
  name: string;
  motto: string;
  description: string;
  nation: string;
  recruiting: boolean;
  emblem_path: string | null;
  photos: string[];
  status: TownStatus;
  review_note: string | null;
  founder_id: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type Member = { profile_id: string; role: TownRole; joined_at: string; name: string; mc: string | null };
export type Membership = { town: Town; role: TownRole };

const TOWN_COLS = "id,slug,name,motto,description,nation,recruiting,emblem_path,photos,status,review_note,founder_id,created_at,reviewed_at";

export function imageUrl(path: string | null): string | null {
  if (!path) return null;
  const base = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  return base ? `${base}/storage/v1/object/public/${BUCKET}/${path}` : null;
}

/** Errori del database tradotti in messaggi per il giocatore. */
function friendly(e: unknown): never {
  if (e instanceof DbError) {
    const m = e.message ?? "";
    if (m.includes("gia_in_una_citta")) throw new HttpError(409, "Fai già parte di una città.");
    if (m.includes("gia_decisa")) throw new HttpError(409, "È già stata decisa.");
    if (m.includes("citta_non_attiva")) throw new HttpError(409, "La città non è ancora attiva.");
    if (e.code === "23505") throw new HttpError(409, "Esiste già: controlla il nome o le richieste in corso.");
  }
  throw e;
}

/* ------------------------------------------------------------------ */
/* Lettura                                                              */
/* ------------------------------------------------------------------ */

export async function myMembership(session: Session): Promise<Membership | null> {
  try {
    const m = await db.one<{ role: TownRole; towns: Town }>("town_members", `role,towns(${TOWN_COLS})`, { profile_id: `eq.${session.profile.id}` });
    return m?.towns ? { town: m.towns, role: m.role } : null;
  } catch {
    // Migrazione 006 non ancora eseguita
    return null;
  }
}

export async function activeTowns(): Promise<(Town & { members: number; mayor: string | null })[]> {
  try {
    const towns = await db.select<Town>("towns", TOWN_COLS, { status: "eq.attiva", order: "name.asc", limit: "200" });
    if (!towns.length) return [];
    const members = await db.select<{ town_id: string; role: TownRole; profiles: Pick<Profile, "mc_name" | "discord_username"> }>(
      "town_members",
      "town_id,role,profiles(mc_name,discord_username)",
      { town_id: `in.${pgList(towns.map((t) => t.id))}` },
    );
    return towns.map((t) => {
      const mine = members.filter((m) => m.town_id === t.id);
      const mayor = mine.find((m) => m.role === "sindaco");
      return { ...t, members: mine.length, mayor: mayor ? displayName(mayor.profiles) : null };
    });
  } catch {
    return [];
  }
}

export async function townBySlug(slug: string): Promise<Town | null> {
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  try {
    return await db.one<Town>("towns", TOWN_COLS, { slug: `eq.${slug}` });
  } catch {
    return null;
  }
}

export async function townMembers(townId: string): Promise<Member[]> {
  const rows = await db.select<{ profile_id: string; role: TownRole; joined_at: string; profiles: Pick<Profile, "mc_name" | "discord_username"> }>(
    "town_members",
    "profile_id,role,joined_at,profiles(mc_name,discord_username)",
    { town_id: `eq.${townId}`, order: "joined_at.asc" },
  );
  const order: Record<TownRole, number> = { sindaco: 0, assistente: 1, cittadino: 2 };
  return rows
    .map((r) => ({ profile_id: r.profile_id, role: r.role, joined_at: r.joined_at, name: displayName(r.profiles), mc: r.profiles.mc_name }))
    .sort((a, b) => order[a.role] - order[b.role] || a.joined_at.localeCompare(b.joined_at));
}

/* ------------------------------------------------------------------ */
/* Registrazione e verifica dello staff                                 */
/* ------------------------------------------------------------------ */

export async function registerTown(session: Session, input: { name: unknown; motto: unknown; description: unknown; nation: unknown }) {
  await rateLimit(`town-reg:${session.profile.id}`, 86400, 3);
  const name = cleanText(input.name, LIMITS.name);
  const errors: Record<string, string> = {};
  if (!validTownName(name)) errors.name = "Nome non valido: 3-40 caratteri, lettere, numeri, spazi, apostrofi e trattini.";
  const motto = cleanText(input.motto, LIMITS.motto);
  const description = cleanText(input.description, LIMITS.description);
  const nation = cleanText(input.nation, LIMITS.nation);
  if (description.length < 20) errors.description = "Racconta la tua città in almeno 20 caratteri.";
  if (Object.keys(errors).length) throw new HttpError(422, "Controlla i campi evidenziati.", errors);
  let slug = townSlug(name);
  if (await db.one("towns", "id", { slug: `eq.${slug}` })) slug = `${slug}-${randomUUID().slice(0, 4)}`;
  try {
    const t = await db.rpc<Town>("town_register", { p_founder: session.profile.id, p_slug: slug, p_name: name, p_motto: motto, p_description: description, p_nation: nation });
    await audit(session.profile.id, "citta_registrata", { details: { citta: name } });
    return t;
  } catch (e) {
    friendly(e);
  }
}

export function canReviewTowns(session: Session): boolean {
  return session.viewer.permissions.has("citta") || isAdmin(session.viewer);
}

export async function pendingTowns(session: Session) {
  if (!canReviewTowns(session)) throw new HttpError(404, "Pagina non trovata.");
  const towns = await db.select<Town & { profiles: Pick<Profile, "mc_name" | "discord_username" | "mc_uuid"> | null }>(
    "towns",
    `${TOWN_COLS},profiles!towns_founder_id_fkey(mc_name,discord_username,mc_uuid)`,
    { status: "eq.in_attesa", order: "created_at.asc" },
  );
  return towns;
}

export async function reviewTown(session: Session, townId: string, approve: boolean, note: unknown) {
  if (!canReviewTowns(session)) throw new HttpError(404, "Pagina non trovata.");
  const why = cleanText(note, 1000);
  if (!approve && why.length < 5) throw new HttpError(422, "Scrivi il motivo (almeno 5 caratteri).");
  try {
    const t = await db.rpc<Town>("town_review", { p_town: townId, p_actor: session.profile.id, p_approve: approve, p_note: why || null });
    await audit(session.profile.id, approve ? "citta_approvata" : "citta_respinta", { details: { citta: t.name, nota: why || null } });
  } catch (e) {
    friendly(e);
  }
}

/* ------------------------------------------------------------------ */
/* Permessi dentro la città                                             */
/* ------------------------------------------------------------------ */

async function requireRole(session: Session, action: TownAction): Promise<Membership> {
  const m = await myMembership(session);
  if (!m || m.town.status !== "attiva") throw new HttpError(403, "Non fai parte di una città attiva.");
  if (!can(m.role, action)) throw new HttpError(403, "Il tuo ruolo non permette questa azione.");
  return m;
}

async function notifyTown(townId: string, exceptId: string, kind: string, title: string, onlyManagers = false) {
  const rows = await db.select<{ profile_id: string; role: TownRole }>("town_members", "profile_id,role", { town_id: `eq.${townId}` });
  const target = rows.filter((r) => r.profile_id !== exceptId && (!onlyManagers || isManager(r.role)));
  if (target.length) await db.insert("notifications", target.map((r) => ({ profile_id: r.profile_id, town_id: townId, kind, title: title.slice(0, 200) })), { returning: false });
}

/* ------------------------------------------------------------------ */
/* Candidature                                                          */
/* ------------------------------------------------------------------ */

export type Application = { id: string; town_id: string; profile_id: string; message: string; status: string; created_at: string; name: string; mc: string | null };

export async function applyToTown(session: Session, townId: string, message: unknown) {
  await rateLimit(`town-apply:${session.profile.id}`, 3600, 10);
  if (await myMembership(session)) throw new HttpError(409, "Fai già parte di una città.");
  const t = await db.one<Town>("towns", TOWN_COLS, { id: `eq.${townId}` });
  if (!t || t.status !== "attiva") throw new HttpError(404, "Città non trovata.");
  if (!t.recruiting) throw new HttpError(409, "Questa città al momento non accetta nuovi cittadini.");
  const text = cleanText(message, LIMITS.message);
  try {
    await db.insert("town_applications", { town_id: t.id, profile_id: session.profile.id, message: text }, { returning: false });
  } catch (e) {
    friendly(e);
  }
  await notifyTown(t.id, session.profile.id, "citta_candidatura", `${displayName(session.profile)} vuole entrare in ${t.name}`, true);
}

export async function myApplications(session: Session) {
  try {
    return await db.select<{ id: string; status: string; created_at: string; towns: Pick<Town, "name" | "slug"> }>("town_applications", "id,status,created_at,towns(name,slug)", {
      profile_id: `eq.${session.profile.id}`,
      order: "created_at.desc",
      limit: "10",
    });
  } catch {
    return [];
  }
}

export async function withdrawApplication(session: Session, id: string) {
  await db.update("town_applications", { id: `eq.${id}`, profile_id: `eq.${session.profile.id}`, status: "eq.in_attesa" }, { status: "ritirata", decided_at: new Date().toISOString() });
}

export async function townApplications(session: Session): Promise<Application[]> {
  const m = await requireRole(session, "candidature");
  const rows = await db.select<{ id: string; town_id: string; profile_id: string; message: string; status: string; created_at: string; profiles: Pick<Profile, "mc_name" | "discord_username"> }>(
    "town_applications",
    "id,town_id,profile_id,message,status,created_at,profiles!town_applications_profile_id_fkey(mc_name,discord_username)",
    { town_id: `eq.${m.town.id}`, status: "eq.in_attesa", order: "created_at.asc" },
  );
  return rows.map((r) => ({ ...r, name: displayName(r.profiles), mc: r.profiles.mc_name }));
}

export async function decideApplication(session: Session, id: string, accept: boolean) {
  const m = await requireRole(session, "candidature");
  const a = await db.one<{ id: string; town_id: string }>("town_applications", "id,town_id", { id: `eq.${id}` });
  if (!a || a.town_id !== m.town.id) throw new HttpError(404, "Candidatura non trovata.");
  try {
    await db.rpc("town_decide_application", { p_app: id, p_actor: session.profile.id, p_accept: accept });
  } catch (e) {
    friendly(e);
  }
  await audit(session.profile.id, accept ? "citta_candidatura_accettata" : "citta_candidatura_rifiutata", { details: { citta: m.town.name } });
}

/* ------------------------------------------------------------------ */
/* Cittadini e ruoli                                                    */
/* ------------------------------------------------------------------ */

export async function setMemberRole(session: Session, profileId: string, role: "assistente" | "cittadino") {
  const m = await requireRole(session, "ruoli");
  if (profileId === session.profile.id) throw new HttpError(409, "Non puoi cambiare il tuo ruolo.");
  const rows = await db.update<{ profile_id: string }>("town_members", { profile_id: `eq.${profileId}`, town_id: `eq.${m.town.id}`, role: "neq.sindaco" }, { role });
  if (!rows.length) throw new HttpError(404, "Cittadino non trovato.");
  await audit(session.profile.id, "citta_ruolo", { targetId: profileId, details: { citta: m.town.name, ruolo: role } });
}

export async function removeMember(session: Session, profileId: string) {
  const m = await myMembership(session);
  if (!m || m.town.status !== "attiva") throw new HttpError(403, "Non fai parte di una città attiva.");
  const target = await db.one<{ role: TownRole; town_id: string }>("town_members", "role,town_id", { profile_id: `eq.${profileId}` });
  if (!target || target.town_id !== m.town.id || target.role === "sindaco") throw new HttpError(404, "Cittadino non trovato.");
  if (!can(m.role, target.role === "assistente" ? "rimuovi_assistente" : "rimuovi_cittadino")) throw new HttpError(403, "Il tuo ruolo non permette questa azione.");
  await db.remove("town_members", { profile_id: `eq.${profileId}`, town_id: `eq.${m.town.id}` });
  await db.insert("notifications", { profile_id: profileId, town_id: m.town.id, kind: "citta_esito", title: `Non fai più parte della città ${m.town.name}` }, { returning: false });
  await audit(session.profile.id, "citta_rimozione", { targetId: profileId, details: { citta: m.town.name } });
}

export async function leaveTown(session: Session) {
  const m = await requireRole(session, "lascia");
  await db.remove("town_members", { profile_id: `eq.${session.profile.id}`, town_id: `eq.${m.town.id}` });
}

/* ------------------------------------------------------------------ */
/* Impostazioni e immagini                                              */
/* ------------------------------------------------------------------ */

export async function updateTown(session: Session, input: { motto: unknown; description: unknown; nation: unknown; recruiting: unknown }) {
  const m = await requireRole(session, "modifica_citta");
  const description = cleanText(input.description, LIMITS.description);
  if (description.length < 20) throw new HttpError(422, "Controlla i campi evidenziati.", { description: "Almeno 20 caratteri." });
  await db.update("towns", { id: `eq.${m.town.id}` }, {
    motto: cleanText(input.motto, LIMITS.motto),
    description,
    nation: cleanText(input.nation, LIMITS.nation),
    recruiting: input.recruiting === "1",
    updated_at: new Date().toISOString(),
  });
}

async function uploadImage(townId: string, file: File): Promise<string> {
  if (file.size > IMAGE_MAX) throw new HttpError(413, "L'immagine supera 4 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffMime(bytes);
  if (!mime || !mime.startsWith("image/")) throw new HttpError(415, "Carica un'immagine PNG, JPG, GIF o WebP.");
  const path = `${townId}/${randomUUID()}.${MIME_EXT[mime] ?? "img"}`;
  const { url, headers } = storageEndpoint(`object/${BUCKET}/${path}`);
  const res = await fetch(url, { method: "POST", headers: { ...headers, "Content-Type": mime, "x-upsert": "false", "Cache-Control": "public, max-age=31536000, immutable" }, body: Buffer.from(bytes), cache: "no-store" });
  if (!res.ok) throw new HttpError(502, "Caricamento dell'immagine non riuscito.");
  return path;
}

async function removeImages(paths: string[]) {
  if (!paths.length) return;
  const { url, headers } = storageEndpoint(`object/${BUCKET}`);
  await fetch(url, { method: "DELETE", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: paths }), cache: "no-store" }).catch(() => {});
}

export async function setEmblem(session: Session, file: File) {
  const m = await requireRole(session, "modifica_citta");
  await rateLimit(`town-img:${session.profile.id}`, 3600, 30);
  const path = await uploadImage(m.town.id, file);
  await db.update("towns", { id: `eq.${m.town.id}` }, { emblem_path: path, updated_at: new Date().toISOString() });
  if (m.town.emblem_path) await removeImages([m.town.emblem_path]);
}

export async function addPhoto(session: Session, file: File) {
  const m = await requireRole(session, "modifica_citta");
  if (m.town.photos.length >= LIMITS.photos) throw new HttpError(409, `Al massimo ${LIMITS.photos} foto.`);
  await rateLimit(`town-img:${session.profile.id}`, 3600, 30);
  const path = await uploadImage(m.town.id, file);
  await db.update("towns", { id: `eq.${m.town.id}` }, { photos: [...m.town.photos, path], updated_at: new Date().toISOString() });
}

export async function removePhoto(session: Session, path: string) {
  const m = await requireRole(session, "modifica_citta");
  if (!m.town.photos.includes(path)) throw new HttpError(404, "Foto non trovata.");
  await db.update("towns", { id: `eq.${m.town.id}` }, { photos: m.town.photos.filter((p) => p !== path), updated_at: new Date().toISOString() });
  await removeImages([path]);
}

/* ------------------------------------------------------------------ */
/* Bacheca                                                              */
/* ------------------------------------------------------------------ */

export type Post = { id: string; author_id: string | null; parent_id: string | null; body: string; pinned: boolean; created_at: string; name: string; mc: string | null; role: TownRole | null };

export async function townPosts(townId: string): Promise<(Post & { replies: Post[] })[]> {
  const rows = await db.select<{ id: string; author_id: string | null; parent_id: string | null; body: string; pinned: boolean; created_at: string; profiles: Pick<Profile, "mc_name" | "discord_username"> | null }>(
    "town_posts",
    "id,author_id,parent_id,body,pinned,created_at,profiles(mc_name,discord_username)",
    { town_id: `eq.${townId}`, order: "created_at.desc", limit: "300" },
  );
  const roles = new Map((await db.select<{ profile_id: string; role: TownRole }>("town_members", "profile_id,role", { town_id: `eq.${townId}` })).map((r) => [r.profile_id, r.role]));
  const posts: Post[] = rows.map((r) => ({
    id: r.id,
    author_id: r.author_id,
    parent_id: r.parent_id,
    body: r.body,
    pinned: r.pinned,
    created_at: r.created_at,
    name: r.profiles ? displayName(r.profiles) : "Ex cittadino",
    mc: r.profiles?.mc_name ?? null,
    role: r.author_id ? roles.get(r.author_id) ?? null : null,
  }));
  const top = posts.filter((p) => !p.parent_id).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.created_at.localeCompare(a.created_at));
  return top.map((p) => ({ ...p, replies: posts.filter((r) => r.parent_id === p.id).sort((a, b) => a.created_at.localeCompare(b.created_at)) }));
}

export async function createPost(session: Session, body: unknown, parentId: string | null, announce: boolean) {
  const m = await requireRole(session, "scrivi");
  await rateLimit(`town-post:${session.profile.id}`, 3600, 40);
  const text = cleanText(body, LIMITS.post);
  if (text.length < 2) throw new HttpError(422, "Scrivi un messaggio.");
  if (parentId) {
    const p = await db.one<{ town_id: string; parent_id: string | null }>("town_posts", "town_id,parent_id", { id: `eq.${parentId}` });
    if (!p || p.town_id !== m.town.id || p.parent_id) throw new HttpError(404, "Messaggio non trovato.");
  }
  const pinned = !parentId && announce && can(m.role, "fissa_post");
  await db.insert("town_posts", { town_id: m.town.id, author_id: session.profile.id, parent_id: parentId, body: text, pinned }, { returning: false });
  if (pinned) await notifyTown(m.town.id, session.profile.id, "citta_annuncio", `Nuovo annuncio in ${m.town.name}`);
}

export async function deletePost(session: Session, id: string) {
  const m = await requireRole(session, "scrivi");
  const p = await db.one<{ town_id: string; author_id: string | null }>("town_posts", "town_id,author_id", { id: `eq.${id}` });
  if (!p || p.town_id !== m.town.id) throw new HttpError(404, "Messaggio non trovato.");
  if (p.author_id !== session.profile.id && !can(m.role, "elimina_post_altrui")) throw new HttpError(403, "Puoi eliminare solo i tuoi messaggi.");
  await db.remove("town_posts", { id: `eq.${id}` });
}

export async function togglePin(session: Session, id: string) {
  const m = await requireRole(session, "fissa_post");
  const p = await db.one<{ town_id: string; pinned: boolean; parent_id: string | null }>("town_posts", "town_id,pinned,parent_id", { id: `eq.${id}` });
  if (!p || p.town_id !== m.town.id || p.parent_id) throw new HttpError(404, "Messaggio non trovato.");
  await db.update("town_posts", { id: `eq.${id}` }, { pinned: !p.pinned });
}

/* ------------------------------------------------------------------ */
/* Cantieri                                                             */
/* ------------------------------------------------------------------ */

export type ProjectItem = { id: string; name: string; needed: number; done: number; position: number };
export type Project = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: ProjectStatus;
  lead_id: string | null;
  lead: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  items: ProjectItem[];
};

export async function townProjects(townId: string): Promise<Project[]> {
  const rows = await db.select<Omit<Project, "lead" | "items"> & { profiles: Pick<Profile, "mc_name" | "discord_username"> | null; town_project_items: ProjectItem[] }>(
    "town_projects",
    "id,title,description,location,status,lead_id,created_at,updated_at,completed_at,profiles!town_projects_lead_id_fkey(mc_name,discord_username),town_project_items(id,name,needed,done,position)",
    { town_id: `eq.${townId}`, order: "updated_at.desc", limit: "100" },
  );
  return rows.map(({ profiles, town_project_items, ...p }) => ({ ...p, lead: profiles ? displayName(profiles) : null, items: [...town_project_items].sort((a, b) => a.position - b.position) }));
}

function parseItems(raw: unknown): { name: string; needed: number }[] {
  // Una riga per materiale: "64 pietra" oppure "pietra 64" oppure "pietra: 64"
  const lines = cleanText(raw, 3000).split("\n").map((l) => l.trim()).filter(Boolean).slice(0, LIMITS.items);
  return lines.map((l) => {
    const m = l.match(/^(\d{1,7})\s*x?\s+(.+)$/i) ?? l.match(/^(.+?)[\s:x]+(\d{1,7})$/i);
    if (!m) throw new HttpError(422, `Riga dei materiali non valida: "${l}". Scrivi ad esempio "64 pietra".`);
    const [qty, name] = /^\d/.test(m[1]) ? [m[1], m[2]] : [m[2], m[1]];
    const needed = Number(qty);
    if (!needed || needed > 1_000_000) throw new HttpError(422, `Quantità non valida in "${l}".`);
    return { name: name.trim().slice(0, LIMITS.itemName), needed };
  });
}

export async function createProject(session: Session, input: { title: unknown; description: unknown; location: unknown; lead: unknown; items: unknown }) {
  const m = await requireRole(session, "gestisci_cantieri");
  await rateLimit(`town-proj:${session.profile.id}`, 3600, 20);
  const title = cleanText(input.title, LIMITS.projectTitle);
  if (title.length < 3) throw new HttpError(422, "Controlla i campi evidenziati.", { title: "Almeno 3 caratteri." });
  const items = parseItems(input.items);
  const lead = typeof input.lead === "string" && input.lead ? input.lead : null;
  if (lead && !(await db.one("town_members", "profile_id", { profile_id: `eq.${lead}`, town_id: `eq.${m.town.id}` }))) throw new HttpError(422, "Il responsabile deve essere un cittadino.");
  const [p] = await db.insert<{ id: string }>("town_projects", {
    town_id: m.town.id,
    title,
    description: cleanText(input.description, LIMITS.projectText),
    location: cleanText(input.location, LIMITS.location),
    lead_id: lead,
    created_by: session.profile.id,
  });
  if (items.length) await db.insert("town_project_items", items.map((it, i) => ({ project_id: p.id, ...it, position: i })), { returning: false });
}

async function projectOf(m: Membership, id: string) {
  const p = await db.one<{ id: string; town_id: string; status: ProjectStatus }>("town_projects", "id,town_id,status", { id: `eq.${id}` });
  if (!p || p.town_id !== m.town.id) throw new HttpError(404, "Cantiere non trovato.");
  return p;
}

export async function setProjectStatus(session: Session, id: string, status: string) {
  const m = await requireRole(session, "gestisci_cantieri");
  if (!["da_iniziare", "in_corso", "fermo", "completato"].includes(status)) throw new HttpError(422, "Stato non valido.");
  await projectOf(m, id);
  const now = new Date().toISOString();
  await db.update("town_projects", { id: `eq.${id}` }, { status, updated_at: now, completed_at: status === "completato" ? now : null });
}

export async function deleteProject(session: Session, id: string) {
  const m = await requireRole(session, "gestisci_cantieri");
  await projectOf(m, id);
  await db.remove("town_projects", { id: `eq.${id}` });
}

/** Ogni cittadino può segnare quanto materiale ha portato. */
export async function updateItem(session: Session, itemId: string, done: unknown) {
  const m = await requireRole(session, "aggiorna_materiali");
  const it = await db.one<{ id: string; project_id: string; needed: number }>("town_project_items", "id,project_id,needed", { id: `eq.${itemId}` });
  if (!it) throw new HttpError(404, "Materiale non trovato.");
  await projectOf(m, it.project_id);
  const n = Number(done);
  if (!Number.isInteger(n) || n < 0 || n > 1_000_000) throw new HttpError(422, "Quantità non valida.");
  await db.update("town_project_items", { id: `eq.${itemId}` }, { done: n });
  await db.update("town_projects", { id: `eq.${it.project_id}` }, { updated_at: new Date().toISOString() });
}

/* ------------------------------------------------------------------ */
/* Panoramica                                                           */
/* ------------------------------------------------------------------ */

export async function overview(m: Membership) {
  const [members, apps, projects, posts] = await Promise.all([
    townMembers(m.town.id),
    isManager(m.role) ? db.select<{ id: string }>("town_applications", "id", { town_id: `eq.${m.town.id}`, status: "eq.in_attesa" }) : Promise.resolve([]),
    townProjects(m.town.id),
    townPosts(m.town.id),
  ]);
  return { members, pendingApplications: apps.length, projects, latestPosts: posts.slice(0, 3) };
}
