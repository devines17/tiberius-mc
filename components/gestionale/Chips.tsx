import { CalendarDays, Circle } from "lucide-react";
import type { PlayerView } from "@/lib/server/player";
import { timeAgo } from "@/lib/forum/format";

const dayFmt = new Intl.DateTimeFormat("it-IT", { weekday: "long", timeZone: "Europe/Rome" });
const dateFmt = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });

/** Data di oggi e stato in gioco, in alto a destra nel pannello. */
export function Chips({ player }: { player: PlayerView }) {
  const now = new Date();
  const d = player.data;
  return (
    <>
      <span className="gest-chip">
        <CalendarDays className="size-4 text-[#ffc94d]" aria-hidden />
        <span className="leading-tight">
          <span className="block text-[0.65rem] uppercase text-white/50">{dayFmt.format(now)}</span>
          {dateFmt.format(now).replace(",", "")}
        </span>
      </span>
      <span className="gest-chip">
        <Circle className={`size-2.5 ${d?.online ? "fill-emerald-400 text-emerald-400" : "fill-white/40 text-white/40"}`} aria-hidden />
        {d?.online ? "In gioco" : d?.lastSeen ? `Offline da ${timeAgo(d.lastSeen).replace(/^\s*/, "")}` : "Offline"}
      </span>
    </>
  );
}
