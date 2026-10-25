import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/** Titolo grande della pagina del gestionale, centrato. */
export function PortalTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <header className="pb-10 pt-12 text-center md:pt-16">
      <h1 className="portal-title text-[clamp(2.2rem,6vw,4.2rem)] font-extrabold uppercase leading-none">{title}</h1>
      <p className="mt-4 text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-white/50">{sub}</p>
      <div className="mx-auto mt-5 flex w-24 items-center gap-2" aria-hidden>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" />
        <span className="size-1.5 rounded-full bg-gold" />
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" />
      </div>
    </header>
  );
}

/** Intestazione di una sezione: icona colorata, titolo maiuscolo, sottotitolo e una linea. */
export function SectionHead({ icon: Icon, title, sub, tone = "#ffc94d" }: { icon: LucideIcon; title: string; sub: string; tone?: string }) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl" style={{ background: `${tone}1f`, color: tone, boxShadow: `inset 0 0 0 1px ${tone}40` }}>
        <Icon className="size-6" aria-hidden />
      </span>
      <div>
        <h2 className="text-2xl font-extrabold uppercase leading-none">{title}</h2>
        <p className="mt-1 text-sm text-white/50">{sub}</p>
      </div>
      <span className="ml-2 hidden h-px flex-1 bg-gradient-to-r from-white/15 to-transparent sm:block" aria-hidden />
    </div>
  );
}

/** Riquadro con titolo e icona. */
export function Card({ icon: Icon, title, tone = "#ffc94d", children, className = "" }: { icon: LucideIcon; title: string; tone?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`portal-card p-5 ${className}`}>
      <h3 className="mb-4 flex items-center gap-3 text-lg font-bold">
        <span className="grid size-10 place-items-center rounded-lg" style={{ background: `${tone}1f`, color: tone }}>
          <Icon className="size-5" aria-hidden />
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Piccolo riquadro con un valore. */
export function Stat({ icon: Icon, label, value, tone = "#ffffff" }: { icon: LucideIcon; label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="portal-stat">
      <p className="flex items-center gap-2 text-[0.8rem] text-white/55">
        <span className="grid size-6 place-items-center rounded-md bg-white/[0.06]" style={{ color: tone }}>
          <Icon className="size-3.5" aria-hidden />
        </span>
        {label}
      </p>
      <p className="mt-2 truncate text-lg font-bold">{value}</p>
    </div>
  );
}

/** Stato vuoto dentro un riquadro. */
export function Empty({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="grid place-items-center gap-1 py-8 text-center">
      <Icon className="mb-1 size-8 text-white/25" aria-hidden />
      <p className="font-bold">{title}</p>
      <p className="max-w-xs text-sm text-white/45">{text}</p>
    </div>
  );
}
