import { db } from "@/lib/server/db";
import { sha256 } from "@/lib/server/auth";
import { assertSameOrigin, audit, handle, HttpError, json, rateLimit, readJson, requireSession } from "@/lib/server/http";

/** Il giocatore inserisce sul sito il codice ottenuto in gioco con /collega. */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    const { profile } = await requireSession();
    await rateLimit(`mc-link:${profile.id}`, 600, 8);

    const body = await readJson(req, 1024);
    const code = String(body.code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code.length !== 6) throw new HttpError(400, "Il codice è di 6 caratteri.");

    const row = await db.one<{ code_hash: string; mc_uuid: string; mc_name: string; expires_at: string; used_at: string | null }>(
      "mc_link_codes",
      "code_hash,mc_uuid,mc_name,expires_at,used_at",
      { code_hash: `eq.${sha256(code)}` },
    );
    if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) {
      throw new HttpError(400, "Codice non valido o scaduto. Scrivi di nuovo /collega in gioco.");
    }

    const owner = await db.one<{ id: string }>("profiles", "id", { mc_uuid: `eq.${row.mc_uuid}` });
    if (owner && owner.id !== profile.id) {
      throw new HttpError(409, "Questo account Minecraft è già collegato a un altro profilo. Apri una pratica di assistenza.");
    }

    // Prima si "consuma" il codice (solo se ancora libero), poi si collega: un codice vale una volta sola.
    const used = await db.update<{ code_hash: string }>("mc_link_codes", { code_hash: `eq.${row.code_hash}`, used_at: "is.null" }, { used_at: new Date().toISOString(), used_by: profile.id });
    if (!used.length) throw new HttpError(400, "Codice già usato.");

    await db.update("profiles", { id: `eq.${profile.id}` }, {
      mc_uuid: row.mc_uuid,
      mc_name: row.mc_name,
      mc_verified_at: new Date().toISOString(),
      mc_verified_by: "plugin",
    });
    await audit(profile.id, "mc_collegato", { targetId: profile.id, details: { mc_uuid: row.mc_uuid, mc_name: row.mc_name, via: "plugin" } });
    return json({ ok: true, mc_name: row.mc_name });
  });
}
