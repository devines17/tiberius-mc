import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Soon, DiscordBand } from "@/components/ui/Blocks";

export const metadata: Metadata = { title: "Staff", description: "Lo staff di Tiberius MC." };

export default function Page() {
  return (
    <>
      <PageHead kicker="staff" title="Chi governa il foro." lead="Le persone che tengono in piedi l'impero." art="/images/mercenari.png" />
      <Soon title="elenco staff" text="L'elenco ufficiale dello staff sarà pubblicato qui, con i ruoli reali." />
      <DiscordBand />
    </>
  );
}
