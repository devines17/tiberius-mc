import Image from "next/image";
import Link from "next/link";
import { Words } from "@/components/ui/Words";
import { Btn } from "@/components/ui/Btn";
import { CopyIp } from "@/components/ui/CopyIp";
import { Ticker } from "@/components/ui/Ticker";
import { TiberiusLogo } from "@/components/TiberiusLogo";
import { HeroIntro } from "@/components/motion/HeroIntro";
import { pages, siteConfig } from "@/lib/site-config";

const steps = [
  { n: "01", t: "fondi una città", d: "Parti da un villaggio. Reclama il terreno, costruisci, invita altri cittadini.", art: "/images/art/village.png" },
  { n: "02", t: "cresci in nazione", d: "Più città si uniscono sotto una sola bandiera, con un governo e una storia.", art: "/images/art/town.png" },
  { n: "03", t: "governa l'impero", d: "Alleanze, trattati, rivalità: la diplomazia decide chi regna.", art: "/images/art/empire.png" },
  { n: "04", t: "vai in guerra", d: "Quando le parole finiscono, assedia. Le guerre si combattono sul campo.", art: "/images/art/siege.png" },
];

export default function Home() {
  return (
    <>
      <HeroIntro />
      <section className="relative overflow-hidden pt-[calc(var(--header-h)+24px)]">
        <div className="wrap grid items-end gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="pb-16 lg:pb-24">
            <p className="mb-6 font-semibold text-muted" data-fade>server minecraft java · survival towny</p>
            <h1 className="text-[length:var(--step-display)]">
              <Words text={"minecraft,\nma romano."} mode="hero" />
            </h1>
            <p className="mt-8 max-w-xl text-[length:var(--step-lead)] leading-snug hero-in" data-hero-in>
              Fonda una città, forma una nazione, scrivi la storia dell&apos;impero. Un solo mondo, tante ambizioni.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3 hero-in" data-hero-in>
              <CopyIp ip={siteConfig.server.ip} tone="light" />
              <Btn href="/entra" variant="accent">come entrare</Btn>
            </div>
          </div>
          <div data-hero-arch className="relative mx-auto aspect-[4/5] w-full max-w-lg self-end">
            <div className="arch absolute inset-0 bg-accent" />
            <div data-float className="absolute inset-x-[10%] top-[16%]">
              <TiberiusLogo variant="fluid" className="w-full" priority />
            </div>
          </div>
        </div>
      </section>

      <Ticker className="on-field py-6" items={["città", "nazioni", "guerre", "diplomazia", "goldoni", "impero"]} />

      <section className="wrap section">
        <Words
          as="p"
          mode="scrub"
          className="max-w-5xl text-[length:var(--step-head)] font-bold lowercase leading-[0.98] tracking-tighter"
          text="Tiberius MC è un server Towny dove ogni città ha una storia, ogni confine un prezzo e ogni alleanza può spezzarsi."
        />
      </section>

      <section className="on-surface section">
        <div className="wrap">
          <h2 className="mb-16 text-[length:var(--step-head)]">
            <Words text="come si gioca" />
          </h2>
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

      <section className="wrap section">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div className="relative mx-auto w-full max-w-sm">
            <Image src="/images/art/goldone.png" alt="Il Goldone, moneta premium di Tiberius MC" width={640} height={640} className="coin-spin w-full" unoptimized />
          </div>
          <div>
            <h2 className="text-[length:var(--step-head)]">
              <Words text="il goldone" />
            </h2>
            <p className="mt-6 max-w-xl text-[length:var(--step-lead)] leading-snug" data-reveal>
              Il Goldone è la moneta premium del server. Non è la valuta di gioco: vive a parte, e le sue regole saranno spiegate qui.
            </p>
            <div className="mt-8" data-reveal>
              <Btn href="/news" variant="ink">novità</Btn>
            </div>
          </div>
        </div>
      </section>

      <section className="on-field section">
        <div className="wrap">
          <h2 className="mb-14 text-[length:var(--step-head)]">
            <Words text="esplora l'impero" />
          </h2>
          <ul className="border-t border-white/20" data-stagger="0.07">
            {pages.map((p, i) => (
              <li key={p.href} className="border-b border-white/20">
                <Link href={p.href} className="group flex items-baseline justify-between gap-6 py-6 transition-colors hover:text-accent">
                  <span className="flex items-baseline gap-6 text-[clamp(2rem,6vw,4.5rem)] font-bold lowercase leading-none tracking-tighter">
                    <span className="text-base font-semibold text-white/40">{String(i + 1).padStart(2, "0")}</span>
                    {p.label}
                  </span>
                  <span aria-hidden className="text-3xl transition-transform group-hover:translate-x-2">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="on-accent section">
        <div className="wrap grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <h2 className="text-[length:var(--step-display)]">
            <Words text={"entra nel\nnostro discord."} />
          </h2>
          <div className="grid gap-6">
            <p className="text-[length:var(--step-lead)] leading-snug" data-reveal>
              Annunci, supporto, eventi e il collegamento del tuo account Minecraft ai gestionali privati. Ci trovi anche su Telegram {siteConfig.links.telegramHandle}.
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
