import Image from "next/image";
import { Words } from "@/components/ui/Words";

/** Testata di pagina interna: titolo gigante, frase, e un'immagine ad arco. */
export function PageHead({
  kicker,
  title,
  lead,
  art,
  tone = "paper",
}: {
  kicker: string;
  title: string;
  lead: string;
  art: string;
  tone?: "paper" | "field" | "accent";
}) {
  const bg = tone === "field" ? "on-field" : tone === "accent" ? "on-accent" : "";
  return (
    <section className={`${bg} wrap pb-20 pt-[calc(var(--header-h)+56px)]`}>
      <div className="grid items-end gap-12 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <p className="mb-6 font-semibold opacity-70" data-fade>{kicker}</p>
          <h1 className="text-[length:var(--step-display)]">
            <Words text={title} mode="hero" />
          </h1>
          <p className="mt-8 max-w-xl text-[length:var(--step-lead)] leading-snug hero-in" data-hero-in>
            {lead}
          </p>
        </div>
        <div className="arch aspect-[4/5] w-full max-w-md justify-self-end bg-surface" data-reveal>
          <Image src={art} alt="" width={900} height={1125} className="size-full object-cover" unoptimized />
        </div>
      </div>
    </section>
  );
}
