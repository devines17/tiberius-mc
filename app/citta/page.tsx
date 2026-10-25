import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Rows, Soon, DiscordBand } from "@/components/ui/Blocks";

export const metadata: Metadata = { title: "Città e nazioni", description: "Come funzionano città e nazioni su TiberiusMC." };

export default function Page() {
  return (
    <>
      <PageHead kicker="città e nazioni" title="Città e nazioni" lead="L'elenco delle città e delle nazioni del server." art="/images/art/town.png" />
      <Rows
        title="dalla casa all'impero"
        items={[
          { t: "la città", d: "Reclami un territorio e lo difendi. I cittadini costruiscono insieme." },
          { t: "la nazione", d: "Più città sotto un'unica bandiera, con un governo comune." },
          { t: "il gestionale", d: "Ogni città avrà un gestionale privato, visibile solo ai suoi membri." },
        ]}
      />
      <Soon title="elenco città" text="L'elenco pubblico delle città comparirà qui quando il server sarà collegato. Finanze e territori privati non saranno mai mostrati." />
      <DiscordBand />
    </>
  );
}
