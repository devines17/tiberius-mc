import { db, pgList } from "@/lib/server/db";
import { assertSameOrigin, audit, handle, HttpError, json, readJson, requireSession } from "@/lib/server/http";
import { applyRetention, requireAdmin } from "@/lib/server/tickets";
import { PERMISSIONS, type PermissionKey } from "@/lib/forum/config";
import { cleanText, NICK_RE } from "@/lib/forum/rules";
import type { Profile } from "@/lib/server/types";

const PERM_KEYS = new Set(PERMISSIONS.map((p) => p.key));

/** Trova un profilo per Discord ID, nickname Minecraft o nome Discord. */
async function findProfile(q: string): Promise<Profile> {
  const v = cleanText(q, 64);
  if (!v) throw new HttpError(422, "Indica chi.");
  const byDiscord = /^\d{5,25}$/.test(v) ? await db.one<Profile>("profiles", "*", { discord_id: `eq.${v}` }) : null;
  const byMc = !byDiscord && NICK_RE.test(v) ? await db.one<Profile>("profiles", "*", { mc_name: `ilike.${v}` }) : null;
  const byName = !byDiscord && !byMc ? await db.one<Profile>("profiles", "*", { discord_username: `ilike.${v.replace(/[%*,()]/g, "")}` }) : null;
  const p = byDiscord ?? byMc ?? byName;
  if (!p) throw new HttpError(404, "Nessun profilo trovato. La persona deve prima accedere al sito con Discord.");
  return p;
}

/**
 * Amministrazione generale (solo permesso "admin"):
 * permessi dello staff, impostazioni, collegamenti Minecraft manuali,
 * conservazione dei dati. Ogni operazione finisce nel registro.
 */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    const session = await requireSession();
    requireAdmin(session);
    const body = await readJson(req);
    const action = String(body.azione ?? "");

    switch (action) {
      case "permesso": {
        const target = await findProfile(String(body.chi ?? ""));
        const perm = String(body.permesso ?? "") as PermissionKey;
        if (!PERM_KEYS.has(perm)) throw new HttpError(422, "Permesso non valido.");
        if (body.attivo) {
          await db.insert("staff_permissions", { profile_id: target.id, permission: perm, granted_by: session.profile.id }, { upsert: "profile_id,permission", returning: false });
        } else {
          if (perm === "admin" && target.id === session.profile.id) throw new HttpError(422, "Non puoi togliere l'amministrazione a te stesso.");
          await db.remove("staff_permissions", { profile_id: `eq.${target.id}`, permission: `eq.${perm}` });
        }
        await audit(session.profile.id, body.attivo ? "permesso_concesso" : "permesso_revocato", { targetId: target.id, details: { permesso: perm } });
        return json({ ok: true });
      }

      case "impostazioni_candidature": {
        const ruoli = Array.isArray(body.ruoli) ? body.ruoli.map((r) => cleanText(r, 40)).filter(Boolean).slice(0, 12) : [];
        const domande = Array.isArray(body.domande) ? body.domande.map((d) => cleanText(d, 300)).filter(Boolean).slice(0, 10) : [];
        const eta = body.eta_minima === null || body.eta_minima === "" ? null : Number(body.eta_minima);
        if (eta !== null && (!Number.isInteger(eta) || eta < 0 || eta > 99)) throw new HttpError(422, "Età minima non valida.");
        const value = { aperte: Boolean(body.aperte), ruoli, eta_minima: eta, domande };
        await db.insert("forum_settings", { key: "candidature", value, updated_by: session.profile.id, updated_at: new Date().toISOString() }, { upsert: "key", returning: false });
        await audit(session.profile.id, "impostazioni_candidature", { details: value });
        return json({ ok: true });
      }

      case "impostazioni_archivio": {
        const days = body.conservazione_giorni === null || body.conservazione_giorni === "" ? null : Number(body.conservazione_giorni);
        if (days !== null && (!Number.isInteger(days) || days < 30 || days > 3650)) throw new HttpError(422, "Conservazione: tra 30 e 3650 giorni, oppure vuoto per conservare tutto.");
        await db.insert("forum_settings", { key: "archivio", value: { conservazione_giorni: days }, updated_by: session.profile.id, updated_at: new Date().toISOString() }, { upsert: "key", returning: false });
        await audit(session.profile.id, "impostazioni_archivio", { details: { conservazione_giorni: days } });
        return json({ ok: true });
      }

      case "applica_conservazione": {
        const removed = await applyRetention(session);
        return json({ ok: true, eliminate: removed });
      }

      case "collega_mc": {
        // Collegamento manuale: lo staff verifica l'identità (es. in gioco o su Discord) e la registra.
        const target = await findProfile(String(body.chi ?? ""));
        const nick = cleanText(body.nickname, 16);
        if (!NICK_RE.test(nick)) throw new HttpError(422, "Nickname non valido.");
        const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(nick)}`, { cache: "no-store" });
        if (res.status === 404 || res.status === 204) throw new HttpError(404, "Nessun account Minecraft con questo nickname.");
        if (!res.ok) throw new HttpError(502, "Servizio Mojang non raggiungibile, riprova.");
        const mj = (await res.json()) as { id: string; name: string };
        const uuid = mj.id.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
        const owner = await db.one<{ id: string }>("profiles", "id", { mc_uuid: `eq.${uuid}` });
        if (owner && owner.id !== target.id) throw new HttpError(409, "Questo account Minecraft è già collegato a un altro profilo.");
        await db.update("profiles", { id: `eq.${target.id}` }, { mc_uuid: uuid, mc_name: mj.name, mc_verified_at: new Date().toISOString(), mc_verified_by: "staff" });
        await audit(session.profile.id, "mc_collegato", { targetId: target.id, details: { mc_uuid: uuid, mc_name: mj.name, via: "staff" } });
        return json({ ok: true, mc_name: mj.name });
      }

      case "scollega_mc": {
        const target = await findProfile(String(body.chi ?? ""));
        await db.update("profiles", { id: `eq.${target.id}` }, { mc_uuid: null, mc_name: null, mc_verified_at: null, mc_verified_by: null });
        await audit(session.profile.id, "mc_scollegato", { targetId: target.id, details: { mc_name: target.mc_name } });
        return json({ ok: true });
      }

      case "staff_elenco": {
        const rows = await db.select<{ profile_id: string; permission: string; profiles: Pick<Profile, "discord_username" | "mc_name" | "discord_id"> }>(
          "staff_permissions",
          "profile_id,permission,profiles(discord_username,mc_name,discord_id)",
          { order: "profile_id.asc" },
        );
        return json({ staff: rows });
      }

      case "registro": {
        const rows = await db.select<{ id: number; actor_id: string | null; action: string; ticket_id: string | null; target_id: string | null; details: unknown; created_at: string }>(
          "audit_log",
          "*",
          { order: "created_at.desc", limit: "100" },
        );
        // Il registro mostra chi ha fatto cosa, non i contenuti: le motivazioni e i dettagli
        // delle pratiche restano visibili solo dentro la pratica, a chi ha il permesso della sezione.
        const SAFE = new Set(["permesso", "da", "a", "campo", "via", "mc_name", "giorni", "aperte", "conservazione_giorni", "priorita"]);
        for (const r of rows) {
          const d = (r.details ?? {}) as Record<string, unknown>;
          r.details = Object.fromEntries(Object.entries(d).filter(([k]) => SAFE.has(k)));
        }
        const ids = [...new Set(rows.flatMap((r) => [r.actor_id, r.target_id]).filter(Boolean) as string[])];
        const people = ids.length ? await db.select<Pick<Profile, "id" | "discord_username" | "mc_name">>("profiles", "id,discord_username,mc_name", { id: `in.${pgList(ids)}` }) : [];
        return json({ registro: rows, persone: people });
      }

      default:
        throw new HttpError(400, "Azione sconosciuta.");
    }
  });
}
