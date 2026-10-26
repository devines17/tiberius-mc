import type { Metadata } from "next";
import { DiscordBand } from "@/components/ui/Blocks";
import { WikiBrowser } from "@/components/wiki/WikiBrowser";
import { WIKI } from "@/lib/wiki";

export const metadata: Metadata = { title: "Wiki", description: "La wiki di TiberiusMC: primi passi, città, lotti, nazioni, guerre e tutti i comandi di Towny." };

export default function Page() {
  return (
    <>
      <div className="mx-auto w-full max-w-[90rem] pb-10 pt-8 sm:px-[var(--gutter)] md:pt-12">
        <div className="overflow-hidden bg-[#17181a] sm:rounded-md">
          <header>
            <h1 className="bg-[#8f1d14] pb-3 pt-7 text-center text-3xl font-bold uppercase text-white md:text-4xl">Wiki</h1>
            <div className="bg-[#d0362b] pt-2">
              <div aria-hidden className="onde translate-y-px" />
            </div>
          </header>
          <div className="px-4 pb-10 pt-6 md:px-8">
            <WikiBrowser pages={WIKI} />
          </div>
        </div>
      </div>
      <DiscordBand />
    </>
  );
}
