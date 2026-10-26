import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CountUp } from "./motion";

const order = (i?: number) => (i === undefined ? undefined : ({ "--i": i } as CSSProperties));

/** Titolo di una pagina del gestionale (la panoramica usa la testata). */
export function PanelHead({ title, sub, children }: { title: ReactNode; sub?: string; children?: ReactNode }) {
  return (
    <div className="gx-in mb-6 flex flex-wrap items-end justify-between gap-4" style={order(0)}>
      <div className="min-w-0">
        <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold uppercase leading-none">{title}</h2>
        {sub && <p className="mt-2 text-sm text-white/55">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/** Riquadro grande con un numero che sale. */
export function StatCard({
  icon: Icon,
  label,
  value,
  num,
  kind = "int",
  tone,
  i,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  num?: number;
  kind?: "money" | "int";
  tone: string;
  i?: number;
}) {
  return (
    <div className="gx-card gx-spot gx-stat gx-in" style={{ ...order(i), ["--t" as string]: tone }}>
      <span className="gx-stat-icon">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-white/50">{label}</p>
      <p className="mt-1 truncate text-[clamp(1.4rem,2.4vw,1.85rem)] font-extrabold leading-tight">{typeof num === "number" ? <CountUp value={num} kind={kind} /> : value}</p>
    </div>
  );
}

/** Sezione con titolo e linea che si allunga. */
export function Section({ icon, title, sub, tone, children, i }: { icon: LucideIcon; title: string; sub: string; tone: string; children: ReactNode; i?: number }) {
  return (
    <section className="grid gap-4">
      <SectionTitle icon={icon} title={title} sub={sub} tone={tone} i={i} />
      {children}
    </section>
  );
}

export function SectionTitle({ icon: Icon, title, sub, tone, i }: { icon: LucideIcon; title: string; sub: string; tone: string; i?: number }) {
  return (
    <div className="gx-in flex items-center gap-3" style={{ ...order(i), ["--t" as string]: tone }}>
      <span className="gx-sec-icon">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div>
        <h3 className="text-[1.05rem] font-extrabold uppercase leading-none tracking-wide">{title}</h3>
        <p className="mt-1 text-xs text-white/50">{sub}</p>
      </div>
      <span className="gx-sec-line" aria-hidden />
    </div>
  );
}

/** Riquadro con titolo; a destra del titolo ci può stare altro. */
export function Card({ icon: Icon, title, tone = "#ffffff", right, children, className = "", i }: { icon: LucideIcon; title: string; tone?: string; right?: ReactNode; children: ReactNode; className?: string; i?: number }) {
  return (
    <section className={`gx-card gx-spot gx-in p-5 ${className}`} style={{ ...order(i), ["--t" as string]: tone }}>
      <div className="relative mb-4 flex items-center justify-between gap-3">
        <h4 className="flex items-center gap-2.5 font-bold">
          <span className="gx-card-icon">
            <Icon className="size-4" aria-hidden />
          </span>
          {title}
        </h4>
        {right}
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}

/** Valore piccolo dentro un riquadro. */
export function Stat({ icon: Icon, label, value, tone = "#ffffff99" }: { icon: LucideIcon; label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="gx-mini">
      <p className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wider text-white/45">
        <Icon className="size-3.5" style={{ color: tone }} aria-hidden />
        {label}
      </p>
      <p className="mt-1.5 truncate text-[1.05rem] font-bold">{value}</p>
    </div>
  );
}

/** Stato vuoto. */
export function Empty({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="grid place-items-center gap-1 py-8 text-center">
      <span className="gx-empty-icon">
        <Icon className="size-6" aria-hidden />
      </span>
      <p className="mt-2 font-bold">{title}</p>
      <p className="max-w-xs text-sm text-white/45">{text}</p>
    </div>
  );
}
