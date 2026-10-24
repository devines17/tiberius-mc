import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Rows, Soon, DiscordBand } from "@/components/ui/Blocks";

export const metadata: Metadata = { title: "Guerre e PvP", description: "Guerre, assedi e PvP su TiberiusMC." };

export default function Page() {
  return (
    <>
      <PageHead tone="field" kicker="guerre e pvp" title={"assedia.\nconquista."} lead="Le guerre si dichiarano, si combattono e si ricordano." art="/images/art/siege.png" />
      <Rows
        title="la guerra"
        items={[
          { t: "dichiarazione", d: "Una guerra ha un motivo, due schieramenti e un inizio ufficiale." },
          { t: "assedio", d: "Si combatte sul campo, con le regole del server." },
          { t: "storia", d: "Ogni conflitto finisce nell'archivio imperiale." },
        ]}
      />
      <Soon title="guerre in corso" text="Le guerre attive saranno elencate qui, dal server reale. Per ora la sezione è vuota." />
      <DiscordBand topic="guerre" />
    </>
  );
}
