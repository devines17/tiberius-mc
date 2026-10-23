import { ExternalLink } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { CopyIp } from "@/components/CopyIp";
import { Dentil, SectionHeading } from "@/components/ui";

export function JoinGuide() {
  const { ip, version } = siteConfig.server;
  const { discord, store } = siteConfig.links;

  const steps = [
    {
      title: "Apri Minecraft Java Edition",
      text: version
        ? `Avvia il gioco con la versione ${version}.`
        : "Avvia Minecraft Java Edition. La versione supportata sarà indicata qui a breve.",
    },
    {
      title: "Aggiungi il server",
      text: "Vai su Multigiocatore, poi su Aggiungi server.",
    },
    {
      title: "Inserisci l'indirizzo",
      text: ip
        ? "Scrivi “Tiberius MC” come nome, incolla l'indirizzo qui sotto ed entra nell'impero."
        : "Scrivi “Tiberius MC” come nome e inserisci l'indirizzo del server non appena sarà pubblicato.",
    },
  ];

  return (
    <section id="entra" className="relative overflow-hidden">
      <Dentil />
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          eyebrow="Come entrare"
          title="Unisciti all'impero"
          description="Bastano pochi passaggi per diventare cittadino di Tiberius MC."
        />

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="panel flex gap-4 p-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold/10 font-display text-lg font-bold text-gold-bright">
                {i + 1}
              </span>
              <div>
                <h3 className="font-display text-base font-bold uppercase tracking-wide text-ivory">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-10 max-w-lg">
          <CopyIp ip={ip} />
        </div>

        {(discord || store) && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {discord && (
              <a
                href={discord}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-gold/60 bg-gradient-to-b from-gold-bright to-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.16em] text-obsidian transition hover:brightness-110"
              >
                Entra nel Discord
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            )}
            {store && (
              <a
                href={store}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-gold/40 px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.16em] text-ivory transition-colors hover:border-gold/70 hover:bg-gold/10"
              >
                Store e Goldoni
                <ExternalLink className="size-4 text-gold" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
