import { Castle, Flag, Lock, MapPin, ScrollText, Users } from "lucide-react";
import { EmptyState, SectionHeading } from "@/components/ui";

const cardFields = [
  { icon: Flag, label: "Nome, stemma e descrizione" },
  { icon: Users, label: "Sindaco o leader e residenti" },
  { icon: ScrollText, label: "Stato diplomatico pubblico ed eventi storici" },
  { icon: MapPin, label: "Collegamento alla mappa" },
];

export function CitiesNations() {
  return (
    <section id="citta" className="stone-section">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          eyebrow="Città e Nazioni"
          title="Le potenze dell'impero"
          description="Ogni città e ogni nazione pubblica avrà la sua scheda, con le informazioni che il server rende pubbliche."
        />

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-2">
          <div className="panel p-7 sm:p-9">
            <h3 className="font-display text-xl font-bold uppercase tracking-wide text-ivory">
              Cosa mostrerà una scheda
            </h3>
            <ul className="mt-6 space-y-4">
              {cardFields.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold-bright">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-ivory/90">{label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-start gap-3 rounded-lg border border-imperial/40 bg-imperial/10 p-4 text-sm leading-relaxed text-stone">
              <Lock className="mt-0.5 size-4 shrink-0 text-imperial-bright" aria-hidden="true" />
              <p>
                Banca cittadina, tasse riservate e dati amministrativi non compaiono mai nelle pagine pubbliche: sono
                visibili solo al sindaco e ai ruoli autorizzati.
              </p>
            </div>
          </div>

          <EmptyState icon={Castle} title="Il registro è ancora vuoto">
            Le schede di città e nazioni compariranno qui non appena il sito sarà collegato ai dati reali del server.
            Nessun elenco di prova: solo ciò che esiste davvero nel mondo di gioco.
          </EmptyState>
        </div>
      </div>
    </section>
  );
}
