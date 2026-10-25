import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowDownLeft, ArrowUpRight, Coins, History, Landmark, Gem, ReceiptText } from "lucide-react";
import { ForumLoading } from "@/components/forum/states";
import { DataNotice, portalGate } from "@/components/gestionale/gate";
import { Chips } from "@/components/gestionale/Chips";
import { Card, Empty, PanelHead, Stat } from "@/components/gestionale/ui";
import { fmtInt, fmtMoney } from "@/lib/gestionale/data";
import { formatDateTime } from "@/lib/forum/format";

export const metadata: Metadata = { title: "Banca · Gestionale", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <Suspense fallback={<ForumLoading rows={2} />}>
        <Body />
      </Suspense>
    </>
  );
}

async function Body() {
  const gate = await portalGate("/portale/banca");
  if (!gate.ok) return gate.node;
  const { player } = gate;
  const d = player.data ?? {};
  const tx = d.bank?.transactions ?? [];
  return (
    <div className="grid gap-4">
      <div>
        <PanelHead title="Conto" sub="Il tuo denaro e i movimenti">
          <Chips player={player} />
        </PanelHead>
        <DataNotice player={player} />
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card icon={Landmark} title="Il tuo conto" tone="#ffc94d">
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={Coins} label="Saldo" value={fmtMoney(d.money)} tone="#ffc94d" />
            <Stat icon={Gem} label="Goldoni" value={fmtInt(d.goldoni)} tone="#ffc94d" />
          </div>
        </Card>
        <Card icon={History} title="Ultimi 7 giorni" tone="#60a5fa">
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={ArrowDownLeft} label="Entrate" value={<span className="text-emerald-300">{d.bank?.in7d !== undefined ? `+${fmtMoney(d.bank.in7d)}` : "—"}</span>} tone="#34d399" />
            <Stat icon={ArrowUpRight} label="Uscite" value={<span className="text-[#ff8a80]">{d.bank?.out7d !== undefined ? `-${fmtMoney(d.bank.out7d)}` : "—"}</span>} tone="#ff8a80" />
          </div>
        </Card>
      </div>
      <Card icon={ReceiptText} title="Movimenti" tone="#c084fc">
        {tx.length ? (
          <ul className="divide-y divide-white/[0.06]">
            {tx.map((t, i) => (
              <li key={i} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{t.text}</span>
                  <span className="text-white/45">{formatDateTime(t.at)}</span>
                </span>
                <span className={`shrink-0 font-bold ${t.amount >= 0 ? "text-emerald-300" : "text-[#ff8a80]"}`}>
                  {t.amount >= 0 ? "+" : ""}
                  {fmtMoney(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty icon={ReceiptText} title="Nessun movimento" text="Qui compariranno pagamenti, tasse e trasferimenti del tuo conto." />
        )}
      </Card>
    </div>
  );
}
