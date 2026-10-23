import Image from "next/image";
import { Words } from "@/components/ui/Words";

/** Testata delle pagine del forum: sfondo della città al tramonto e il legionario a destra. */
export function ForumHero({ kicker, title, lead }: { kicker: string; title: string; lead: string }) {
  return (
    <section className="relative isolate overflow-hidden">
      <Image src="/images/forum-bg.jpg" alt="" fill priority sizes="100vw" className="kenburns -z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-b from-transparent to-[#0b0a0c]" />

      <Image
        src="/images/forum-gladiatore.webp"
        alt=""
        width={722}
        height={1075}
        priority
        unoptimized
        className="hero-in pointer-events-none absolute bottom-0 right-0 hidden h-[94%] w-auto select-none drop-shadow-[0_20px_40px_rgba(0,0,0,.45)] [mask-image:linear-gradient(to_right,#000_82%,transparent)] md:block lg:left-[calc(50%+7rem)] lg:right-auto"
        data-hero-in
      />

      <div className="wrap relative flex min-h-[360px] items-center py-16 md:min-h-[460px] lg:min-h-[520px]">
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
