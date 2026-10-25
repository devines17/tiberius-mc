import { imageUrl, type Town } from "@/lib/server/towns";
import { PROJECT_STATUS, ROLE_LABEL, type ProjectStatus, type TownRole } from "@/lib/gestionale/config";

/** Stemma della città, o l'iniziale su uno scudo se non è stato caricato. */
export function TownEmblem({ town, size = 64 }: { town: Pick<Town, "name" | "emblem_path">; size?: number }) {
  const src = imageUrl(town.emblem_path);
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={`Stemma di ${town.name}`} width={size} height={size} className="shrink-0 rounded-lg object-contain" style={{ width: size, height: size }} />
    );
  }
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-lg bg-[#8f1d14] font-extrabold text-white"
      style={{ width: size, height: size, fontSize: size * 0.45, clipPath: "polygon(0 0,100% 0,100% 62%,50% 100%,0 62%)" }}
    >
      {town.name.charAt(0).toUpperCase()}
    </span>
  );
}

export function RoleBadge({ role }: { role: TownRole }) {
  const cls = role === "sindaco" ? "bg-accent text-white" : role === "assistente" ? "bg-gold/20 text-gold" : "bg-white/10 text-white/70";
  return <span className={`rounded px-1.5 py-0.5 text-[0.7rem] font-bold uppercase ${cls}`}>{ROLE_LABEL[role]}</span>;
}

export function ProjectBadge({ status }: { status: ProjectStatus }) {
  const s = PROJECT_STATUS.find((x) => x.key === status)!;
  return (
    <span className="rounded px-1.5 py-0.5 text-[0.72rem] font-bold" style={{ color: s.tone, background: `${s.tone}1f` }}>
      {s.label}
    </span>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-gradient-to-r from-accent to-gold" style={{ width: `${value}%` }} />
    </div>
  );
}
