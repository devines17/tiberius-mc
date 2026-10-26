import Link from "next/link";
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

/** Avviso quando mancano i dati: account non collegato o server non ancora collegato al sito. */
export function DataNotice({ player }: { player: PlayerView }) {
  if (player.linked && player.data) return null;
  return (
    <div className="gx-in flex flex-wrap items-center justify-between gap-3 rounded-md border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-[#ffe3a3]">
      <p>{player.linked ? "Il server non è ancora collegato al sito: appena lo sarà, qui vedrai i tuoi dati di gioco." : "Collega il tuo account Minecraft per vedere qui i tuoi dati di gioco."}</p>
      {!player.linked && (
        <Link href="/forum/account?next=/portale" className="rounded-md bg-accent px-3 py-1.5 font-semibold text-white transition-colors hover:bg-[#c42b22]">
          Collega account
        </Link>
      )}
    </div>
  );
}
