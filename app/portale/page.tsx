import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Castle, Clock3, Coins, Crown, Flag, Gem, MapPin, ReceiptText, TrendingUp, Wallet } from "lucide-react";
import { ForumLoading } from "@/components/forum/states";
import { Head } from "@/components/forum/zero";
import { Chips } from "@/components/gestionale/Chips";
import { BalanceChart } from "@/components/gestionale/BalanceChart";
import { DataNotice, portalGate } from "@/components/gestionale/gate";
import { Card, Empty, PanelHead, Section, Stat, StatCard } from "@/components/gestionale/ui";
import { fmtInt, fmtMoney, fmtPlaytime, greeting } from "@/lib/gestionale/data";
import { formatDateTime, timeAgo } from "@/lib/forum/format";

export const metadata: Metadata = { title: "Gestionale", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense fallback={<ForumLoading rows={3} />}>
      <Body />
    </Suspense>
  );
}

async function Body() {
  const gate = await portalGate("/portale");
  if (!gate.ok) return gate.node;
  const { player } = gate;
  const d = player.data ?? {};
  const tx = (d.bank?.transactions ?? []).slice(0, 5);
  const name = player.mc ?? player.name;

  return (
    <div className="grid gap-8">
      <div>
        <PanelHead
          title={
            <span className="flex items-center gap-4">
              <Head name={player.mc} size={56} className="!rounded-lg" />
              <span>
                <span className="block text-base font-semibold text-white/60">{greeting()},</span>
                <span className="block text-[1.8rem] leading-tight text-gold">{name}</span>
              </span>
            </span>
          }
        >
          <Chips player={player} />
        </PanelHead>
        <DataNotice player={player} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <StatCard icon={Wallet} label="Monete" value={fmtMoney(d.money)} tone="#34d399" />
          <StatCard icon={Castle} label="Città" value={d.town?.name ?? "—"} tone="#ff8a80" />
          <StatCard icon={Gem} label="Goldoni" value={fmtInt(d.goldoni)} tone="#ffc94d" />
          <StatCard icon={Clock3} label="Tempo settimanale" value={fmtPlaytime(d.playtime7d)} tone="#60a5fa" />
        </div>
      </div>

      <Section icon={Coins} title="Economia" sub="Il tuo conto negli ultimi giorni" tone="#34d399">
        <Card icon={TrendingUp} title="Andamento del conto" right={<span className="gest-chip !py-1 !text-[0.72rem]">7 giorni</span>}>
          <BalanceChart points={d.bank?.history ?? []} />
        </Card>
        <Card
          icon={ReceiptText}
          title="Ultime transazioni"
          right={
            <Link href="/portale/banca" className="text-sm font-semibold text-[#ff8a80] hover:underline">
              Vedi tutte
            </Link>
          }
        >
          {tx.length ? (
            <ul className="divide-y divide-white/[0.06]">
              {tx.map((t, i) => (
                <li key={i} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{t.text}</span>
                    <span className="text-xs text-white/45">{formatDateTime(t.at)}</span>
                  </span>
                  <span className={`shrink-0 font-bold ${t.amount >= 0 ? "text-emerald-300" : "text-[#ff8a80]"}`}>
                    {t.amount >= 0 ? "+" : ""}
                    {fmtMoney(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon={ReceiptText} title="Nessuna transazione" text="Pagamenti, tasse e trasferimenti compariranno qui." />
          )}
        </Card>
      </Section>

      <Section icon={Castle} title="Città e nazione" sub="Dove vivi e con chi" tone="#ff8a80">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat icon={Castle} label="Città" value={d.town?.name ?? "—"} />
          <Stat icon={Crown} label="Ruolo" value={d.town?.role ?? "—"} />
          <Stat icon={Flag} label="Nazione" value={d.nation?.name ?? "—"} />
          <Stat icon={MapPin} label="I tuoi lotti" value={fmtInt(d.town?.plots?.length)} />
        </div>
      </Section>

      {player.updatedAt && <p className="text-center text-xs text-white/40">Dati aggiornati {timeAgo(player.updatedAt)}. L&apos;aggiornamento avviene da solo ogni pochi minuti.</p>}
    </div>
  );
}
