import { Handshake, Scale, Skull, Swords } from "lucide-react";
import { SectionHeading } from "@/components/ui";

const states = [
  {
    icon: Handshake,
    title: "Alleanza",
    text: "Città e nazioni che si sostengono a vicenda, condividono nemici e difendono gli stessi confini.",
    accent: "border-gold/45 text-gold-bright bg-gold/10",
  },
  {
    icon: Scale,
    title: "Neutralità",
    text: "Chi sceglie di non schierarsi: commercia con tutti, ma non può contare su nessuno.",
    accent: "border-stone/40 text-ivory bg-stone/10",
  },
  {
    icon: Skull,
    title: "Rivalità",
    text: "Tensioni, dispute di confine e vecchi rancori che possono precipitare in conflitto aperto.",
    accent: "border-bronze/50 text-bronze bg-bronze/10",
  },
  {
    icon: Swords,
    title: "Guerra",
    text: "Lo scontro dichiarato: le legioni scendono in campo e il destino delle città è in gioco.",
    accent: "border-imperial/55 text-imperial-bright bg-imperial/15",
  },
];

export function Diplomacy() {
  return (
    <section id="diplomazia" className="stone-section">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          eyebrow="Diplomazia"
          title="Il potere delle parole"
          description="Un trattato può valere più di una legione. Questi sono gli stati che possono legare, o dividere, città e nazioni."
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {states.map(({ icon: Icon, title, text, accent }) => (
            <li key={title} className="panel panel-hover flex flex-col gap-4 p-6">
              <span className={`flex size-12 items-center justify-center rounded-lg border ${accent}`}>
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ivory">{title}</h3>
              <p className="text-sm leading-relaxed text-stone">{text}</p>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-stone-dim">
          Lo stato diplomatico pubblico di ogni città e nazione sarà mostrato nella sua scheda, a partire dai dati reali
          di Towny.
        </p>
      </div>
    </section>
  );
}
