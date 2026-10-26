import type { Metadata } from "next";
import { DiscordBand } from "@/components/ui/Blocks";
import { ForumHero } from "@/components/forum/ForumHero";
import { WikiBrowser } from "@/components/wiki/WikiBrowser";
import { WIKI } from "@/lib/wiki";

export const metadata: Metadata = { title: "Wiki", description: "La wiki di TiberiusMC: primi passi, città, lotti, nazioni, guerre e tutti i comandi di Towny." };

export default function Page() {
  return (
    <>
      <ForumHero art="wiki" title="Wiki" lead="Guide, comandi e risposte: tutto quello che serve per giocare su TiberiusMC." />
      <div className="wrap pb-10 pt-10">
        <WikiBrowser pages={WIKI} />
      </div>
      <DiscordBand />
    </>
  );
}
