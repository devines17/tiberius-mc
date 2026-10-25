import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Soon, DiscordBand } from "@/components/ui/Blocks";

export const metadata: Metadata = { title: "Wiki", description: "La wiki di TiberiusMC: comandi, regole di gioco e guide." };

export default function Page() {
  return (
    <>
      <PageHead kicker="wiki" title="Wiki" lead="Comandi, guide e meccaniche del server." art="/images/art/town.png" />
      <Soon title="wiki in costruzione" text="Le guide ufficiali compariranno qui." />
      <DiscordBand />
    </>
  );
}
