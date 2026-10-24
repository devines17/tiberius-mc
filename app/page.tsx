import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Words } from "@/components/ui/Words";
import { CopyIp } from "@/components/ui/CopyIp";
import { JoinNow } from "@/components/ui/JoinNow";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { TelegramIcon } from "@/components/ui/TelegramIcon";
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
        <div className="wrap relative grid items-end gap-6 lg:min-h-[28rem] lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div className="self-center pt-14 lg:py-14" data-reveal="left">
            <div className="inline-flex min-h-9 items-center gap-2.5 rounded-full border border-[#ffd28a]/30 bg-black/25 py-1 pl-1.5 pr-4">
              <Image src="/images/art/goldone.png" alt="" width={640} height={640} className="size-7" unoptimized />
              <span className="text-sm font-semibold text-[#ffe2a8]">Goldoni e store</span>
            </div>
            <h2 className="mt-5 text-[clamp(2.6rem,5vw,4.4rem)] leading-[0.98]">
              Il Goldone,
              <br />
              moneta <span className="text-[#ffc94d]">premium</span>.
            </h2>
            <p className="mt-5 max-w-md text-lg text-white/80">
              È separato dal denaro che usi in gioco: le due monete non si mescolano. Come ottenerlo e cosa puoi acquistare lo spiegheremo qui all&apos;apertura dello store.
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
          <div className="self-end pt-4" data-reveal="right" data-delay="0.15">
            <Image src="/images/legionario-tesoro.png" alt="Un legionario di TiberiusMC apre un forziere pieno di Goldoni e gemme" width={1000} height={785} className="mx-auto block w-full max-w-xl" unoptimized />
          </div>
        </div>
      </section>

      {/* COMMUNITY: attaccata al Goldone. Notte stellata e bagliore del fuoco dietro i legionari */}
      <section className="relative overflow-hidden bg-[radial-gradient(34%_62%_at_20%_86%,rgb(255_140_40/0.6)_0%,rgb(255_96_30/0.2)_45%,transparent_72%),linear-gradient(180deg,#141633_0%,#23266e_55%,#3b3fae_100%)]">
        <div aria-hidden className="night-stars absolute inset-x-0 top-0 h-3/5" />
        <div className="wrap relative grid items-end gap-6 lg:min-h-[28rem] lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div className="self-center pt-14 lg:order-2 lg:py-14" data-reveal="right">
            <div className="inline-flex min-h-9 items-center gap-2.5 rounded-full border border-white/15 bg-black/25 py-1 pl-2.5 pr-4">
              <DiscordIcon className="size-5 text-[#c9cdff]" />
              <span className="text-sm font-semibold text-[#dfe1ff]">Community</span>
            </div>
            <h2 className="mt-5 text-[clamp(2.6rem,5vw,4.4rem)] leading-[0.98]">
              Intorno
              <br />
              al <span className="text-[#ffb36b]">fuoco</span>.
            </h2>
            <p className="mt-5 max-w-md text-lg text-white/80">
              Annunci, eventi e due chiacchiere con lo staff. Ci trovi su Discord e su Telegram.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 sm:flex-nowrap">
              <a href={siteConfig.links.discord} target="_blank" rel="noopener noreferrer" className="btn !bg-white !text-[#2b2f8f] hover:!bg-[#e9eaff]" data-magnetic>
                <DiscordIcon className="size-5" /> Entra su Discord
              </a>
              <a href={siteConfig.links.telegram} target="_blank" rel="noopener noreferrer" className="btn !bg-white/10 !text-white ring-1 ring-inset ring-white/25 hover:!bg-white/20" data-magnetic>
                <TelegramIcon className="size-5" /> Telegram
              </a>
            </div>
            {/* Membri e online di Discord, dal vivo */}
            <div className="mt-5 min-h-5">
              <DiscordCount invite={siteConfig.links.discord} className="text-white/80" />
            </div>
          </div>
          {/* Legionari più grandi della colonna: sbordano un po' a sinistra e poggiano sul fondo */}
          <div className="self-end pt-4 lg:order-1" data-reveal="left" data-delay="0.15">
            <Image src="/images/legionari-fuoco-v2.webp" alt="Cinque legionari di TiberiusMC che ridono e chiacchierano intorno a un fuoco da campo" width={1433} height={892} className="block w-full lg:-ml-[30%] lg:w-[128%] lg:max-w-none" unoptimized />
          </div>
        </div>
      </section>

      {/* NEWS: una riga sottile finché non ci sono annunci */}
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
    </>
  );
}
