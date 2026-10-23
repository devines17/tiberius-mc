import { Words } from "@/components/ui/Words";
import { Btn } from "@/components/ui/Btn";
import { siteConfig } from "@/lib/site-config";

/** Righe numerate: titolo grande a sinistra, testo a destra. */
export function Rows({ items, title }: { items: { t: string; d: string }[]; title: string }) {
  return (
    <section className="wrap section">
      <h2 className="mb-14 text-[length:var(--step-head)]">
        <Words text={title} />
      </h2>
      <ol className="border-t border-ink" data-stagger="0.08">
        {items.map((it, i) => (
          <li key={it.t} className="grid gap-3 border-b border-ink/20 py-8 md:grid-cols-[5rem_1fr_1.2fr] md:gap-8">
            <span className="font-semibold text-accent">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="text-2xl">{it.t}</h3>
            <p className="text-muted">{it.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Stato "in arrivo": mai dati inventati. */
export function Soon({ title, text }: { title: string; text: string }) {
  return (
    <section className="on-surface section">
      <div className="wrap grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <h2 className="text-[length:var(--step-head)]">
          <Words text={title} />
        </h2>
        <div className="grid gap-6" data-reveal>
          <p className="text-[length:var(--step-lead)] leading-snug">{text}</p>
          <div className="flex flex-wrap gap-3">
            <Btn href={siteConfig.links.discord} external variant="accent">avvisami su discord</Btn>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Chiusura comune: invito al Discord. */
export function DiscordBand() {
  return (
    <section className="on-field section">
      <div className="wrap flex flex-wrap items-end justify-between gap-8">
        <h2 className="text-[length:var(--step-head)]">
          <Words text={"vieni nel\nnostro discord."} />
        </h2>
        <Btn href={siteConfig.links.discord} external variant="accent">entra nel discord</Btn>
      </div>
    </section>
  );
}
