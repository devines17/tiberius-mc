import { Words } from "@/components/ui/Words";
import { Btn } from "@/components/ui/Btn";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { siteConfig } from "@/lib/site-config";

/** Righe numerate dentro un riquadro. */
export function Rows({ items, title }: { items: { t: string; d: string }[]; title: string }) {
  return (
    <section className="wrap section">
      <h2 className="mb-8 text-[length:var(--step-head)]">
        <Words text={title} />
      </h2>
      <ol className="panel divide-y divide-white/10" data-stagger="0.08">
        {items.map((it, i) => (
          <li key={it.t} className="grid gap-3 p-6 md:grid-cols-[4rem_1fr_1.2fr] md:gap-8 md:p-8">
            <span className="font-semibold text-accent">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="text-xl">{it.t}</h3>
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
    <section className="wrap section">
      <div className="panel grid gap-8 p-8 md:p-12 lg:grid-cols-[1fr_1.2fr] lg:items-center" data-reveal>
        <h2 className="text-[length:var(--step-head)]">{title}</h2>
        <div className="grid gap-6">
          <p className="text-[length:var(--step-lead)] leading-snug">{text}</p>
          <div>
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
    <section className="wrap section">
      <div className="panel panel-discord flex flex-wrap items-center justify-between gap-6 p-8 md:p-12" data-reveal>
        <h2 className="flex items-center gap-4 text-[length:var(--step-head)]"><DiscordIcon className="size-10" /> Vieni nel nostro Discord.</h2>
        <Btn href={siteConfig.links.discord} external variant="light">entra nel discord</Btn>
      </div>
    </section>
  );
}
