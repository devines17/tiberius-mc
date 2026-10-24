import type { Metadata } from "next";
import { DiscordBand } from "@/components/ui/Blocks";
import { ForumHero } from "@/components/forum/ForumHero";
import { RulesBrowser } from "@/components/regole/RulesBrowser";
import { REGOLE, REGOLE_INTRO, REGOLE_VERSIONE } from "@/lib/regole";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Regolamento", description: "Il regolamento ufficiale di TiberiusMC: regole generali, fair play, Towny, economia, PvP, forum, store e sanzioni." };

export default function Page() {
  return (
    <>
      <ForumHero
        art="regole"
        kicker="tiberiusmc · regole"
        title="Regolamento"
        lead="Qui trovi il regolamento di TiberiusMC, il nostro server Towny. Leggilo prima di giocare."
      />
      <div className="wrap pb-10 pt-12 md:pt-16">
        <RulesBrowser chapters={REGOLE} intro={REGOLE_INTRO} version={REGOLE_VERSIONE} discord={siteConfig.links.discord} />
      </div>
      <DiscordBand />
    </>
  );
}
