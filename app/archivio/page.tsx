import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Soon, DiscordBand } from "@/components/ui/Blocks";

export const metadata: Metadata = { title: "Archivio imperiale", description: "La storia del server: città, nazioni e guerre." };

export default function Page() {
  return (
    <>
      <PageHead tone="field" kicker="archivio imperiale" title="Archivio" lead="Città fondate, guerre concluse e trattati firmati sul server." art="/images/art/town.png" />
      <Soon title="archivio vuoto" text="L'archivio si riempirà con gli eventi reali del server. Nessun dato di prova." />
      <DiscordBand />
    </>
  );
}
