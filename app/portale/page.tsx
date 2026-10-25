import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Rows, Soon } from "@/components/ui/Blocks";

export const metadata: Metadata = { title: "Gestionale", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <PageHead tone="field" kicker="area privata" title="Gestionale" lead="L'area privata per gestire la tua città, collegata al tuo account Minecraft. La vedi solo tu e chi ne fa parte." art="/images/art/town.png" />
      <Rows
        title="come si collega"
        items={[
          { t: "da gioco", d: "Genererai un codice in gioco e lo userai sul sito per collegare l'account." },
          { t: "da discord", d: "In alternativa, il collegamento passerà dal nostro Discord." },
          { t: "accesso", d: "Una volta collegato, vedrai solo i gestionali a cui hai diritto." },
        ]}
      />
      <Soon title="accesso in arrivo" text="Il collegamento non è ancora attivo. Nessun accesso è possibile per ora." />
    </>
  );
}
