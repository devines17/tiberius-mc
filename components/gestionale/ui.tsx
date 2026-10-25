import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/** Testa del pannello principale: titolo a sinistra, eventuali chip a destra. */
export function PanelHead({ title, sub, children }: { title: ReactNode; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[1.6rem] font-bold leading-tight">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-white/55">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/** Riquadro con un numero grande. */
export function StatCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: ReactNode; tone: string }) {
  return (
    <div className="gest-tile">
      <p className="flex items-center gap-1.5 text-[0.8rem] text-white/60">
        <Icon className="size-4" style={{ color: tone }} aria-hidden />
        {label}
      </p>
      <p className="mt-1 truncate text-[1.55rem] font-bold leading-tight">{value}</p>
    </div>
  );
}

/** Intestazione di sezione: icona in un riquadro colorato, titolo, sottotitolo e una linea. */
export function Section({ icon, title, sub, tone, children }: { icon: LucideIcon; title: string; sub: string; tone: string; children: ReactNode }) {
  return (
    <section className="grid gap-4">
      <SectionTitle icon={icon} title={title} sub={sub} tone={tone} />
      {children}
    </section>
  );
}

export function SectionTitle({ icon: Icon, title, sub, tone }: { icon: LucideIcon; title: string; sub: string; tone: string }) {
  return (
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg" style={{ background: `${tone}26`, color: tone }}>
          <Icon className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-bold uppercase leading-none">{title}</h2>
          <p className="mt-1 text-xs text-white/50">{sub}</p>
        </div>
        <span className="ml-3 h-px flex-1 bg-white/10" aria-hidden />
      </div>
  );
}

/** Riquadro con titolo; a destra del titolo ci può stare altro (filtri, link). */
export function Card({ icon: Icon, title, tone = "#ffffff", right, children, className = "" }: { icon: LucideIcon; title: string; tone?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`gest-tile !p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-semibold">
          <Icon className="size-4" style={{ color: tone }} aria-hidden />
          {title}
        </h3>
        {right}
      </div>
      {children}
    </section>
  );
}

/** Valore piccolo dentro un riquadro. */
export function Stat({ icon: Icon, label, value, tone = "#ffffff99" }: { icon: LucideIcon; label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="gest-mini">
      <p className="flex items-center gap-1.5 text-[0.75rem] text-white/55">
        <Icon className="size-3.5" style={{ color: tone }} aria-hidden />
        {label}
      </p>
      <p className="mt-1 truncate font-bold">{value}</p>
    </div>
  );
}

/** Stato vuoto. */
export function Empty({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="grid place-items-center gap-1 py-8 text-center">
      <Icon className="mb-1 size-8 text-white/25" aria-hidden />
      <p className="font-semibold">{title}</p>
      <p className="max-w-xs text-sm text-white/45">{text}</p>
    </div>
  );
}
