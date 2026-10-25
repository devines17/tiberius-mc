import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Rows, Soon, DiscordBand } from "@/components/ui/Blocks";

export const metadata: Metadata = { title: "Diplomazia", description: "Alleanze, trattati e rivalità tra le nazioni di TiberiusMC." };

export default function Page() {
  return (
    <>
      <PageHead tone="accent" kicker="diplomazia" title="Diplomazia" lead="Alleanze, trattati e rapporti tra le nazioni del server." art="/images/art/empire.png" />
      <Rows
        title="il gioco delle alleanze"
        items={[
          { t: "alleanze", d: "Le nazioni si legano per difendersi o per attaccare." },
          { t: "trattati", d: "Patti scritti, con condizioni e scadenze." },
          { t: "tradimenti", d: "Un trattato si può rompere. Le conseguenze restano." },
        ]}
      />
      <Soon title="mappa delle relazioni" text="Qui vedrai chi è alleato di chi, quando il server sarà collegato." />
      <DiscordBand />
    </>
  );
}
