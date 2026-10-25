import { Coins } from "lucide-react";
import { forumContext } from "@/components/forum/session";
import { SkinBody } from "@/components/forum/zero";
import { loadPlayer } from "@/lib/server/player";
import { ServerStatus } from "@/components/ui/ServerStatus";
import { siteConfig } from "@/lib/site-config";
import { fmtMoney, greeting } from "@/lib/gestionale/data";

/** Testata del gestionale: il giocatore in piedi, il saluto e il suo stendardo. */
export async function Hero() {
  const { session } = await forumContext().catch(() => ({ session: null }));
  const player = session ? await loadPlayer(session) : null;
  const d = player?.data;
  const name = player ? (player.mc ?? player.name) : null;
  const facts = [d?.town?.name && `Città di ${d.town.name}`, d?.nation?.name && `Nazione ${d.nation.name}`, d?.town?.role].filter(Boolean) as string[];
  return (
    <HeroFrame skin={player?.mc ?? null}>
      <p className="portal-engraved text-[0.95rem] text-white/75">{greeting()}</p>
      <h1 className="mt-1 font-brand text-[clamp(2.4rem,6vw,4rem)] leading-[0.95] text-white [text-shadow:0_3px_0_rgb(0_0_0/0.35)]">
        {name ? (
          <>
            Ave, <span className="text-gold">{name}</span>
          </>
        ) : (
          "Ave, viandante"
        )}
      </h1>
      <p className="mt-3 text-sm text-white/75">
        {name ? (facts.length ? facts.join(" · ") : "Il tuo registro personale su TiberiusMC") : "Accedi per aprire il tuo registro personale"}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <ServerStatus host={siteConfig.server.ip} className="!py-1.5 !text-[0.8rem]" />
        <span className="rounded-full border border-white/15 bg-black/30 px-3.5 py-1.5 font-mono text-[0.8rem] text-white/85">{siteConfig.server.ip}</span>
      </div>
      {d?.money !== undefined && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-md bg-black/25 px-3 py-1.5 text-sm font-bold">
          <Coins className="size-4 text-gold" aria-hidden />
          {fmtMoney(d.money)} monete
        </p>
      )}
    </HeroFrame>
  );
}

export function HeroFrame({ skin, children }: { skin?: string | null; children?: React.ReactNode }) {
  return (
    <div className="portal-hero">
      <div className="relative mx-auto flex max-w-[72rem] items-end gap-5 px-5 md:gap-8 md:px-8">
        <div className="hidden shrink-0 translate-y-4 sm:block">
          {skin !== undefined && <SkinBody name={skin} className="h-[200px] md:h-[260px]" />}
        </div>
        <div className="min-w-0 py-10 md:py-14">{children}</div>
      </div>
    </div>
  );
}
