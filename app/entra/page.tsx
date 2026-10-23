import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Rows, DiscordBand } from "@/components/ui/Blocks";
import { CopyIp } from "@/components/ui/CopyIp";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Come entrare", description: "Come connetterti a Tiberius MC: indirizzo del server, Discord e primi passi." };

export default function Page() {
  return (
    <>
      <PageHead kicker="guida" title={"come\nentrare."} lead="Tre passaggi e sei dentro. Nessun launcher speciale." art="/images/art/village.png" />
      <section className="wrap pb-10" data-reveal="fade" data-delay="0.5">
        <CopyIp ip={siteConfig.server.ip} tone="light" />
        <p className="mt-4 text-muted">
          {siteConfig.server.version ? `Versione Minecraft Java: ${siteConfig.server.version}.` : "Versione supportata: la comunicheremo qui a breve."}
        </p>
      </section>
      <Rows
        title="i primi passi"
        items={[
          { t: "apri minecraft java", d: "Serve l'edizione Java con un account valido." },
          { t: "aggiungi il server", d: `Multiplayer, aggiungi server, indirizzo ${siteConfig.server.ip}.` },
          { t: "entra nel discord", d: "Lì trovi lo staff, gli annunci e il collegamento account ai gestionali." },
        ]}
      />
      <DiscordBand />
    </>
  );
}
