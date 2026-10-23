/** Utilità comuni delle API del forum. */

import { NextResponse } from "next/server";
import { db, DbError, dbConfigured } from "./db";
import { getSession, type Session } from "./auth";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, string>,
  ) {
    super(message);
  }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Protezione CSRF: le richieste che modificano dati devono arrivare da una
 * pagina del sito stesso. Il cookie SameSite=Lax copre già i form esterni;
 * questo controllo copre anche fetch e casi limite.
 */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) throw new HttpError(403, "Richiesta non consentita.");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new HttpError(403, "Richiesta non consentita.");
  }
  if (originHost !== host) throw new HttpError(403, "Richiesta non consentita.");
}

export async function requireSession(): Promise<Session> {
  if (!dbConfigured()) throw new HttpError(503, "Il forum non è ancora configurato.");
  const s = await getSession();
  if (!s) throw new HttpError(401, "Devi accedere con Discord.");
  return s;
}

/** Limite anti-spam: lancia 429 se il bucket supera max richieste nella finestra. */
export async function rateLimit(bucket: string, windowSeconds: number, max: number) {
  const exceeded = await db.rpc<boolean>("forum_rate_hit", { p_bucket: bucket, p_window_seconds: windowSeconds, p_max: max });
  if (exceeded) throw new HttpError(429, "Troppe richieste in poco tempo. Riprova tra qualche minuto.");
}

export async function audit(actorId: string | null, action: string, opts: { ticketId?: string; targetId?: string; details?: Record<string, unknown> } = {}) {
  await db.insert(
    "audit_log",
    { actor_id: actorId, action, ticket_id: opts.ticketId ?? null, target_id: opts.targetId ?? null, details: opts.details ?? {} },
    { returning: false },
  );
}

/** Esegue un handler trasformando gli errori in risposte che non rivelano dettagli interni. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message, details: e.details }, e.status);
    if (e instanceof DbError && e.code === "not_configured") return json({ error: "Il forum non è ancora configurato." }, 503);
    console.error("[forum]", e);
    return json({ error: "Si è verificato un errore. Riprova." }, 500);
  }
}

export async function readJson(req: Request, maxBytes = 64 * 1024): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, "Richiesta troppo grande.");
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" ? v : {};
  } catch {
    throw new HttpError(400, "Richiesta non valida.");
  }
}
