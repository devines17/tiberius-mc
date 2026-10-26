import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Swords, ArrowUpRight, Castle, Clock3, Coins, Crown, Flag, Gem, MapPin, ReceiptText, TrendingUp, Users, Wallet } from "lucide-react";
import { ForumLoading } from "@/components/forum/states";
import { BalanceChart } from "@/components/gestionale/BalanceChart";
import { Vexillum } from "@/components/gestionale/Vexillum";
import { DataNotice, portalGate } from "@/components/gestionale/gate";
import { Card, Empty, Section, Stat, StatCard } from "@/components/gestionale/ui";
import { fmtInt, fmtMoney, fmtPlaytime } from "@/lib/gestionale/data";
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
  const t = d.town;

  return (
    <div className="grid gap-7">
      <DataNotice player={player} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard i={1} icon={Wallet} label="Monete" value={fmtMoney(d.money)} num={d.money} kind="money" tone="#34d399" />
        <StatCard i={2} icon={Gem} label="Goldoni" value={fmtInt(d.goldoni)} num={d.goldoni} tone="#ffc94d" />
        <StatCard i={3} icon={Clock3} label="Gioco in settimana" value={fmtPlaytime(d.playtime7d)} tone="#60a5fa" />
        <StatCard i={4} icon={Swords} label="Uccisioni" value={fmtInt(d.pvp?.kills)} num={d.pvp?.kills} />
      </div>

      <Section i={5} icon={Coins} title="Economia" sub="Come si muove il tuo conto" tone="#34d399">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <Card i={6} icon={TrendingUp} title="Andamento del conto" tone="#34d399">
            <BalanceChart points={d.bank?.history ?? []} />
          </Card>
          <Card
            i={7}
            icon={ReceiptText}
            title="Ultime transazioni"
            tone="#c084fc"
            right={
              <Link href="/portale/banca" className="gx-link">
                Vedi tutte <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            }
          >
            {tx.length ? (
              <ul className="divide-y divide-white/[0.06]">
                {tx.map((x, k) => (
                  <li key={k} className="flex items-center gap-3 py-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{x.text}</span>
                      <span className="text-xs text-white/45">{formatDateTime(x.at)}</span>
                    </span>
                    <span className={`shrink-0 text-sm font-bold ${x.amount >= 0 ? "text-emerald-300" : "text-[#ff8a80]"}`}>
                      {x.amount >= 0 ? "+" : ""}
                      {fmtMoney(x.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty icon={ReceiptText} title="Nessuna transazione" text="Pagamenti, tasse e trasferimenti compariranno qui." />
            )}
          </Card>
        </div>
      </Section>

      <Section i={9} icon={Castle} title="La tua città" sub="Dove vivi e sotto quale bandiera" tone="#ff8a80">
        <div className="fbox gx-in grid gap-6 p-5 md:grid-cols-[auto_minmax(0,1fr)]">
          <Vexillum name={t?.name ?? null} />
          <div className="relative grid content-center gap-4">
            <div>
              <p className="text-sm text-white/50">{d.nation?.name ? `Nazione ${d.nation.name}` : "Città"}</p>
              <p className="font-brand text-[clamp(1.8rem,3.5vw,2.6rem)] leading-none">{t?.name ?? "Nessuna città"}</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Stat icon={Crown} label="Ruolo" value={t?.role ?? "—"} tone="#ffc94d" />
              <Stat icon={Users} label="Cittadini" value={fmtInt(t?.residents)} tone="#60a5fa" />
              <Stat icon={Flag} label="Nazione" value={d.nation?.name ?? "—"} tone="#ff8a80" />
              <Stat icon={MapPin} label="I tuoi lotti" value={fmtInt(t?.plots?.length)} tone="#34d399" />
            </div>
            <Link href="/portale/citta" className="gx-link w-fit">
              Apri la città <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </Section>

      {player.updatedAt && <p className="text-center text-xs text-white/40">Dati aggiornati {timeAgo(player.updatedAt)} · si aggiornano da soli ogni pochi minuti</p>}
    </div>
  );
}
