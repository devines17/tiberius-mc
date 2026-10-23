import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Soon, DiscordBand } from "@/components/ui/Blocks";

export const metadata: Metadata = { title: "Regole", description: "Il regolamento di Tiberius MC." };

export default function Page() {
  return (
    <>
      <PageHead kicker="regole" title={"la legge\nè legge."} lead="Poche regole, uguali per tutti." art="/images/art/empire.png" />
      <Soon title="regolamento" text="Il testo ufficiale del regolamento sarà pubblicato qui. Non lo inventiamo: arriva dallo staff." />
      <DiscordBand />
    </>
  );
}
