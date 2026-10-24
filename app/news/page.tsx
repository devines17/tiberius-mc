import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Soon, DiscordBand } from "@/components/ui/Blocks";

export const metadata: Metadata = { title: "News ed eventi", description: "Annunci ed eventi di TiberiusMC." };

export default function Page() {
  return (
    <>
      <PageHead kicker="news ed eventi" title={"ultime\ndal foro."} lead="Annunci, aggiornamenti ed eventi ufficiali." art="/images/art/goldone.png" />
      <Soon title="nessuna news" text="Le novità appariranno qui. Gli annunci in tempo reale restano sul Discord." />
      <DiscordBand />
    </>
  );
}
