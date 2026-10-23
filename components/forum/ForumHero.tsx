import Image from "next/image";
import { Words } from "@/components/ui/Words";

const ART = {
  // Legionario pensieroso: mantello tagliato a destra, sfumato
  forum: { src: "/images/forum-gladiatore.webp", w: 722, h: 1075, cls: "[mask-image:linear-gradient(to_right,#000_82%,transparent)] md:block" },
  // Legionario a mani sui fianchi
  staff: { src: "/images/staff-legionario-fermo-v2.webp", w: 549, h: 1049, cls: "md:block" },
} as const;

/** Testata con lo sfondo della città al tramonto e un legionario a destra (forum, staff). */
export function ForumHero({ kicker, title, lead, art = "forum" }: { kicker: string; title: string; lead: string; art?: keyof typeof ART }) {
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
        className={`hero-in pointer-events-none absolute bottom-0 right-0 hidden h-[94%] w-auto select-none lg:left-[calc(50%+7rem)] lg:right-auto ${a.cls}`}
        data-hero-in
      />

      <div className="wrap relative flex min-h-[360px] items-center py-16 md:min-h-[480px] lg:min-h-[600px]">
        <div className="max-w-xl text-white md:max-w-[52%]">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 hero-in" data-hero-in>
            {kicker}
          </p>
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
