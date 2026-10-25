import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
export const roman = (n: number) => ROMAN[n - 1] ?? String(n);

/** Intestazione di una sezione: numero romano, titolo inciso e sottotitolo. */
export function SectionHead({ n, title, sub }: { n: number; title: string; sub?: string }) {
  return (
    <div className="mb-4 flex items-end gap-3">
      <span className="portal-num" aria-hidden>
        {roman(n)}
      </span>
      <div className="min-w-0">
        <h2 className="portal-engraved text-[1.35rem] leading-none md:text-[1.6rem]">{title}</h2>
        {sub && <p className="mt-1 text-[0.85rem] text-white/50">{sub}</p>}
      </div>
      <span className="portal-rule mb-2 ml-2 hidden flex-1 sm:block" aria-hidden />
    </div>
  );
}

/** Tavola: riquadro con bordo superiore colorato e titolo inciso. */
export function Card({ icon: Icon, title, tone = "#ffc94d", children, className = "" }: { icon: LucideIcon; title: string; tone?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`portal-card ${className}`} style={{ ["--t" as string]: tone }}>
      <h3 className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-3 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-white/70">
        <Icon className="size-4" style={{ color: tone }} aria-hidden />
        {title}
      </h3>
      <div className="p-4 md:p-5">{children}</div>
    </section>
  );
}

/** Targhetta con un valore. */
export function Stat({ icon: Icon, img, label, value, tone = "#ffffff" }: { icon?: LucideIcon; img?: string; label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="portal-stat" style={{ ["--t" as string]: tone }}>
      <p className="flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white/45">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img ? <img src={img} alt="" width={14} height={14} className="size-3.5 object-contain" /> : Icon ? <Icon className="size-3.5" style={{ color: tone }} aria-hidden /> : null}
        {label}
      </p>
      <p className="portal-value mt-1.5 truncate">{value}</p>
    </div>
  );
}

/** Stato vuoto dentro un riquadro. */
export function Empty({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="grid place-items-center gap-1 py-8 text-center">
      <Icon className="mb-1 size-8 text-white/20" aria-hidden />
      <p className="font-bold">{title}</p>
      <p className="max-w-xs text-sm text-white/45">{text}</p>
    </div>
  );
}
