import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Soon, DiscordBand } from "@/components/ui/Blocks";

export const metadata: Metadata = { title: "Store", description: "Lo store di TiberiusMC: Goldoni e vantaggi." };

export default function Page() {
  return (
    <>
      <PageHead kicker="store" title="Goldoni e vantaggi." lead="Il Goldone è la moneta premium del server. Non è la valuta di gioco." art="/images/art/goldone.png" />
      <Soon title="store in arrivo" text="Il catalogo e il carrello del giocatore saranno qui. Nessun acquisto è possibile per ora." />
      <DiscordBand topic="store" />
    </>
  );
}
