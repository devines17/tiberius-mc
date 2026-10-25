import { db } from "./db";
import type { Session } from "./auth";
import type { PlayerData } from "@/lib/gestionale/data";

export type PlayerView = {
  /** Account Minecraft collegato al profilo del sito. */
  linked: boolean;
  name: string;
  mc: string | null;
  /** Null finché il plugin del server non ha mandato dati. */
  data: PlayerData | null;
  updatedAt: string | null;
};

/** Dati di gioco del giocatore collegato (solo i suoi). */
export async function loadPlayer(session: Session): Promise<PlayerView> {
  const p = session.profile;
  const base = { linked: Boolean(p.mc_uuid), name: p.mc_name ?? p.discord_username, mc: p.mc_name, data: null, updatedAt: null };
  if (!p.mc_uuid) return base;
  try {
    const row = await db.one<{ data: PlayerData; updated_at: string }>("player_snapshots", "data,updated_at", { mc_uuid: `eq.${p.mc_uuid}` });
    return row ? { ...base, data: row.data ?? {}, updatedAt: row.updated_at } : base;
  } catch {
    // Migrazione 006 non ancora eseguita: nessun dato
    return base;
  }
}
