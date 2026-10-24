import { Words } from "@/components/ui/Words";
import { Btn } from "@/components/ui/Btn";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import Image from "next/image";
import { DiscordCount } from "@/components/ui/DiscordCount";
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
          <li key={it.t} className="group grid gap-3 p-6 transition-colors duration-300 hover:bg-white/[0.03] md:grid-cols-[4rem_1fr_1.2fr] md:gap-8 md:p-8">
            <span className="font-semibold text-accent transition-transform duration-300 group-hover:translate-x-1">{String(i + 1).padStart(2, "0")}</span>
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
        <h2 className="text-[length:var(--step-head)]" data-reveal="left" data-delay="0.15">{title}</h2>
        <div className="grid gap-6" data-reveal="right" data-delay="0.25">
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
/** Testi del riquadro Discord, diversi per ogni pagina. */
const DISCORD_COPY = {
  default: { kicker: "community ufficiale", title: "Vieni nel nostro Discord.", text: "Annunci, eventi e supporto dello staff stanno tutti lì. Se hai una domanda, è il posto più veloce per farla." },
  mappa: { kicker: "il mondo si muove", title: "Segui il mondo mentre cambia.", text: "Quando nasce una città o si sposta un confine, sul Discord se ne parla subito. La mappa la guardi qui, i commenti li trovi lì." },
  vota: { kicker: "voti e ricompense", title: "Resta aggiornato sui voti.", text: "Le novità sui voti e sulle ricompense escono sul Discord insieme agli altri annunci del server." },
  guerre: { kicker: "prima della battaglia", title: "Le guerre si preparano lì.", text: "Trattative, minacce e dichiarazioni passano quasi sempre dal Discord. Chi arriva preparato in campo di solito ci ha già parlato." },
  regole: { kicker: "dubbi sul regolamento", title: "Hai un dubbio su una regola?", text: "Chiedi allo staff sul Discord prima di rischiare una sanzione. Nessuna domanda è troppo semplice." },
  wiki: { kicker: "serve una mano", title: "Non trovi quello che cerchi?", text: "La wiki non può coprire tutto. Sul Discord trovi giocatori e staff che ti aiutano con quello che manca." },
  citta: { kicker: "trova casa", title: "Cerchi una città?", text: "Sul Discord i sindaci cercano nuovi cittadini e chi è appena arrivato trova qualcuno che lo accolga." },
  diplomazia: { kicker: "alleanze", title: "Le alleanze si stringono lì.", text: "Patti, accordi commerciali e qualche tradimento: quasi tutto parte da un messaggio sul nostro Discord." },
  staff: { kicker: "contatta lo staff", title: "Vuoi parlare con lo staff?", text: "Per una domanda veloce scrivici sul Discord. Per le richieste ufficiali, come ricorsi e segnalazioni, usa il forum." },
  news: { kicker: "annunci", title: "Le novità arrivano lì per prime.", text: "Gli annunci escono sul Discord appena sono pronti. Qui trovi il riepilogo con calma." },
  store: { kicker: "prima di acquistare", title: "Hai una domanda sullo store?", text: "Chiedi pure sul Discord prima di comprare. Se c'è un problema con un pagamento, apri una pratica Store sul forum." },
  entra: { kicker: "primi passi", title: "Non giocare da solo.", text: "Sul Discord trovi chi ti spiega come iniziare, una città che ti accoglie e lo staff se qualcosa non va." },
} as const;

/** Riquadro "entra nel Discord" in fondo alle pagine: testo adatto alla pagina, membri online e due legionari. */
export function DiscordBand({ topic = "default" }: { topic?: keyof typeof DISCORD_COPY }) {
  const c = DISCORD_COPY[topic];
  return (
    <section className="wrap section">
      <div className="panel panel-discord grid gap-2 overflow-hidden pl-8 md:pl-12 lg:grid-cols-[1.25fr_1fr] lg:gap-6" data-reveal>
        <div className="grid gap-5 self-center pr-8 pt-8 md:pt-12 lg:py-12 lg:pr-0" data-stagger="0.08">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#5865f2]/20 text-[#8c96ff]">
              <DiscordIcon className="size-7" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c96ff]">{c.kicker}</span>
          </div>
          <h2 className="text-[length:var(--step-head)]">{c.title}</h2>
          <p className="max-w-md text-white/80">{c.text}</p>
          <div className="min-h-5">
            <DiscordCount invite={siteConfig.links.discord} className="text-white/85" />
          </div>
          <div>
            <Btn href={siteConfig.links.discord} external variant="discord">
              <DiscordIcon className="size-5" /> Entra su Discord
            </Btn>
          </div>
        </div>
        {/* I legionari poggiano sul bordo del riquadro, come in home */}
        <div className="mx-auto w-full max-w-[22rem] self-end pr-6 pt-2 md:pr-12 lg:max-w-[26rem] lg:pt-10" data-reveal="right" data-delay="0.2">
          <Image src="/images/mercenari.png" alt="Due legionari di TiberiusMC con spada e scudo" width={1000} height={830} className="block w-full" unoptimized />
        </div>
      </div>
    </section>
  );
}
