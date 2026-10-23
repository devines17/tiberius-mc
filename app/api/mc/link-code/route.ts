import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/server/db";
import { sha256 } from "@/lib/server/auth";
import { handle, HttpError, json, rateLimit } from "@/lib/server/http";
import { NICK_RE } from "@/lib/forum/rules";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const UUID_RE = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

/**
 * Chiamato SOLO dal plugin del server Minecraft quando un giocatore scrive /collega.
 * La richiesta è firmata con HMAC-SHA256 (segreto condiviso MC_LINK_SECRET) e
 * vale 2 minuti: nessuno dall'esterno può generare codici per un UUID altrui.
 * Restituisce un codice monouso valido 10 minuti da inserire sul sito.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const secret = process.env.MC_LINK_SECRET;
    if (!secret || secret.length < 32) throw new HttpError(503, "Collegamento non configurato.");

    const ts = req.headers.get("x-tiberius-timestamp") ?? "";
    const sig = req.headers.get("x-tiberius-signature") ?? "";
    const body = await req.text();
    if (body.length > 1024 || !/^\d{10}$/.test(ts) || !/^[0-9a-f]{64}$/.test(sig)) throw new HttpError(400, "Richiesta non valida.");
    if (Math.abs(Date.now() / 1000 - Number(ts)) > 120) throw new HttpError(401, "Richiesta scaduta.");

    const expected = createHmac("sha256", secret).update(`${ts}.${body}`).digest();
    const given = Buffer.from(sig, "hex");
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw new HttpError(401, "Firma non valida.");

    let data: { uuid?: string; name?: string };
    try {
      data = JSON.parse(body);
    } catch {
      throw new HttpError(400, "Richiesta non valida.");
    }
    if (!data.uuid || !UUID_RE.test(data.uuid) || !data.name || !NICK_RE.test(data.name)) throw new HttpError(400, "Dati del giocatore non validi.");
    const hex = data.uuid.replace(/-/g, "").toLowerCase();
    const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;

    await rateLimit(`mc-code:${uuid}`, 600, 5);

    const code = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
    await db.insert(
      "mc_link_codes",
      { code_hash: sha256(code), mc_uuid: uuid, mc_name: data.name, expires_at: new Date(Date.now() + 10 * 60_000).toISOString() },
      { returning: false },
    );
    return json({ code, expires_in: 600 });
  });
}
