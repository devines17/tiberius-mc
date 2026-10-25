import { fmtMoney } from "@/lib/gestionale/data";

/** Andamento del saldo (un punto al giorno). Senza dati mostra la griglia vuota. */
export function BalanceChart({ points }: { points: { day: string; balance: number }[] }) {
  const W = 600;
  const H = 180;
  const grid = [0, 1, 2, 3, 4].map((i) => (H / 4) * i);
  if (points.length < 2) {
    return (
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full" preserveAspectRatio="none" aria-hidden>
          {grid.map((y) => (
            <line key={y} x1="0" x2={W} y1={y + 0.5} y2={y + 0.5} stroke="rgb(255 255 255 / 0.06)" />
          ))}
        </svg>
        <p className="absolute inset-0 grid place-items-center text-sm text-white/40">Ancora nessun dato da mostrare</p>
      </div>
    );
  }
  const vals = points.map((p) => p.balance);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const x = (i: number) => (i / (points.length - 1)) * W;
  const y = (v: number) => H - 8 - ((v - min) / span) * (H - 16);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.balance).toFixed(1)}`).join(" ");
  const up = vals[vals.length - 1] >= vals[0];
  const color = up ? "#34d399" : "#ff6b5e";
  const fmt = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short" });
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full" preserveAspectRatio="none" role="img" aria-label={`Saldo da ${fmtMoney(vals[0])} a ${fmtMoney(vals[vals.length - 1])}`}>
        {grid.map((g) => (
          <line key={g} x1="0" x2={W} y1={g + 0.5} y2={g + 0.5} stroke="rgb(255 255 255 / 0.06)" />
        ))}
        <path d={`${line} L${W},${H} L0,${H} Z`} fill={color} opacity="0.12" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
      <div className="mt-1 flex justify-between text-[0.72rem] text-white/45">
        <span>{fmt.format(new Date(points[0].day))}</span>
        <span>{fmt.format(new Date(points[points.length - 1].day))}</span>
      </div>
    </div>
  );
}
