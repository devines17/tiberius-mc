import type { Metadata } from "next";
import { DiscordBand } from "@/components/ui/Blocks";
import { ForumHero } from "@/components/forum/ForumHero";
import { RulesBrowser } from "@/components/regole/RulesBrowser";
import { REGOLE, REGOLE_INTRO, REGOLE_VERSIONE } from "@/lib/regole";

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
      <div className="wrap grid gap-10 pb-10 pt-12 md:pt-16">
        <section className="panel grid gap-3 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{REGOLE_VERSIONE}</p>
          {REGOLE_INTRO.map((t) => (
            <p key={t} className="leading-relaxed text-white/80">
              {t}
            </p>
          ))}
        </section>
        <RulesBrowser chapters={REGOLE} />
      </div>
      <DiscordBand />
    </>
  );
}
