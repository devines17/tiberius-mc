import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Words } from "@/components/ui/Words";
import { Btn } from "@/components/ui/Btn";
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

      {/* GOLDONE: fascia rossa a tutta larghezza, il legionario poggia sul bordo in basso */}
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,#5e110d_0%,#a3231a_60%,#c4382b_100%)]">
        {/* Pavimento: i personaggi ci poggiano sopra e copre il taglio in fondo all'immagine */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 z-10 h-5 border-t-2 border-[#d9483a]/40 bg-[#3d0b08]" />
        <div className="wrap grid items-end gap-4 lg:min-h-[30rem] lg:grid-cols-2 lg:gap-10">
          <div className="self-center pt-14 lg:py-16" data-reveal="left">
            <div className="flex items-center gap-3">
              <Image src="/images/art/goldone.png" alt="" width={640} height={640} className="float-soft size-10" unoptimized />
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#ffd28a]">goldoni e store</span>
            </div>
            <h2 className="mt-4 text-[length:var(--step-head)]">Il Goldone, moneta premium.</h2>
            <p className="mt-4 max-w-xl text-lg text-white/85">
              È separato dal denaro che usi in gioco: le due monete non si mescolano. Come ottenerlo e cosa puoi acquistare lo spiegheremo qui all&apos;apertura dello store.
            </p>
            <div className="mt-7">
              {siteConfig.links.store ? (
                <Btn href={siteConfig.links.store} external variant="light">vai allo store</Btn>
              ) : (
                <span className="inline-block rounded-xl bg-white px-5 py-3 text-sm font-extrabold uppercase tracking-[0.06em] text-black">store in arrivo</span>
              )}
            </div>
          </div>
          <div className="mx-auto w-full max-w-xl self-end lg:justify-self-end" data-reveal="right" data-delay="0.15">
            <Image src="/images/legionario-tesoro.png" alt="Un legionario di TiberiusMC apre un forziere pieno di Goldoni e gemme" width={1000} height={785} className="block w-full" unoptimized />
          </div>
        </div>
      </section>

      {/* COMMUNITY: subito sotto il Goldone, nei colori di Discord e a specchio (immagine a sinistra) */}
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,#1b1d4f_0%,#3a3fb0_55%,#5865f2_100%)]">
        <div aria-hidden className="absolute inset-x-0 bottom-0 z-10 h-5 border-t-2 border-[#8c96ff]/40 bg-[#14163d]" />
        <div className="wrap grid items-end gap-4 lg:min-h-[30rem] lg:grid-cols-[1.2fr_1fr] lg:gap-10">
          <div className="self-center pt-14 lg:order-2 lg:py-16" data-reveal="right">
            <div className="flex items-center gap-3">
              <DiscordIcon className="size-8 text-white" />
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#c9cdff]">community</span>
            </div>
            <h2 className="mt-4 text-[length:var(--step-head)]">Intorno al fuoco.</h2>
            <p className="mt-4 max-w-xl text-lg text-white/85">
              Annunci, eventi e due chiacchiere con lo staff. Ci trovi su Discord e su Telegram.
            </p>
            <div className="mt-4 min-h-5">
              <DiscordCount invite={siteConfig.links.discord} className="text-white/90" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Btn href={siteConfig.links.discord} external variant="light">
                <DiscordIcon className="size-5" /> Entra su Discord
              </Btn>
              <Btn href={siteConfig.links.telegram} external variant="telegram">
                <TelegramIcon className="size-5" /> Entra su Telegram
              </Btn>
            </div>
          </div>
          <div className="mx-auto w-full max-w-3xl self-end pt-8 lg:order-1 lg:justify-self-start" data-reveal="left" data-delay="0.15">
            <Image src="/images/legionari-fuoco.webp" alt="Cinque legionari di TiberiusMC che chiacchierano intorno a un fuoco da campo" width={1300} height={640} className="block w-full" unoptimized />
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
