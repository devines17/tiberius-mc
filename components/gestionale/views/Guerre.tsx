import { Crosshair, Percent, Skull, Swords, Trophy } from "lucide-react";
import { Card, Empty, PanelHead, Stat } from "../ui";
import { fmtInt } from "@/lib/gestionale/data";
import { formatDate } from "@/lib/forum/format";
import { DataNotice } from "@/components/gestionale/notice";
import type { PlayerView } from "@/lib/server/player";

/** Contenuto della pagina, usato dal gestionale e dal teaser della home. */
export function GuerreView({ player, notice = true }: { player: PlayerView; notice?: boolean }) {
  const p = player.data?.pvp;
  const kd = p?.kills !== undefined && p?.deaths !== undefined ? (p.deaths ? (p.kills / p.deaths).toFixed(2) : String(p.kills)) : "—";
  return (
    <div className="grid gap-4" data-tz="guerre">
      <div>
        <PanelHead title="Guerre e PvP" sub="I tuoi combattimenti e le guerre" />
        {notice && <DataNotice player={player} />}
      </div>
      
      <Card icon={Crosshair} title="Combattimento" tone="#ff8a80">
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={Swords} label="Uccisioni" value={fmtInt(p?.kills)} tone="#ff8a80" />
          <Stat icon={Skull} label="Morti" value={fmtInt(p?.deaths)} />
          <Stat icon={Percent} label="K/D" value={kd} />
        </div>
      </Card>
      <Card icon={Trophy} title="Guerre" tone="#ffc94d">
        {p?.wars?.length ? (
          <ul className="divide-y divide-white/[0.06]">
            {p.wars.map((w, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="font-semibold">{w.name}</span>
                  {w.side && <span className="text-white/50"> · {w.side}</span>}
                </span>
                <span className="text-white/55">
                  {w.result ?? "in corso"}
                  {w.at && ` · ${formatDate(w.at)}`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty icon={Trophy} title="Nessuna guerra" text="Qui compariranno le guerre della tua città o nazione, con il loro esito." />
        )}
      </Card>
    </div>
  );
}
