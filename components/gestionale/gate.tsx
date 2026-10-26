import { forumContext } from "@/components/forum/session";
import { LoginRequired, NotConfigured } from "@/components/forum/states";
import { loadPlayer, type PlayerView } from "@/lib/server/player";

/** Accesso al gestionale: serve il login; poi i dati del giocatore collegato. */
export async function portalGate(next: string): Promise<{ ok: true; player: PlayerView } | { ok: false; node: React.ReactNode }> {
  const { configured, session } = await forumContext();
  if (!configured) return { ok: false, node: <NotConfigured /> };
  if (!session) return { ok: false, node: <LoginRequired next={next} text="Il gestionale usa lo stesso accesso del forum: entra con il tuo account Discord." /> };
  return { ok: true, player: await loadPlayer(session) };
}

export { DataNotice } from "./notice";
