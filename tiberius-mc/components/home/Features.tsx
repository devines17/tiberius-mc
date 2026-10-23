import { Coins, Crown, Handshake, Landmark, ScrollText, Swords } from "lucide-react";
import { OrnamentDivider, SectionHeading } from "@/components/ui";

const features = [
  {
    icon: Landmark,
    title: "Città",
    text: "Fonda la tua città, reclama il territorio, accogli cittadini e costruisci monumenti degni di Roma. Difendi i tuoi confini o amplia la tua influenza.",
  },
  {
    icon: Crown,
    title: "Nazioni",
    text: "Unisci più città sotto un'unica bandiera. Una nazione ha un leader, un'identità e un destino da scrivere insieme ai suoi cittadini.",
  },
  {
    icon: Coins,
    title: "Economia",
    text: "Commerci, scambi e tasse muovono l'impero. Accanto alla valuta normale c'è il Goldone, la valuta premium acquistabile dallo store ufficiale.",
  },
  {
    icon: Handshake,
    title: "Diplomazia",
    text: "Alleanze, neutralità, rivalità e trattati: ogni accordo, e ogni tradimento, cambia gli equilibri tra città e nazioni.",
  },
  {
    icon: Swords,
    title: "Guerre e PvP",
    text: "Quando la diplomazia fallisce parlano le armi. Difendi le tue mura, guida le tue legioni e conquista la gloria sul campo di battaglia.",
  },
  {
    icon: ScrollText,
    title: "Storia condivisa",
    text: "Fondazioni, guerre e trattati sono pensati per confluire nell'Archivio Imperiale: la cronologia condivisa di tutto ciò che accade nel mondo.",
  },
];

export function Features() {
  return (
    <section id="caratteristiche" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeading
        eyebrow="Il Server"
        title="Un impero fatto di giocatori"
        description="Tiberius MC unisce la libertà del Survival alla profondità di Towny: ogni città, ogni nazione e ogni scelta politica la scrivono i giocatori."
      />
      <OrnamentDivider className="mt-8" />

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <li key={title} className="panel panel-hover flex flex-col gap-4 p-7">
            <span className="flex size-12 items-center justify-center rounded-lg border border-gold/35 bg-gold/10 text-gold-bright">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <h3 className="font-display text-xl font-bold uppercase tracking-wide text-ivory">{title}</h3>
            <p className="leading-relaxed text-stone">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
