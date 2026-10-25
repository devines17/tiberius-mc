import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarClock, Castle, Clock3, Coins, Crown, Flag, Info, Wallet, Wifi } from "lucide-react";
import { ForumLoading } from "@/components/forum/states";
import { DataNotice, portalGate } from "@/components/gestionale/gate";
import { Card, SectionHead, Stat } from "@/components/gestionale/ui";
import { fmtInt, fmtMoney, fmtPlaytime } from "@/lib/gestionale/data";
import { formatDate, timeAgo } from "@/lib/forum/format";

export const metadata: Metadata = { title: "Gestionale", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <Suspense fallback={<ForumLoading rows={3} />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  const gate = await portalGate("/portale");
  if (!gate.ok) return gate.node;
  const { player } = gate;
  const d = player.data ?? {};
  return (
    <div className="grid gap-10">
      <DataNotice player={player} />

      <section>
        <SectionHead n={1} title="Patrimonio e posizione" sub="Il tuo denaro e dove stai di casa" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Card icon={Wallet} title="Portafoglio" tone="#34d399">
            <div className="grid grid-cols-2 gap-3">
              <Stat icon={Coins} label="Monete" value={fmtMoney(d.money)} tone="#ffc94d" />
              <Stat img="/images/goldone-loader.webp" label="Goldoni" value={fmtInt(d.goldoni)} tone="#ffc94d" />
            </div>
          </Card>
          <Card icon={Info} title="Informazioni" tone="#60a5fa">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat icon={Castle} label="Città" value={d.town?.name ?? "—"} />
              <Stat icon={Flag} label="Nazione" value={d.nation?.name ?? "—"} />
              <Stat icon={Clock3} label="Tempo (7gg)" value={fmtPlaytime(d.playtime7d)} />
            </div>
          </Card>
        </div>
      </section>

      <section>
        <SectionHead n={2} title="Cursus honorum" sub="Il tuo percorso sul server" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat icon={Crown} label="Ruolo in città" value={d.town?.role ?? "—"} />
          <Stat icon={Wifi} label="Stato" value={d.online === undefined ? "—" : d.online ? <span className="text-emerald-300">In gioco</span> : "Non in gioco"} />
          <Stat icon={CalendarClock} label="Primo accesso" value={d.firstJoin ? formatDate(d.firstJoin) : "—"} />
          <Stat icon={Clock3} label="Ultimo accesso" value={d.lastSeen ? timeAgo(d.lastSeen) : "—"} />
        </div>
      </section>

      {player.updatedAt && <p className="text-center text-xs uppercase tracking-[0.15em] text-white/35">Dati aggiornati {timeAgo(player.updatedAt)}</p>}
    </div>
  );
}
