import Link from "next/link";
import { ChevronDown, Pickaxe, Swords } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { TiberiusLogo } from "@/components/TiberiusLogo";
import { CopyIp } from "@/components/CopyIp";
import { Column } from "@/components/ui";

export function Hero() {
  const { ip, version } = siteConfig.server;

  return (
    <section className="relative isolate overflow-hidden">
      {/* Colonne decorative */}
      <Column className="absolute -left-4 top-10 hidden h-[34rem] text-gold opacity-[0.13] lg:block xl:left-12" />
      <Column className="absolute -right-4 top-10 hidden h-[34rem] text-gold opacity-[0.13] lg:block xl:right-12" />

      {/* Arco e bagliore dietro il logo */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-6 -z-10 h-[30rem] w-[min(46rem,92vw)] -translate-x-1/2 rounded-t-[999px] border border-b-0 border-gold/25 bg-gradient-to-b from-gold/[0.09] via-gold/[0.03] to-transparent [mask-image:linear-gradient(to_bottom,black_45%,transparent_95%)] sm:top-2"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-24 -z-10 size-[28rem] -translate-x-1/2 rounded-full bg-imperial/20 blur-[110px]"
      />

      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-6 pt-10 text-center sm:px-6 sm:pt-14 lg:pb-8">
        <div className="animate-rise">
          <div className="animate-float">
            <TiberiusLogo variant="hero" priority className="drop-shadow-[0_20px_40px_rgb(0_0_0/0.6)]" />
          </div>
        </div>

        <p
          className="animate-rise mt-8 font-display text-xs font-semibold uppercase tracking-[0.34em] text-gold sm:text-sm"
          style={{ animationDelay: "0.1s" }}
        >
          Survival Towny · Minecraft Java
        </p>

        <h1
          className="animate-rise mt-4 font-display text-[1.5rem] font-black uppercase leading-[1.12] tracking-normal min-[420px]:text-3xl sm:text-5xl sm:tracking-wide lg:text-6xl"
          style={{ animationDelay: "0.18s" }}
        >
          <span className="text-gold-gradient">Fonda una città.</span>
          <br />
          <span className="text-ivory">Guida una nazione.</span>
          <br />
          <span className="text-ivory">Scrivi la storia.</span>
        </h1>

        <p
          className="animate-rise mt-6 max-w-2xl text-base leading-relaxed text-stone sm:text-lg"
          style={{ animationDelay: "0.26s" }}
        >
          Tiberius MC è un impero romano costruito a blocchi: città e nazioni in competizione, un&apos;economia viva,
          alleanze e tradimenti, guerre e battaglie PvP. Qui ogni decisione entra nella storia del server.
        </p>

        <div
          className="animate-rise mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
          style={{ animationDelay: "0.34s" }}
        >
          <Link
            href="#entra"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-gold/60 bg-gradient-to-b from-gold-bright to-gold px-7 py-3.5 font-display text-sm font-bold uppercase tracking-[0.16em] text-obsidian shadow-[0_12px_32px_-12px_rgb(201_162_75/0.8)] transition hover:brightness-110"
          >
            <Pickaxe className="size-4" aria-hidden="true" />
            Entra nel server
          </Link>
          <Link
            href="#caratteristiche"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-gold/35 px-7 py-3.5 font-display text-sm font-bold uppercase tracking-[0.16em] text-ivory transition-colors hover:border-gold/70 hover:bg-gold/10"
          >
            <Swords className="size-4 text-gold" aria-hidden="true" />
            Scopri l&apos;impero
          </Link>
        </div>

        <div className="animate-rise mt-10 w-full max-w-md" style={{ animationDelay: "0.42s" }}>
          <CopyIp ip={ip} />
          <p className="mt-3 text-sm text-stone-dim">
            {version ? `Minecraft Java Edition ${version}` : "Minecraft Java Edition · versione in arrivo"}
          </p>
        </div>

        <Link
          href="#caratteristiche"
          aria-label="Scorri alla sezione successiva"
          className="mt-10 text-gold/70 transition-colors hover:text-gold-bright"
        >
          <ChevronDown className="size-7 animate-bounce motion-reduce:animate-none" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
