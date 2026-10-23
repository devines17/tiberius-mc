/** Fascia a scorrimento. Il contenuto è ripetuto due volte per il giro continuo. */
export function Ticker({ items, className = "" }: { items: string[]; className?: string }) {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === "b"}>
      {items.map((t, i) => (
        <span key={i} className="flex items-center gap-8 pr-8 text-[clamp(1.1rem,1.8vw,1.5rem)] font-semibold tracking-tight">
          {t}
          <span className="size-3 shrink-0 rounded-full bg-current" />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`ticker overflow-hidden ${className}`}>
      <div className="ticker-track">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
