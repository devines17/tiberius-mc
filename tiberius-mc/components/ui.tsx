import type { LucideIcon } from "lucide-react";

/** Fregio a dentelli: separatore decorativo ispirato alle cornici romane. */
export function Dentil({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`dentil ${className}`} />;
}

/** Divisore con losanga dorata al centro. */
export function OrnamentDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/70 sm:w-28" />
      <span className="size-2 rotate-45 border border-gold bg-gold/30" />
      <span className="size-1.5 rotate-45 bg-gold" />
      <span className="size-2 rotate-45 border border-gold bg-gold/30" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/70 sm:w-28" />
    </div>
  );
}

/** Colonna romana stilizzata, usata come decorazione a bassa opacità. */
export function Column({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 420"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      {/* capitello */}
      <rect x="6" y="6" width="68" height="14" rx="2" />
      <path d="M12 20c0 14 8 22 28 22s28-8 28-22" />
      <path d="M14 34c-8 0-12-6-8-12M66 34c8 0 12-6 8-12" />
      {/* fusto con scanalature */}
      <path d="M16 46h48l-3 322H19z" />
      {[26, 33, 40, 47, 54].map((x) => (
        <path key={x} d={`M${x} 50V364`} strokeOpacity="0.55" />
      ))}
      {/* base */}
      <rect x="10" y="368" width="60" height="12" rx="2" />
      <rect x="4" y="382" width="72" height="16" rx="2" />
      <rect x="0" y="400" width="80" height="16" rx="2" />
    </svg>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  const alignment = align === "center" ? "mx-auto text-center" : "text-left";
  return (
    <div className={`max-w-3xl ${alignment}`}>
      <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-gold">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-bold uppercase leading-tight tracking-wide text-ivory sm:text-4xl lg:text-[2.6rem]">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-stone sm:text-lg">{description}</p>}
    </div>
  );
}

/** Stato vuoto: mai dati finti, solo un messaggio onesto e ben progettato. */
export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-4 px-6 py-12 text-center sm:px-10">
      <span className="flex size-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold-bright">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="font-display text-xl font-bold uppercase tracking-wide text-ivory">{title}</h3>
      <p className="max-w-xl text-stone">{children}</p>
      {action}
    </div>
  );
}
