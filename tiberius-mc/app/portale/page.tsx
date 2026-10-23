import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Soon } from "@/components/ui/Blocks";

export const metadata: Metadata = { title: "Portale giocatore", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <PageHead tone="field" kicker="area privata" title={"il tuo\nportale."} lead="Gestionali privati, collegati al tuo account Minecraft." art="/images/art/town.png" />
      <Soon title="accesso in arrivo" text="Potrai collegare l'account Minecraft da gioco o da Discord. Finché non è pronto, nessun accesso è attivo." />
    </>
  );
}
