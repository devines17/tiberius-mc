import type { Metadata } from "next";
import { Clock3, ExternalLink, Gift } from "lucide-react";
import { DiscordBand } from "@/components/ui/Blocks";
import { ForumHero } from "@/components/forum/ForumHero";
import { VOTE_SITES } from "@/lib/voto";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Vota", description: "Vota TiberiusMC sulle liste dei server e sostieni il server." };

const STEPS = [
  "Apri una delle liste qui sopra e scrivi il tuo nick Minecraft esattamente come in gioco.",
  "Conferma il voto: il premio arriva in gioco da solo, anche se in quel momento non sei connesso.",
  <>
    Se il premio non arriva, apri una richiesta in{" "}
    <a href="/forum/sezione?s=assistenza_generale" className="font-semibold text-[#ff8a80] hover:underline">
      Assistenza
    </a>{" "}
    o su{" "}
    <a href={siteConfig.links.discord} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#ff8a80] hover:underline">
      Discord
    </a>{" "}
    indicando la data e la lista su cui hai votato.
  </>,
];

export default function Page() {
  return (
    <>
      <ForumHero art="vota" title="Vota il server" lead="Ogni voto ci aiuta a farci conoscere da nuovi giocatori e a te fa guadagnare un premio in gioco." />
      <div className="wrap pb-10 pt-10">
          <div className="mx-auto grid max-w-[60rem] gap-6">
            <p className="mx-auto max-w-2xl text-center text-white/70" data-reveal>
              Puoi votare una volta al giorno su ciascuna lista: votando su tutte prendi tutti i premi.
            </p>

            <ul className="grid gap-4 md:grid-cols-2" data-stagger="0.1">
              {VOTE_SITES.map((s) => (
                <li key={s.nome} className="vote-card fbox flex flex-col p-5" style={{ ["--c" as string]: s.colore }}>
                  <span className="vote-logo" aria-hidden>
                    {s.sigla}
                  </span>
                  <h2 className="mt-4 text-xl font-bold uppercase">{s.nome}</h2>
                  <p className="mt-1.5 text-sm text-white/65">{s.descrizione}</p>
                  <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      <Gift className="size-3.5 text-gold" aria-hidden />
                      {s.premio ?? "Premio in arrivo"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="size-3.5" aria-hidden />
                      ogni {s.ogni} ore
                    </span>
                  </p>
                  <div className="mt-5 pt-1">
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-[#c42b22]">
                        Vota adesso <ExternalLink className="size-4" aria-hidden />
                      </a>
                    ) : (
                      <span className="inline-flex h-10 cursor-not-allowed items-center rounded-md bg-white/[0.06] px-4 text-sm font-semibold text-white/45">Presto disponibile</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <section className="fbox p-5" data-reveal>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Come funziona</h2>
              <ol className="mt-4 grid gap-3">
                {STEPS.map((text, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/75">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent/20 text-xs font-bold text-[#ff8a80]">{i + 1}</span>
                    <span className="pt-0.5">{text}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
      </div>
      <DiscordBand />
    </>
  );
}
