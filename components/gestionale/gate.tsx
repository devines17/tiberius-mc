import Link from "next/link";
import { Link2, PlugZap } from "lucide-react";
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
  const linked = player.linked;
  const Icon = linked ? PlugZap : Link2;
  return (
    <div className="gx-card gx-notice gx-in flex flex-wrap items-center gap-4 p-4" style={{ ["--i" as string]: 0, ["--t" as string]: linked ? "#60a5fa" : "#ffc94d" }}>
      <span className="gx-card-icon !size-10">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{linked ? "Il server non è ancora collegato" : "Collega il tuo account Minecraft"}</p>
        <p className="text-sm text-white/60">
          {linked ? "Appena lo sarà, qui vedrai i tuoi dati di gioco, aggiornati da soli ogni pochi minuti." : "Così il gestionale può mostrarti soldi, città, nazione e statistiche di gioco."}
        </p>
      </div>
      {!linked && (
        <Link href="/forum/account?next=/portale" className="btn btn-accent !h-10 !px-4 !text-sm">
          Collega ora
        </Link>
      )}
    </div>
  );
}
