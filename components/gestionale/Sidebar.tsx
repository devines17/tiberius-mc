import { forumContext } from "@/components/forum/session";
import { Head } from "@/components/forum/zero";
import { ServerStatus } from "@/components/ui/ServerStatus";
import { loadPlayer } from "@/lib/server/player";
import { siteConfig } from "@/lib/site-config";
import { Menu } from "./Menu";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-5 flex items-center gap-2">
      <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[0.78rem] font-semibold text-white/75">{children}</span>
      <span className="h-px flex-1 bg-white/10" aria-hidden />
    </div>
  );
}

/** Colonna a sinistra: il giocatore, le sezioni e il server. */
export async function Sidebar() {
  const { session } = await forumContext().catch(() => ({ session: null }));
  const player = session ? await loadPlayer(session) : null;
  const d = player?.data;
  const role = d?.town ? (d.town.role ?? "Cittadino") + ` · ${d.town.name}` : player?.data ? "Senza città" : player?.linked ? "Giocatore" : "Account non collegato";
  return (
    <div>
      {player ? (
        <div className="gest-box flex items-center gap-3 border-accent/50 p-3">
          <span className="relative">
            <Head name={player.mc} size={44} />
            {d?.online !== undefined && <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-[#1b1c1f] ${d.online ? "bg-emerald-400" : "bg-white/35"}`} aria-label={d.online ? "in gioco" : "non in gioco"} />}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-bold">{player.mc ?? player.name}</span>
            <span className="block truncate text-xs text-[#ff8a80]">{role}</span>
          </span>
        </div>
      ) : (
        <div className="gest-box p-3 text-sm text-white/60">Accedi per vedere i tuoi dati.</div>
      )}
      <Label>Sezioni</Label>
      <Menu />
      <Label>Server</Label>
      <div className="gest-box grid gap-2 p-3">
        <ServerStatus host={siteConfig.server.ip} className="!justify-start !border-0 !bg-transparent !p-0 !text-[0.82rem] !backdrop-blur-none" />
        <p className="font-mono text-[0.8rem] text-white/55">{siteConfig.server.ip}</p>
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return <div className="gest-box h-[4.4rem] animate-pulse" />;
}
