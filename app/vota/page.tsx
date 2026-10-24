import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Soon, DiscordBand } from "@/components/ui/Blocks";

export const metadata: Metadata = { title: "Vota", description: "Vota TiberiusMC e sostieni il server." };

export default function Page() {
  return (
    <>
      <PageHead kicker="vota" title="Un voto per l'impero." lead="Votare aiuta il server a crescere." art="/images/art/empire.png" />
      <Soon title="link di voto in arrivo" text="I siti dove votare saranno elencati qui appena il server sarà registrato." />
      <DiscordBand topic="vota" />
    </>
  );
}
