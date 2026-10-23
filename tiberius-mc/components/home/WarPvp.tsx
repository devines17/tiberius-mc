import { ScrollText, Shield, Swords } from "lucide-react";
import { EmptyState, SectionHeading } from "@/components/ui";

export function WarPvp() {
  return (
    <section id="guerre" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeading
        eyebrow="Guerre e PvP"
        title="Per la gloria di Roma"
        description="Il campo di battaglia è il luogo in cui si decidono i confini. Prepara le tue difese, scegli i tuoi alleati e scendi in guerra."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <article className="panel panel-hover border-imperial/40 p-7">
            <span className="flex size-12 items-center justify-center rounded-lg border border-imperial/50 bg-imperial/15 text-imperial-bright">
              <Swords className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold uppercase tracking-wide text-ivory">Guerre</h3>
            <p className="mt-3 leading-relaxed text-stone">
              Città e nazioni possono entrare in guerra tra loro. Ogni conflitto ha le sue parti, le sue regole e un
              esito che lascia il segno sulla mappa e nella storia.
            </p>
          </article>
          <article className="panel panel-hover border-imperial/40 p-7">
            <span className="flex size-12 items-center justify-center rounded-lg border border-imperial/50 bg-imperial/15 text-imperial-bright">
              <Shield className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold uppercase tracking-wide text-ivory">Combattimento PvP</h3>
            <p className="mt-3 leading-relaxed text-stone">
              Affronta altri giocatori in scontri diretti. Equipaggiamento, strategia e coordinamento fanno la differenza
              tra una legione e una banda di sbandati.
            </p>
          </article>
        </div>

        <EmptyState icon={ScrollText} title="Nessuna guerra registrata">
          Le guerre registrate dal server, con parti coinvolte, stato ed esito verificato, saranno consultabili qui e
          nell&apos;Archivio Imperiale.
        </EmptyState>
      </div>
    </section>
  );
}
