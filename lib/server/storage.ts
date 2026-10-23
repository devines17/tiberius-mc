/**
 * Allegati nel bucket privato "forum-allegati" di Supabase Storage.
 * Il bucket non è pubblico: i file si scaricano solo passando dal sito,
 * che controlla i permessi e genera un link firmato valido 60 secondi.
 */

import { randomUUID } from "node:crypto";
import { storageEndpoint } from "./db";
import { HttpError } from "./http";
import { ATTACHMENT_MAX_BYTES, ATTACHMENT_MAX_FILES, ATTACHMENT_MAX_TOTAL, safeFilename, sniffMime } from "@/lib/forum/rules";

const BUCKET = "forum-allegati";

export type PreparedFile = { bytes: Uint8Array; mime: string; filename: string; size: number };

/** Legge e controlla i file di un form: numero, dimensione, tipo reale. */
export async function prepareFiles(files: File[]): Promise<PreparedFile[]> {
  const real = files.filter((f) => f && f.size > 0);
  if (real.length > ATTACHMENT_MAX_FILES) throw new HttpError(400, `Al massimo ${ATTACHMENT_MAX_FILES} allegati per volta.`);
  const total = real.reduce((n, f) => n + f.size, 0);
  if (total > ATTACHMENT_MAX_TOTAL) throw new HttpError(413, "Gli allegati superano 4 MB in totale. Per i video usa un link.");
  const out: PreparedFile[] = [];
  for (const f of real) {
    if (f.size > ATTACHMENT_MAX_BYTES) throw new HttpError(413, `"${f.name}" supera 4 MB.`);
    const bytes = new Uint8Array(await f.arrayBuffer());
    const mime = sniffMime(bytes);
    if (!mime) throw new HttpError(415, `"${f.name}": sono ammessi solo immagini (PNG, JPG, GIF, WebP), PDF e file di testo.`);
    out.push({ bytes, mime, filename: safeFilename(f.name, mime), size: bytes.byteLength });
  }
  return out;
}

export async function uploadFile(ticketId: string, file: PreparedFile): Promise<string> {
  const path = `${ticketId}/${randomUUID()}-${file.filename}`;
  const { url, headers } = storageEndpoint(`object/${BUCKET}/${path}`);
  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": file.mime, "x-upsert": "false", "Cache-Control": "private, max-age=0" },
    body: Buffer.from(file.bytes),
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[storage] upload", res.status, await res.text().catch(() => ""));
    throw new HttpError(502, "Caricamento dell'allegato non riuscito.");
  }
  return path;
}

export async function signedUrl(path: string): Promise<string> {
  const { url, headers } = storageEndpoint(`object/sign/${BUCKET}/${path}`);
  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: 60 }),
    cache: "no-store",
  });
  if (!res.ok) throw new HttpError(404, "Allegato non disponibile.");
  const data = (await res.json()) as { signedURL?: string };
  if (!data.signedURL) throw new HttpError(404, "Allegato non disponibile.");
  return storageEndpoint(data.signedURL.replace(/^\/+/, "")).url;
}

export async function removeFiles(paths: string[]): Promise<void> {
  if (!paths.length) return;
  const { url, headers } = storageEndpoint(`object/${BUCKET}`);
  await fetch(url, {
    method: "DELETE",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: paths }),
    cache: "no-store",
  });
}
