import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CountUp } from "./motion";

/** Titolo di una pagina del gestionale (la panoramica usa la testata). */
export function PanelHead({ title, sub }: { title: ReactNode; sub?: string }) {
  return (
    <div className="gx-in mb-5">
      <h2 className="text-2xl font-bold">{title}</h2>
      {sub && <p className="mt-1 text-sm text-white/55">{sub}</p>}
    </div>
  );
}

/** Riquadro con un numero. */
export function StatCard({ icon: Icon, label, value, num, kind = "int" }: { icon: LucideIcon; label: string; value: ReactNode; num?: number; kind?: "money" | "int"; tone?: string; i?: number }) {
  return (
    <div className="fbox gx-in px-4 py-3.5">
      <p className="flex items-center gap-1.5 text-sm text-white/55">
        <Icon className="size-4 text-white/40" aria-hidden />
        {label}
      </p>
      <p className="mt-1 truncate text-2xl font-bold">{typeof num === "number" ? <CountUp value={num} kind={kind} /> : value}</p>
    </div>
  );
}

/** Sezione con la barra del titolo, come nel forum. */
export function Section({ title, children, tz }: { icon?: LucideIcon; title: string; sub?: string; tone?: string; children: ReactNode; i?: number; tz?: string }) {
  return (
    <section className="grid gap-2" data-tz={tz}>
      <SectionTitle title={title} />
      {children}
    </section>
  );
}

export function SectionTitle({ title }: { icon?: LucideIcon; title: string; sub?: string; tone?: string; i?: number }) {
  return <h3 className="fcat-head gx-in">{title}</h3>;
}

/** Riquadro con titolo; a destra del titolo ci può stare altro. */
export function Card({ icon: Icon, title, right, children, className = "" }: { icon: LucideIcon; title: string; tone?: string; right?: ReactNode; children: ReactNode; className?: string; i?: number }) {
  return (
    <section className={`fbox gx-in ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-2.5">
        <h4 className="flex items-center gap-2 text-[0.95rem] font-semibold">
          <Icon className="size-4 text-white/40" aria-hidden />
          {title}
        </h4>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

/** Valore piccolo dentro un riquadro. */
export function Stat({ label, value }: { icon?: LucideIcon; label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="rounded-md bg-black/25 px-3 py-2.5">
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-0.5 truncate font-semibold">{value}</p>
    </div>
  );
}

/** Stato vuoto. */
export function Empty({ title, text }: { icon?: LucideIcon; title: string; text: string }) {
  return (
    <div className="py-6 text-center">
      <p className="font-semibold text-white/80">{title}</p>
      <p className="mt-0.5 text-sm text-white/45">{text}</p>
    </div>
  );
}
