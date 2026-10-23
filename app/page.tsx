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
  { href: "/regole", t: "Regolamento", d: "le leggi dell'impero", ext: false },
  { href: "/forum", t: "Forum", d: "discussioni e ambasciate", ext: false },
  { href: "/mappa", t: "Mappa", d: "il mondo dall'alto", ext: false },
  { href: siteConfig.links.discord, t: "Discord", d: "la community", ext: true },
];

export default function Home() {
  return (
    <>
      <HeroIntro />

      <section className="relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col overflow-hidden">
        <Image src="/images/hero-bg.jpg" alt="" fill priority sizes="100vw" className="kenburns -z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/45 to-[#0b0a0c]" />
        <div className="wrap flex flex-1 flex-col items-center justify-center py-10 text-center">
          <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 hero-in" data-hero-in>
            <span className="dot-live size-2 rounded-full bg-accent" /> minecraft java · survival towny
          </p>
          <div className="float-y mb-5 w-[min(55vw,280px)]">
            <TiberiusLogo variant="fluid" className="w-full drop-shadow-[0_12px_40px_rgba(0,0,0,.6)]" priority />
          </div>
          <h1 className="text-[length:var(--step-display)] text-white">
            <Words text="La gloria non conosce confini." mode="hero" />
          </h1>
          <p className="mt-5 max-w-xl text-[length:var(--step-lead)] leading-snug text-white/85 hero-in" data-hero-in>
            Fonda una città, forma una nazione, scrivi la storia dell&apos;impero.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 hero-in" data-hero-in>
            <CopyIp ip={siteConfig.server.ip} tone="dark" />
            <Btn href={siteConfig.links.discord} external variant="accent">entra nel discord</Btn>
          </div>
        </div>
        <div className="wrap w-full pb-8">
          <ul className="panel grid divide-white/10 sm:grid-cols-2 sm:divide-x lg:grid-cols-4" data-stagger="0.08" style={{ background: "rgb(10 9 12 / 0.6)", backdropFilter: "blur(14px)" }}>
            {quick.map((q) => (
              <li key={q.t} className="border-b border-white/10 last:border-b-0 sm:border-b-0">
                <Link href={q.href} {...(q.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-white/5">
                  <span>
                    <span className="block font-semibold">{q.t}</span>
                    <span className="text-sm text-white/60">{q.d}</span>
                  </span>
                  <span aria-hidden className="text-xl transition-transform group-hover:translate-x-1.5">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Ticker className="on-field py-4" items={["città", "nazioni", "guerre", "diplomazia", "goldoni", "impero"]} />

      {/* NEWS */}
      <section className="wrap section">
        <div className="panel grid gap-6 p-8 md:p-12 lg:grid-cols-[1fr_1.3fr] lg:items-center lg:gap-12" data-reveal>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">novità dal foro</p>
            <h2 className="text-[length:var(--step-head)]">Nessuna novità, per ora.</h2>
          </div>
          <div className="grid gap-5">
            <p className="text-muted">Gli annunci ufficiali compariranno qui. Per gli aggiornamenti in tempo reale c&apos;è il Discord.</p>
            <div><Btn href="/news" variant="light">tutte le news</Btn></div>
          </div>
        </div>
      </section>

      {/* COME ENTRARE */}
      <section className="wrap section pt-0">
        <div className="panel grid lg:grid-cols-[1.1fr_1fr]" data-reveal>
          <div className="p-8 md:p-12">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">guida</p>
            <h2 className="text-[length:var(--step-head)]">Come entrare</h2>
            <ol className="mt-8 grid gap-4">
              {[
                "Apri Minecraft Java e vai su Multiplayer.",
                "Premi Aggiungi server.",
                `Nome: TiberiusMC. Indirizzo: ${siteConfig.server.ip}.`,
                "Salva, seleziona il server ed entra.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-4 leading-snug">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-sm font-bold text-white">{i + 1}</span>
                  <span className="pt-1">{t}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <CopyIp ip={siteConfig.server.ip} tone="dark" />
              <Btn href="/entra" variant="light">guida completa</Btn>
            </div>
          </div>
          <div className="relative min-h-72 lg:min-h-full">
            <Image src="/images/aggiungi-server.png" alt="Schermata di Minecraft: modifica le informazioni del server con nome TiberiusMC e indirizzo play.tiberiusmc.it" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-r from-[#131116] via-transparent to-transparent max-lg:hidden" />
          </div>
        </div>
      </section>

      {/* GOLDONI */}
      <section className="wrap section pt-0">
        <div className="panel grid items-center gap-8 p-8 md:p-12 lg:grid-cols-[1.4fr_1fr]" data-reveal>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">goldoni e store</p>
            <h2 className="text-[length:var(--step-head)]">Il Goldone, moneta premium.</h2>
            <p className="mt-4 max-w-xl text-muted">
              Non è la valuta di gioco: vive a parte, e le sue regole saranno spiegate qui. Lo store è in preparazione.
            </p>
            <div className="mt-6">
              {siteConfig.links.store ? (
                <Btn href={siteConfig.links.store} external variant="accent">vai allo store</Btn>
              ) : (
                <span className="inline-block rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold">store in arrivo</span>
              )}
            </div>
          </div>
          <Image src="/images/art/goldone.png" alt="Il Goldone, moneta premium di Tiberius MC" width={640} height={640} className="coin-spin mx-auto w-40 md:w-52" unoptimized />
        </div>
      </section>

      {/* DISCORD */}
      <section className="wrap section pt-0">
        <div className="panel panel-accent grid gap-6 p-8 md:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center" data-reveal>
          <h2 className="text-[length:var(--step-head)]">Entra nel nostro Discord.</h2>
          <div className="grid gap-5">
            <p>Annunci, supporto, eventi e il collegamento del tuo account ai gestionali. Ci trovi anche su Telegram {siteConfig.links.telegramHandle}.</p>
            <div className="flex flex-wrap gap-3">
              <Btn href={siteConfig.links.discord} external variant="light">discord</Btn>
              <Btn href={siteConfig.links.telegram} external variant="ink">telegram</Btn>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
