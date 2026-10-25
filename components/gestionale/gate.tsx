import Link from "next/link";
import { forumContext } from "@/components/forum/session";
import { LoginRequired, NotConfigured } from "@/components/forum/states";
import { loadPlayer, type PlayerView } from "@/lib/server/player";
import { Notice } from "@/components/forum/bits";

/** Accesso al gestionale: serve il login; poi i dati del giocatore collegato. */
export async function portalGate(next: string): Promise<{ ok: true; player: PlayerView } | { ok: false; node: React.ReactNode }> {
  const { configured, session } = await forumContext();
  if (!configured) return { ok: false, node: <NotConfigured /> };
  if (!session) return { ok: false, node: <LoginRequired next={next} text="Il gestionale usa lo stesso accesso del forum: entra con il tuo account Discord." /> };
  return { ok: true, player: await loadPlayer(session) };
}

/** Avviso quando mancano i dati: account non collegato o server non ancora collegato al sito. */
export function DataNotice({ player }: { player: PlayerView }) {
  if (!player.linked) {
    return (
      <Notice tone="warn">
        Per vedere i tuoi dati di gioco collega il tuo account Minecraft dalla pagina{" "}
        <Link href="/forum/account?next=/portale" className="link">
          Account
        </Link>
        .
      </Notice>
    );
  }
  if (!player.data) {
    return <Notice>Il server non è ancora collegato al sito: appena lo sarà, qui vedrai i tuoi dati di gioco, aggiornati da soli ogni pochi minuti.</Notice>;
  }
  return null;
}
