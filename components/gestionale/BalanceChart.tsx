import { fmtMoney } from "@/lib/gestionale/data";

/** Andamento del saldo (un punto al giorno): la linea si disegna entrando. Senza dati, griglia con una scansione. */
export function BalanceChart({ points }: { points: { day: string; balance: number }[] }) {
  const W = 600;
  const H = 180;
  const grid = [0, 1, 2, 3, 4].map((i) => (H / 4) * i);
  const lines = grid.map((g) => <line key={g} x1="0" x2={W} y1={g + 0.5} y2={g + 0.5} stroke="rgb(255 255 255 / 0.06)" strokeDasharray="4 6" />);
  if (points.length < 2) {
    return (
      <div className="gx-chart-empty relative overflow-hidden rounded-xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full" preserveAspectRatio="none" aria-hidden>
          {lines}
          <path d="M0,140 C80,120 120,150 200,110 S320,60 400,90 S520,40 600,55" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeDasharray="6 8" />
        </svg>
        <p className="absolute inset-0 grid place-items-center text-sm text-white/45">Il grafico si riempirà con i tuoi movimenti</p>
      </div>
    );
  }
  const vals = points.map((p) => p.balance);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const x = (i: number) => (i / (points.length - 1)) * W;
  const y = (v: number) => H - 10 - ((v - min) / span) * (H - 20);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.balance).toFixed(1)}`).join(" ");
  const up = vals[vals.length - 1] >= vals[0];
  const color = up ? "#34d399" : "#ff6b5e";
  const fmt = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short" });
  const id = `g${up ? "u" : "d"}`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full overflow-visible" preserveAspectRatio="none" role="img" aria-label={`Saldo da ${fmtMoney(vals[0])} a ${fmtMoney(vals[vals.length - 1])}`}>
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.35" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {lines}
        <path className="gx-chart-area" d={`${line} L${W},${H} L0,${H} Z`} fill={`url(#${id})`} />
        <path className="gx-chart-line" d={line} pathLength={1} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="mt-1 flex justify-between text-[0.72rem] text-white/45">
        <span>{fmt.format(new Date(points[0].day))}</span>
        <span>{fmt.format(new Date(points[points.length - 1].day))}</span>
      </div>
    </div>
  );
}
