import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { NewsCard } from "@/components/news/parts";
import { listPublished } from "@/lib/server/news";
import { ArrowRight } from "lucide-react";
import { Words } from "@/components/ui/Words";
import { CopyIp } from "@/components/ui/CopyIp";
import { JoinNow } from "@/components/ui/JoinNow";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { DiscordCount } from "@/components/ui/DiscordCount";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { TiberiusLogo } from "@/components/TiberiusLogo";
import { siteConfig } from "@/lib/site-config";


export default function Home() {
  return (
    <>
      <section className="relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col overflow-hidden">
        <Image src="/images/hero-bg.jpg" alt="" fill priority sizes="100vw" className="kenburns -z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/45 to-[#0b0a0c]" />
        <div className="wrap flex flex-1 flex-col items-center justify-center pb-[14vw] pt-10 text-center">
          <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 hero-in" data-hero-in>
            <span className="dot-live size-2 rounded-full bg-accent" /> minecraft java · survival towny
          </p>
          <div className="mb-5 w-[min(55vw,280px)]" data-hero-logo>
            <div className="float-soft">
              <TiberiusLogo variant="fluid" className="w-full drop-shadow-[0_12px_40px_rgba(0,0,0,.6)]" priority />
            </div>
          </div>
          <h1 className="text-[length:var(--step-display)] uppercase text-white">
            <Words text="La gloria non conosce confini!" mode="hero" />
          </h1>
          <p className="mt-5 max-w-[62rem] text-[length:var(--step-lead)] leading-snug text-white/85 hero-in" data-hero-in>
            Fonda la tua città, stringi alleanze e conquista nuovi territori.{" "}
            <br className="hidden lg:block" />
            In un mondo dove ogni scelta può cambiare gli equilibri, il tuo futuro dipende da te.
          </p>
          <div className="mt-9 hero-in" data-hero-in>
            <JoinNow target="come-entrare" />
          </div>
        </div>
        {/* Skyline di Roma: chiude la parte alta e fa da passaggio verso il resto della pagina */}
        <Image
          src="/images/skyline-roma-v2.webp"
          alt=""
          width={2152}
          height={301}
          priority
          unoptimized
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 block w-full select-none"
        />
      </section>

      {/* COME ENTRARE: niente riquadro, video grande e passaggi in fila */}
      <section id="come-entrare" className="wrap pb-[var(--section)] pt-14 md:pt-20">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
          <div data-reveal="left">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-accent">guida</p>
            <h2 className="text-[length:var(--step-head)]">Come entrare.</h2>
            <p className="mt-4 max-w-md text-lg text-white/70">Bastano quattro passaggi da Minecraft Java.</p>
            <div className="mt-7">
              <CopyIp ip={siteConfig.server.ip} tone="dark" />
            </div>
          </div>
          <div className="zoom-media relative aspect-video overflow-hidden rounded-md" data-reveal="clip" data-delay="0.1">
            <LoopVideo
              src="/video/guida-entra-v2.mp4"
              poster="/video/guida-entra.jpg"
              label="Video: in Minecraft si aggiunge il server con nome TiberiusMC e indirizzo play.tiberiusmc.it"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
        </div>
        <ol className="mt-12 grid border-t border-white/12 sm:grid-cols-2 lg:grid-cols-4" data-stagger="0.08">
          {[
            "Apri Minecraft Java e vai su Multiplayer.",
            "Premi Aggiungi server.",
            `Scrivi ${siteConfig.server.ip} come indirizzo.`,
            "Salva, seleziona il server ed entra.",
          ].map((t, i) => (
            <li key={i} className="pr-6 pt-7">
              <span className="block text-6xl font-extrabold leading-none text-accent">{i + 1}</span>
              <span className="mt-3 block text-[1.05rem] leading-snug text-white/85">{t}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* GOLDONE: tesoro che luccica, il legionario poggia sul bordo in basso */}
      <section className="relative overflow-hidden bg-[radial-gradient(30%_60%_at_74%_92%,rgb(255_196_64/0.55)_0%,rgb(255_150_40/0.18)_45%,transparent_72%),linear-gradient(180deg,#3a0907_0%,#7d1912_55%,#a3231a_100%)]">
        <div aria-hidden className="gold-dust absolute inset-x-0 top-0 h-3/5" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="wrap relative grid items-end gap-6 lg:min-h-[25rem] lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div className="self-center pt-12 lg:py-11" data-reveal="left">
            <h2 className="text-[clamp(2.4rem,4.4vw,3.9rem)] leading-[0.98]">
              Lo store sta per <span className="text-[#ffc94d]">arrivare!</span>
            </h2>
            <p className="mt-5 max-w-lg text-lg text-white/80">
              Stiamo lavorando allo store del server e manca sempre meno alla sua apertura.
            </p>
            <p className="mt-3 max-w-lg text-lg text-white/80">
              Ci troverai oggetti speciali e altre cose che potrai aggiungere alla tua collezione. Tra le novità ci sarà anche il Goldone, la nostra valuta premium.
            </p>
            <div className="mt-8">
              {siteConfig.links.store ? (
                <a href={siteConfig.links.store} target="_blank" rel="noopener noreferrer" className="btn !bg-[#ffc94d] !text-[#3a1a00] hover:!bg-[#ffd76e]" data-magnetic>
                  vai allo store
                </a>
              ) : (
                <span className="btn cursor-default !bg-white/10 !text-white/90 ring-1 ring-inset ring-[#ffd28a]/35">store in arrivo</span>
              )}
            </div>
          </div>
          {/* Forziere che esplode di Goldoni: sospeso, centrato in altezza nella fascia */}
          <div className="mx-auto w-[min(85%,26rem)] self-center py-6 lg:w-[30rem] lg:py-8" data-reveal="zoom" data-delay="0.15">
            <Image src="/images/forziere-goldoni.webp" alt="Un forziere da cui escono tanti Goldoni, la moneta premium di TiberiusMC" width={1252} height={1172} className="block w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]" unoptimized />
          </div>
        </div>
      </section>

      {/* COMMUNITY: attaccata al Goldone. Notte stellata, la mascotte di Discord con l'elmo da legionario */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#141633_0%,#23266e_55%,#3b3fae_100%)]">
        <div aria-hidden className="night-stars absolute inset-x-0 top-0 h-3/5" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="wrap relative grid items-end gap-6 lg:min-h-[28rem] lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <div className="self-center pt-14 lg:order-2 lg:py-14" data-reveal="right">
            {/* Icona in un riquadro accanto al titolo, testo breve e un bottone largo */}
            <div className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-black/30 ring-1 ring-inset ring-white/10">
                <DiscordIcon className="size-8 text-[#8c96ff]" />
              </span>
              <h2 className="text-[clamp(1.4rem,2.6vw,2rem)] uppercase leading-tight lg:whitespace-nowrap">Unisciti al nostro Discord</h2>
            </div>
            <p className="mt-5 text-lg leading-relaxed text-white/80">
              Entra nella community del server: conosci altri giocatori, resta sempre aggiornato sulle novità, partecipa agli eventi e chiedi aiuto allo staff ogni volta che ne hai bisogno. Ti aspettiamo, non mancare!
            </p>
            <a
              href={siteConfig.links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex h-20 w-full items-center justify-center gap-3 rounded-lg bg-[#5865f2] text-lg font-extrabold text-white shadow-[0_14px_34px_-12px_rgb(0_0_0/0.6)] ring-1 ring-inset ring-white/15 transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#6b77ff]"
            >
              <DiscordIcon className="size-7" /> Unisciti al Discord
            </a>
            {/* Membri e online di Discord, dal vivo */}
            <div className="mt-5 flex min-h-5 justify-center">
              <DiscordCount invite={siteConfig.links.discord} className="justify-center text-white/80" />
            </div>
          </div>
          {/* Wumpus legionario fermo a metà altezza */}
          <div className="mx-auto w-[min(55%,16rem)] self-center py-10 lg:order-1 lg:w-[19rem] lg:justify-self-center" data-reveal="left" data-delay="0.15">
            <div>
              <Image src="/images/wumpus-legionario.webp" alt="La mascotte di Discord con l'elmo da legionario romano che saluta" width={790} height={1187} className="block w-full drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]" unoptimized />
            </div>
          </div>
        </div>
      </section>

      {/* NEWS: le ultime tre; finché non ce ne sono resta una riga sottile */}
      <Suspense fallback={<NewsLine />}>
        <LatestNews />
      </Suspense>
    </>
  );
}

function NewsLine() {
  return (
    <section className="mb-14 mt-16 border-y border-white/10">
      <div className="wrap flex flex-wrap items-center justify-between gap-3 py-5">
        <p className="font-bold">
          Novità dal foro <span className="ml-3 text-sm font-medium text-white/50">Nessun annuncio per ora</span>
        </p>
        <Link href="/news" className="group flex items-center gap-2 font-bold text-white/85 transition-colors hover:text-white">
          Tutte le news <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

async function LatestNews() {
  const news = (await listPublished(3)).slice(0, 3);
  if (!news.length) return <NewsLine />;
  return (
    <section className="wrap py-[var(--section)]">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-[length:var(--step-head)]">Novità dal foro</h2>
        <Link href="/news" className="group flex items-center gap-2 font-bold text-white/85 transition-colors hover:text-white">
          Tutte le news <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((n) => (
          <NewsCard key={n.id} item={n} />
        ))}
      </div>
    </section>
  );
}
