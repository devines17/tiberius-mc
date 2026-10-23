import Image from "next/image";
import Link from "next/link";
import { Words } from "@/components/ui/Words";
import { Btn } from "@/components/ui/Btn";
import { CopyIp } from "@/components/ui/CopyIp";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { TelegramIcon } from "@/components/ui/TelegramIcon";
import { ServerStatus } from "@/components/ui/ServerStatus";
import { DiscordCount } from "@/components/ui/DiscordCount";
import { TiberiusLogo } from "@/components/TiberiusLogo";
import { siteConfig } from "@/lib/site-config";

const quick = [
  { href: "/regole", t: "Regolamento", ext: false },
  { href: "/forum", t: "Forum", ext: false },
  { href: "/mappa", t: "Mappa", ext: false },
  { href: siteConfig.links.discord, t: "Discord", ext: true },
];

export default function Home() {
  return (
    <>
      <section className="relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col overflow-hidden">
        <Image src="/images/hero-bg.jpg" alt="" fill priority sizes="100vw" className="kenburns -z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/45 to-[#0b0a0c]" />
        <div className="wrap flex flex-1 flex-col items-center justify-center py-10 text-center">
          <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 hero-in" data-hero-in>
            <span className="dot-live size-2 rounded-full bg-accent" /> minecraft java · survival towny
          </p>
          <div className="mb-5 w-[min(55vw,280px)]" data-hero-logo>
            <div className="float-soft">
              <TiberiusLogo variant="fluid" className="w-full drop-shadow-[0_12px_40px_rgba(0,0,0,.6)]" priority />
            </div>
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
          <div className="mt-5 hero-in" data-hero-in>
            <ServerStatus host={siteConfig.server.ip} />
          </div>
        </div>
        <div className="wrap w-full pb-8">
          <ul className="panel grid divide-white/10 sm:grid-cols-2 sm:divide-x lg:grid-cols-4" data-stagger="0.08" data-delay="0.6" style={{ background: "rgb(10 9 12 / 0.6)", backdropFilter: "blur(14px)" }}>
            {quick.map((q) => (
              <li key={q.t} className="border-b border-white/10 last:border-b-0 sm:border-b-0">
                <Link href={q.href} {...(q.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-white/5">
                  <span className="font-semibold transition-colors group-hover:text-accent">{q.t}</span>
                  <span aria-hidden className="text-xl transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* NEWS */}
      <section className="wrap section">
        <div className="panel grid gap-6 p-8 md:p-12 lg:grid-cols-[1fr_1.3fr] lg:items-center lg:gap-12" data-reveal>
          <div data-reveal="left" data-delay="0.15">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">novità dal foro</p>
            <h2 className="text-[length:var(--step-head)]">Nessuna novità, per ora.</h2>
          </div>
          <div className="grid gap-5" data-reveal="right" data-delay="0.25">
            <p className="text-muted">Gli annunci ufficiali compariranno qui. Per gli aggiornamenti in tempo reale c&apos;è il Discord.</p>
            <div><Btn href="/news" variant="light">tutte le news</Btn></div>
          </div>
        </div>
      </section>

      {/* COME ENTRARE */}
      <section className="wrap section pt-0">
        <div className="panel grid lg:grid-cols-[1.1fr_1fr]" data-reveal>
          <div className="p-8 md:p-12">
            <div data-reveal="left" data-delay="0.1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">guida</p>
              <h2 className="text-[length:var(--step-head)]">Come entrare</h2>
            </div>
            <ol className="mt-8 grid gap-4" data-stagger="0.09">
              {[
                "Apri Minecraft Java e vai su Multiplayer.",
                "Premi Aggiungi server.",
                `Nome: TiberiusMC. Indirizzo: ${siteConfig.server.ip}.`,
                "Salva, seleziona il server ed entra.",
              ].map((t, i) => (
                <li key={i} className="group flex items-start gap-4 leading-snug">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-sm font-bold text-white transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">{i + 1}</span>
                  <span className="pt-1">{t}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap items-center gap-3" data-reveal="fade" data-delay="0.2">
              <CopyIp ip={siteConfig.server.ip} tone="dark" />
              <Btn href="/entra" variant="light">guida completa</Btn>
            </div>
          </div>
          <div className="zoom-media relative min-h-72 lg:min-h-full" data-reveal="clip" data-delay="0.15">
            <Image src="/images/aggiungi-server.png" alt="Schermata di Minecraft: modifica le informazioni del server con nome TiberiusMC e indirizzo play.tiberiusmc.it" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-r from-[#131116] via-transparent to-transparent max-lg:hidden" />
          </div>
        </div>
      </section>

      {/* GOLDONI */}
      <section className="wrap section pt-0">
        <div className="panel grid items-center gap-8 p-8 md:p-12 lg:grid-cols-[1.4fr_1fr]" data-reveal>
          <div data-stagger="0.1">
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
          <div className="mx-auto" data-reveal="zoom" data-delay="0.2">
            <Image src="/images/art/goldone.png" alt="Il Goldone, moneta premium di Tiberius MC" width={640} height={640} className="float-y w-40 md:w-52" unoptimized />
          </div>
        </div>
      </section>

      {/* DISCORD */}
      <section className="wrap section pt-0">
        <div className="panel panel-discord grid items-end gap-6 pl-8 pt-8 md:pl-12 md:pt-12 lg:grid-cols-[1.1fr_1fr]" data-reveal>
          <div className="grid gap-5 pb-8 pr-8 md:pb-12 md:pr-0" data-stagger="0.08">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/15">
                <DiscordIcon className="size-7" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">community ufficiale</span>
            </div>
            <h2 className="text-[length:var(--step-head)]">Il foro dell&apos;impero è su Discord.</h2>
            <p className="max-w-md text-white/90">
              Qui escono annunci ed eventi, lo staff risponde alle tue domande e colleghi il tuo account ai gestionali di città e nazioni.
            </p>
            <div className="min-h-5">
              <DiscordCount invite={siteConfig.links.discord} className="text-white/90" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn href={siteConfig.links.discord} external variant="light">entra nel discord</Btn>
            </div>
          </div>
          {/* "block" toglie lo spazio sotto l'immagine: i legionari poggiano sul bordo del riquadro */}
          <div className="mx-auto w-full max-w-md self-end pr-6 md:pr-12" data-reveal="right" data-delay="0.2">
            <Image src="/images/legionari-telefono.png" alt="Due legionari romani di Tiberius MC che guardano uno smartphone" width={1000} height={914} className="block w-full" unoptimized />
          </div>
        </div>
      </section>

      {/* TELEGRAM */}
      <section className="wrap section pt-0">
        <div className="panel panel-telegram relative grid items-center gap-8 p-8 md:p-12 lg:grid-cols-[1.4fr_1fr]" data-reveal>
          <div className="relative z-10 grid gap-5" data-stagger="0.08">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/15">
                <TelegramIcon className="size-7" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">telegram</span>
            </div>
            <h2 className="text-[length:var(--step-head)]">Gli annunci, anche su Telegram.</h2>
            <p className="max-w-md text-white/90">
              Segui {siteConfig.links.telegramHandle} e ricevi le novità del server direttamente sul telefono, senza aprire Discord.
            </p>
            <div>
              <Btn href={siteConfig.links.telegram} external variant="light">apri telegram</Btn>
            </div>
          </div>
          {/* Logo grande decorativo: solo da schermo largo */}
          <div aria-hidden className="pointer-events-none hidden justify-center lg:flex" data-reveal="zoom" data-delay="0.2">
            <TelegramIcon className="size-56 -rotate-12 text-white/20" />
          </div>
        </div>
      </section>
    </>
  );
}
