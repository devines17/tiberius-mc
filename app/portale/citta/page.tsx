import type { Metadata } from "next";
import { Suspense } from "react";
import { Castle, Coins, Crown, Flag, Handshake, Landmark, MapPin, Percent, Shield, Swords, Users, Wrench } from "lucide-react";
import { ForumLoading } from "@/components/forum/states";
import { DataNotice, portalGate } from "@/components/gestionale/gate";
import { Card, Empty, PortalTitle, SectionHead, Stat } from "@/components/gestionale/ui";
import { fmtInt, fmtMoney } from "@/lib/gestionale/data";

export const metadata: Metadata = { title: "Città · Gestionale", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <div className="wrap">
      <PortalTitle title="Città e nazione" sub="La tua città, i tuoi lotti e la tua nazione" />
      <Suspense fallback={<ForumLoading rows={3} />}>
        <Body />
      </Suspense>
    </div>
  );
}

async function Body() {
  const gate = await portalGate("/portale/citta");
  if (!gate.ok) return gate.node;
  const { player } = gate;
  const t = player.data?.town;
  const n = player.data?.nation;
  return (
    <div className="grid gap-12">
      <DataNotice player={player} />

      <section>
        <SectionHead icon={Castle} title={t?.name ?? "Città"} sub={t ? `Sei ${t.role?.toLowerCase() ?? "cittadino"} di questa città` : "La città di cui fai parte"} tone="#ff8a80" />
        {t || !player.data ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <Card icon={Users} title="Cittadini e governo" tone="#ff8a80">
              <div className="grid grid-cols-2 gap-3">
                <Stat icon={Crown} label="Sindaco" value={t?.mayor ?? "—"} />
                <Stat icon={Users} label="Cittadini" value={fmtInt(t?.residents)} />
              </div>
            </Card>
            <Card icon={Landmark} title="Banca della città" tone="#ffc94d">
              <div className="grid grid-cols-3 gap-3">
                <Stat icon={Coins} label="Saldo" value={fmtMoney(t?.bank)} tone="#ffc94d" />
                <Stat icon={Percent} label="Tassa giornaliera" value={fmtMoney(t?.dailyTax)} />
                <Stat icon={Wrench} label="Upkeep" value={fmtMoney(t?.upkeep)} />
              </div>
            </Card>
            <Card icon={MapPin} title="Territorio" tone="#34d399" className="lg:col-span-2">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat icon={MapPin} label="Claim" value={t?.claims !== undefined ? `${fmtInt(t.claims)}${t.maxClaims ? ` / ${fmtInt(t.maxClaims)}` : ""}` : "—"} />
                  <Stat icon={Castle} label="I tuoi lotti" value={fmtInt(t?.plots?.length)} />
                </div>
                {t?.plots?.length ? (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {t.plots.map((p, i) => (
                      <li key={i} className="portal-stat flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold">{p.name || p.type || "Lotto"}</span>
                        <span className="font-mono text-white/55">
                          x {p.x} · z {p.z}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Card>
          </div>
        ) : (
          <div className="portal-card">
            <Empty icon={Castle} title="Nessuna città" text="Non fai parte di nessuna città. Entra in una città in gioco con /town join oppure fondane una." />
          </div>
        )}
      </section>

      <section>
        <SectionHead icon={Flag} title={n?.name ?? "Nazione"} sub="La nazione della tua città" tone="#60a5fa" />
        {n || !player.data ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <Card icon={Shield} title="Governo" tone="#60a5fa">
              <div className="grid grid-cols-2 gap-3">
                <Stat icon={Crown} label="Leader" value={n?.king ?? "—"} />
                <Stat icon={Castle} label="Capitale" value={n?.capital ?? "—"} />
                <Stat icon={Castle} label="Città" value={fmtInt(n?.towns)} />
                <Stat icon={Coins} label="Banca" value={fmtMoney(n?.bank)} tone="#ffc94d" />
              </div>
            </Card>
            <Card icon={Handshake} title="Diplomazia" tone="#c084fc">
              <div className="grid gap-3 text-sm">
                <p>
                  <span className="text-white/55">Alleati: </span>
                  {n?.allies?.length ? n.allies.join(", ") : "—"}
                </p>
                <p className="flex items-start gap-1.5">
                  <Swords className="mt-0.5 size-4 shrink-0 text-[#ff8a80]" aria-hidden />
                  <span>
                    <span className="text-white/55">Nemici: </span>
                    {n?.enemies?.length ? n.enemies.join(", ") : "—"}
                  </span>
                </p>
              </div>
            </Card>
          </div>
        ) : (
          <div className="portal-card">
            <Empty icon={Flag} title="Nessuna nazione" text="La tua città non fa parte di nessuna nazione." />
          </div>
        )}
      </section>
    </div>
  );
}
