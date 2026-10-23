import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Soon, DiscordBand } from "@/components/ui/Blocks";

export const metadata: Metadata = { title: "Forum", description: "Il forum della community di Tiberius MC." };

export default function Page() {
  return (
    <>
      <PageHead tone="accent" kicker="forum" title={"il foro\narriva."} lead="Discussioni, proposte e ambasciate, tutto in un posto." art="/images/art/village.png" />
      <Soon title="forum in costruzione" text="Lo stiamo preparando. Fino ad allora, la community vive sul Discord." />
      <DiscordBand />
    </>
  );
}
