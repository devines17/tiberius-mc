import type { Metadata } from "next";
import { Suspense } from "react";
import { BookUser, CalendarClock, Castle, Clock3, Coins, Crown, Flag, Gem, Info, Wallet, Wifi } from "lucide-react";
import { ForumLoading } from "@/components/forum/states";
import { DataNotice, portalGate } from "@/components/gestionale/gate";
import { Card, PortalTitle, SectionHead, Stat } from "@/components/gestionale/ui";
import { fmtInt, fmtMoney, fmtPlaytime, greeting } from "@/lib/gestionale/data";
import { formatDate, timeAgo } from "@/lib/forum/format";

export const metadata: Metadata = { title: "Gestionale", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <div className="wrap">
      <PortalTitle title="Gestionale" sub="Panoramica della tua esperienza su TiberiusMC" />
      <Suspense fallback={<ForumLoading rows={3} />}>
        <Body />
      </Suspense>
    </div>
  );
}

async function Body() {
  const gate = await portalGate("/portale");
  if (!gate.ok) return gate.node;
  const { player } = gate;
  const d = player.data ?? {};
  const name = player.mc ?? player.name;
  return (
    <div className="grid gap-12">
      <div className="flex flex-wrap items-center justify-center gap-6">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc-heads.net/head/${player.mc && /^[A-Za-z0-9_]{3,16}$/.test(player.mc) ? player.mc : "MHF_Steve"}/220`}
            alt=""
            width={110}
            height={110}
            className="size-[110px] rounded-2xl bg-white/[0.04] object-contain p-2 [image-rendering:pixelated]"
          />
        </div>
        <p className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold leading-tight">
          {greeting()},
          <br />
          <span className="text-gold">{name}</span>
        </p>
      </div>

      <DataNotice player={player} />

      <section>
        <SectionHead icon={BookUser} title="Generale" sub="Panoramica generale di gioco" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Card icon={Wallet} title="Portafoglio" tone="#34d399">
            <div className="grid grid-cols-2 gap-3">
              <Stat icon={Coins} label="Monete" value={fmtMoney(d.money)} tone="#ffc94d" />
              <Stat icon={Gem} label="Goldoni" value={fmtInt(d.goldoni)} tone="#ffc94d" />
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
        <SectionHead icon={Crown} title="Profilo" sub="Il tuo percorso sul server" tone="#c084fc" />
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
