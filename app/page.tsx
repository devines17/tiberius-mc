import Image from "next/image";
import Link from "next/link";
import { Words } from "@/components/ui/Words";
import { Btn } from "@/components/ui/Btn";
import { CopyIp } from "@/components/ui/CopyIp";
import { Ticker } from "@/components/ui/Ticker";
import { TiberiusLogo } from "@/components/TiberiusLogo";
import { HeroIntro } from "@/components/motion/HeroIntro";
import { siteConfig } from "@/lib/site-config";

const quick = [
  { href: "/regole", t: "regolamento", d: "le leggi dell'impero" },
  { href: "/forum", t: "forum", d: "discussioni e ambasciate" },
  { href: "/mappa", t: "mappa", d: "il mondo dall'alto" },
  { href: "/portale", t: "gestionale", d: "area privata" },
];

const steps = [
  { n: "01", t: "fondi una città", d: "Parti da un villaggio. Reclama il terreno, costruisci, invita altri cittadini.", art: "/images/art/village.png" },
  { n: "02", t: "cresci in nazione", d: "Più città si uniscono sotto una sola bandiera, con un governo e una storia.", art: "/images/art/town.png" },
  { n: "03", t: "governa l'impero", d: "Alleanze, trattati, rivalità: la diplomazia decide chi regna.", art: "/images/art/empire.png" },
  { n: "04", t: "vai in guerra", d: "Quando le parole finiscono, assedia. Le guerre si combattono sul campo.", art: "/images/art/siege.png" },
];

const gestionali = [
  { t: "gestionale città", d: "Cittadini, ruoli e territorio della tua città. Visibile solo ai suoi membri." },
  { t: "gestionale nazione", d: "Governo, città alleate e decisioni della tua nazione. Mai pubblico." },
  { t: "profilo giocatore", d: "Il tuo account Minecraft, i tuoi goldoni e la tua storia nell'impero." },
];

export default function Home() {
  return (
    <>
      <HeroIntro />

      {/* HERO con foto di sfondo */}
      <section className="relative isolate flex min-h-svh flex-col overflow-hidden">
        <Image src="/images/hero-bg.jpg" alt="" fill priority sizes="100vw" className="kenburns -z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/45 to-[#0b0a0c]" />
        <div className="wrap flex flex-1 flex-col items-center justify-center pb-10 pt-[calc(var(--header-h)+24px)] text-center">
          <p className="glass mb-8 inline-flex items-center gap-3 rounded-full px-5 py-2 text-sm font-semibold hero-in" data-hero-in>
            <span className="dot-live size-2.5 rounded-full bg-accent" /> minecraft java · survival towny
          </p>
          <div data-float className="mb-6 w-[min(72vw,380px)]">
            <TiberiusLogo variant="fluid" className="w-full drop-shadow-[0_12px_40px_rgba(0,0,0,.6)]" priority />
          </div>
          <h1 className="text-[length:var(--step-display)] text-white">
            <Words text={"minecraft,\nma romano."} mode="hero" />
          </h1>
          <p className="mt-6 max-w-xl text-[length:var(--step-lead)] leading-snug text-white/85 hero-in" data-hero-in>
            Fonda una città, forma una nazione, scrivi la storia dell&apos;impero.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 hero-in" data-hero-in>
            <CopyIp ip={siteConfig.server.ip} tone="dark" />
            <Btn href={siteConfig.links.discord} external variant="accent">entra nel discord</Btn>
          </div>
        </div>
        <div className="wrap pb-10">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-stagger="0.1">
            {quick.map((q) => (
              <li key={q.href}>
                <Link href={q.href} className="glass group flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-accent/80" style={{ borderRadius: "28px 28px 0 0" }}>
                  <span>
                    <span className="block text-xl font-bold lowercase tracking-tight">{q.t}</span>
                    <span className="text-sm text-white/70">{q.d}</span>
                  </span>
                  <span aria-hidden className="text-2xl transition-transform group-hover:translate-x-1.5">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Ticker className="on-field py-6" items={["città", "nazioni", "guerre", "diplomazia", "goldoni", "gestionale", "impero"]} />

      {/* NEWS */}
      <section className="wrap section">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-[length:var(--step-head)]"><Words text="novità dal foro" /></h2>
          <Btn href="/news" variant="light">tutte le news</Btn>
        </div>
        <div className="on-surface grid gap-4 p-8 sm:p-12 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-12" style={{ borderRadius: "64px 64px 0 0" }} data-reveal>
          <p className="text-[length:var(--step-lead)] font-bold leading-tight">Nessuna novità, per ora.</p>
          <p className="text-muted">Gli annunci ufficiali compariranno qui. Per gli aggiornamenti in tempo reale c&apos;è il Discord.</p>
        </div>
      </section>

      {/* COME SI GIOCA */}
      <section className="on-surface section">
        <div className="wrap">
          <h2 className="mb-16 text-[length:var(--step-head)]"><Words text="come si gioca" /></h2>
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4" data-stagger="0.12">
            {steps.map((s, i) => (
              <article key={s.n} className={i % 2 ? "lg:mt-16" : ""}>
                <div className="arch aspect-[3/4] bg-white">
                  <Image src={s.art} alt="" width={720} height={960} className="size-full object-cover" unoptimized data-parallax="0.04" />
                </div>
                <p className="mt-5 font-semibold text-accent">{s.n}</p>
                <h3 className="mt-1 text-3xl">{s.t}</h3>
                <p className="mt-3 text-muted">{s.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* COME ENTRARE */}
      <section className="wrap section">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <h2 className="text-[length:var(--step-head)]"><Words text="come entrare" /></h2>
            <ol className="mt-10 grid gap-6" data-stagger="0.1">
              {[
                "Apri Minecraft Java e vai su Multiplayer.",
                "Premi Aggiungi server.",
                `Nome: Tiberius MC. Indirizzo: ${siteConfig.server.ip}.`,
                "Salva, seleziona il server ed entra.",
              ].map((t, i) => (
                <li key={i} className="flex gap-5 text-[length:var(--step-lead)] leading-snug">
                  <span className="grid size-11 shrink-0 place-items-center rounded-t-full bg-accent text-base font-bold text-white">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
            <div className="mt-10"><Btn href="/entra" variant="accent">guida completa</Btn></div>
          </div>
          <div className="on-surface mx-auto w-full max-w-md p-6" style={{ borderRadius: "48px 48px 0 0" }} data-reveal aria-hidden>
            <p className="mb-5 text-center font-bold">Modifica informazioni server</p>
            <p className="mb-1 text-sm text-muted">Nome del server</p>
            <div className="mb-4 bg-black/40 px-4 py-3">Tiberius MC</div>
            <p className="mb-1 text-sm text-muted">Indirizzo del server</p>
            <div className="mb-6 bg-black/40 px-4 py-3">{siteConfig.server.ip}</div>
            <div className="grid grid-cols-2 gap-3 text-center font-semibold">
              <span className="bg-accent py-3 text-white">Fatto</span>
              <span className="bg-white/10 py-3">Annulla</span>
            </div>
          </div>
        </div>
      </section>

      {/* GESTIONALE */}
      <section className="on-field section">
        <div className="wrap">
          <p className="mb-4 font-semibold text-accent">area privata</p>
          <h2 className="max-w-4xl text-[length:var(--step-head)]"><Words text="i gestionali dell'impero" /></h2>
          <p className="mt-6 max-w-2xl text-[length:var(--step-lead)] leading-snug text-white/80" data-reveal>
            Ogni gestionale è privato: lo vede solo chi ne fa parte. Collegherai il tuo account Minecraft da gioco o da Discord, e il sito saprà chi sei.
          </p>
          <div className="mt-14 grid gap-4 md:grid-cols-3" data-stagger="0.1">
            {gestionali.map((g) => (
              <article key={g.t} className="glass p-8" style={{ borderRadius: "56px 56px 0 0" }}>
                <p className="mb-6 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide">in arrivo</p>
                <h3 className="text-3xl">{g.t}</h3>
                <p className="mt-3 text-white/70">{g.d}</p>
              </article>
            ))}
          </div>
          <div className="mt-12" data-reveal><Btn href="/portale" variant="light">scopri il gestionale</Btn></div>
        </div>
      </section>

      {/* GOLDONI */}
      <section className="wrap section">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div className="relative mx-auto w-full max-w-xs">
            <Image src="/images/art/goldone.png" alt="Il Goldone, moneta premium di Tiberius MC" width={640} height={640} className="coin-spin w-full" unoptimized />
          </div>
          <div>
            <h2 className="text-[length:var(--step-head)]"><Words text="goldoni e store" /></h2>
            <p className="mt-6 max-w-xl text-[length:var(--step-lead)] leading-snug" data-reveal>
              Il Goldone è la moneta premium del server. Non è la valuta di gioco: vive a parte. Lo store è in preparazione.
            </p>
            <div className="mt-8" data-reveal>
              {siteConfig.links.store ? <Btn href={siteConfig.links.store} external variant="accent">vai allo store</Btn> : <span className="rounded-full bg-surface px-5 py-2 font-semibold">store in arrivo</span>}
            </div>
          </div>
        </div>
      </section>

      {/* DISCORD */}
      <section className="on-accent section">
        <div className="wrap grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <h2 className="text-[length:var(--step-display)]"><Words text={"entra nel\nnostro discord."} /></h2>
          <div className="grid gap-6">
            <p className="text-[length:var(--step-lead)] leading-snug" data-reveal>
              Annunci, supporto, eventi e il collegamento del tuo account ai gestionali. Ci trovi anche su Telegram {siteConfig.links.telegramHandle}.
            </p>
            <div className="flex flex-wrap gap-3" data-reveal>
              <Btn href={siteConfig.links.discord} external variant="light">discord</Btn>
              <Btn href={siteConfig.links.telegram} external variant="ink">telegram</Btn>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
