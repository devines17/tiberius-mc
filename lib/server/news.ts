/**
 * News: lettura (con cache, svuotata a ogni pubblicazione) e scrittura.
 * Le copertine stanno nel bucket pubblico "news-copertine" di Supabase Storage.
 */

import { randomBytes, randomUUID } from "node:crypto";
import { cacheLife, cacheTag } from "next/cache";
import { db, dbConfigured, storageEndpoint } from "./db";
import { HttpError } from "./http";
import { NEWS_DEFAULT_COVER, slugify } from "@/lib/news/config";
import { sniffMime, MIME_EXT } from "@/lib/forum/rules";

export const NEWS_TAG = "news";
const BUCKET = "news-copertine";
const COVER_MAX = 4 * 1024 * 1024;

export type NewsRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  cover_path: string | null;
  event_at: string | null;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/** News pronta per le pagine: copertina già risolta e nome dell'autore. */
export type NewsItem = Omit<NewsRow, "cover_path" | "author_id"> & { cover: string; author: string | null; authorMc: string | null };

const COLS = "id,slug,title,category,summary,body,cover_path,event_at,author_id,published_at,created_at,updated_at,profiles(mc_name,discord_username)";
type Joined = NewsRow & { profiles: { mc_name: string | null; discord_username: string } | null };

export function coverUrl(path: string | null): string {
  if (!path) return NEWS_DEFAULT_COVER;
  const base = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  return base ? `${base}/storage/v1/object/public/${BUCKET}/${path}` : NEWS_DEFAULT_COVER;
}

function toItem(r: Joined): NewsItem {
  const { cover_path, author_id: _a, profiles, ...rest } = r;
  void _a;
  return { ...rest, cover: coverUrl(cover_path), author: profiles ? (profiles.mc_name ?? profiles.discord_username) : null, authorMc: profiles?.mc_name ?? null };
}

/** News pubblicate, dalla più recente. */
export async function listPublished(limit = 60): Promise<NewsItem[]> {
  "use cache";
  cacheTag(NEWS_TAG);
  cacheLife("hours");
  if (!dbConfigured()) return [];
  try {
    const rows = await db.select<Joined>("news", COLS, { published_at: "not.is.null" }, { order: "published_at.desc", limit: String(limit) });
    return rows.map(toItem);
  } catch {
    // Tabella non ancora creata o database irraggiungibile: nessuna news, nessun errore in pagina
    return [];
  }
}

export async function getPublished(slug: string): Promise<NewsItem | null> {
  "use cache";
  cacheTag(NEWS_TAG);
  cacheLife("hours");
  if (!dbConfigured() || !/^[a-z0-9-]{1,90}$/.test(slug)) return null;
  try {
    const r = await db.one<Joined>("news", COLS, { slug: `eq.${slug}`, published_at: "not.is.null" });
    return r ? toItem(r) : null;
  } catch {
    return null;
  }
}

/** Tutte, bozze comprese: solo per l'editor. Mai in cache. */
export async function listAllForEditor(): Promise<(NewsItem & { cover_path: string | null })[]> {
  const rows = await db.select<Joined>("news", COLS, {}, { order: "created_at.desc", limit: "200" });
  return rows.map((r) => ({ ...toItem(r), cover_path: r.cover_path }));
}

export async function uniqueSlug(title: string, exceptId?: string): Promise<string> {
  const base = slugify(title);
  for (let i = 0; i < 5; i++) {
    const slug = i === 0 ? base : `${base}-${randomBytes(2).toString("hex")}`;
    const hit = await db.one<{ id: string }>("news", "id", { slug: `eq.${slug}` });
    if (!hit || hit.id === exceptId) return slug;
  }
  return `${base}-${randomUUID().slice(0, 8)}`;
}

/** Controlla e carica una copertina; restituisce il percorso nel bucket. */
export async function uploadCover(file: File, folder?: string): Promise<string> {
  if (file.size > COVER_MAX) throw new HttpError(413, "La copertina supera 4 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffMime(bytes);
  if (!mime || !mime.startsWith("image/")) throw new HttpError(415, "La copertina deve essere un'immagine PNG, JPG, GIF o WebP.");
  const path = `${folder ? `${folder}/` : ""}${new Date().getFullYear()}/${randomUUID()}.${MIME_EXT[mime] ?? "img"}`;
  const { url, headers } = storageEndpoint(`object/${BUCKET}/${path}`);
  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": mime, "x-upsert": "false", "Cache-Control": "public, max-age=31536000, immutable" },
    body: Buffer.from(bytes),
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[news] upload copertina", res.status, await res.text().catch(() => ""));
    throw new HttpError(502, "Caricamento della copertina non riuscito.");
  }
  return path;
}

export async function removeCover(path: string | null): Promise<void> {
  if (!path) return;
  const { url, headers } = storageEndpoint(`object/${BUCKET}`);
  await fetch(url, { method: "DELETE", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: [path] }), cache: "no-store" }).catch(() => {});
}
