import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Soon, DiscordBand } from "@/components/ui/Blocks";
import { Btn } from "@/components/ui/Btn";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Mappa", description: "La mappa del mondo di TiberiusMC." };

export default function Page() {
  return (
    <>
      <PageHead kicker="mappa" title={"il mondo,\ndall'alto."} lead="Confini, città e strade viste come le vedrebbe un imperatore." art="/images/art/empire.png" />
      {siteConfig.links.map ? (
        <section className="wrap pb-20" data-reveal data-delay="0.3">
          <div className="mb-6"><Btn href={siteConfig.links.map} external variant="accent">apri a schermo intero</Btn></div>
          <iframe src={siteConfig.links.map} title="Mappa di TiberiusMC" loading="lazy" className="h-[70svh] w-full border-0 bg-surface" />
        </section>
      ) : (
        <Soon title="mappa in arrivo" text="La mappa interattiva sarà pubblicata qui appena pronta." />
      )}
      <DiscordBand topic="mappa" />
    </>
  );
}
