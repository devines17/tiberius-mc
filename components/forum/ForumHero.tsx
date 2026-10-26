import Image from "next/image";
import { Words } from "@/components/ui/Words";

const ART = {
  // Legionario pensieroso, mantello intero
  forum: { src: "/images/forum-gladiatore-v3.webp", w: 867, h: 1314, cls: "md:block lg:left-[calc(50%+7rem)] lg:right-auto" },
  // Due legionari abbracciati: larghi, solo da schermi grandi
  staff: { src: "/images/staff-legionari-v2.webp", w: 961, h: 801, cls: "lg:block lg:!h-[78%] lg:right-6 xl:!h-[88%] 2xl:!h-[94%] 2xl:left-[calc(50%+3rem)] 2xl:right-auto" },
  // Legionario che legge la pergamena (regolamento)
  regole: { src: "/images/regole-legionario.webp", w: 719, h: 821, cls: "lg:block lg:!h-[80%] lg:right-6 2xl:!h-[94%] 2xl:left-[calc(50%+7rem)] 2xl:right-auto" },
  // Banditore sul podio che annuncia le novità (news)
  news: { src: "/images/news-banditore.webp", w: 818, h: 1400, cls: "md:block lg:right-10 2xl:left-[calc(50%+9rem)] 2xl:right-auto" },
  // Gladiatore col pollice in su e il sacchetto di Goldoni (vota)
  vota: { src: "/images/vota-gladiatore-v2.webp", w: 897, h: 1224, cls: "md:block lg:left-[calc(50%+7rem)] lg:right-auto" },
} as const;

/** Testata con lo sfondo della città al tramonto e un legionario a destra (forum, staff, regole). */
/** full: occupa tutta l'altezza dello schermo, così il contenuto sotto compare solo scorrendo. */
export function ForumHero({ title, lead, art = "forum", full = false }: { kicker?: string; title: string; lead: string; art?: keyof typeof ART; full?: boolean }) {
  const a = ART[art];
  return (
    <section className="relative isolate overflow-hidden">
      <Image src="/images/forum-bg.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[center_35%]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-b from-transparent to-[#0b0a0c]" />

      <Image
        src={a.src}
        alt=""
        width={a.w}
        height={a.h}
        priority
        unoptimized
        className={`hero-in pointer-events-none absolute bottom-0 right-0 hidden h-[94%] w-auto select-none ${a.cls}`}
        data-hero-in
      />

      <div className={`wrap relative flex min-h-[360px] items-center py-16 ${full ? "md:min-h-[max(480px,calc(100svh-var(--header-h)))]" : "md:min-h-[480px] lg:min-h-[600px]"}`}>
        <div className="max-w-xl text-white md:max-w-[52%]">
          <h1 className="text-[length:var(--step-display)] drop-shadow-[0_6px_30px_rgba(0,0,0,.5)]">
            <Words text={title} mode="hero" />
          </h1>
          <p className="mt-6 max-w-lg text-[length:var(--step-lead)] leading-snug text-white/90 hero-in" data-hero-in>
            {lead}
          </p>
        </div>
      </div>
    </section>
  );
}
