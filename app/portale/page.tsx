import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  Castle,
  Clock3,
  Coins,
  Crown,
  Flag,
  Info,
  Lock,
  Map as MapIcon,
  MessagesSquare,
  ReceiptText,
  ScrollText,
  Store,
  Swords,
  Trophy,
  Vote,
  Wallet,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { ForumLoading } from "@/components/forum/states";
import { DataNotice, portalGate } from "@/components/gestionale/gate";
import { Card, Empty, SectionHead, Stat } from "@/components/gestionale/ui";
import { fmtInt, fmtMoney, fmtPlaytime } from "@/lib/gestionale/data";
import { traguardi } from "@/lib/gestionale/traguardi";
import { formatDate, formatDateTime, timeAgo } from "@/lib/forum/format";

export const metadata: Metadata = { title: "Gestionale", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense fallback={<ForumLoading rows={3} />}>
      <Body />
    </Suspense>
  );
}

const SHORTCUTS: { href: string; label: string; text: string; icon: LucideIcon; tone: string }[] = [
  { href: "/mappa", label: "Mappa", text: "Guarda il mondo e i confini delle città", icon: MapIcon, tone: "#34d399" },
  { href: "/vota", label: "Vota il server", text: "Ogni voto aiuta TiberiusMC a crescere", icon: Vote, tone: "#ffc94d" },
  { href: "/forum", label: "Forum", text: "Assistenza, diplomazia e community", icon: MessagesSquare, tone: "#60a5fa" },
  { href: "/regole", label: "Regolamento", text: "Le regole di gioco, del forum e di Towny", icon: ScrollText, tone: "#ff8a80" },
  { href: "/wiki", label: "Wiki", text: "Guide e comandi del server", icon: BookOpen, tone: "#c084fc" },
  { href: "/store", label: "Store", text: "Goldoni, ranghi e ricompense", icon: Store, tone: "#f472b6" },
];

async function Body() {
  const gate = await portalGate("/portale");
  if (!gate.ok) return gate.node;
  const { player } = gate;
  const d = player.data ?? {};
  const feats = traguardi(player.data, player.mc);
  const done = feats.filter((f) => f.done).length;
  const tx = (d.bank?.transactions ?? []).slice(0, 4);

  return (
    <div className="grid gap-12">
      <DataNotice player={player} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Medal icon={Coins} label="Monete" value={fmtMoney(d.money)} tone="#ffc94d" />
        <Medal img="/images/goldone-loader.webp" label="Goldoni" value={fmtInt(d.goldoni)} tone="#ffb020" />
        <Medal icon={Clock3} label="Gioco (7 giorni)" value={fmtPlaytime(d.playtime7d)} tone="#60a5fa" />
        <Medal icon={Swords} label="Uccisioni" value={fmtInt(d.pvp?.kills)} tone="#ff8a80" />
      </div>

      <section>
        <SectionHead n={1} title="Patrimonio e posizione" sub="Il tuo denaro e dove stai di casa" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Card icon={Wallet} title="Ultimi movimenti" tone="#34d399">
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
              <Empty icon={ReceiptText} title="Nessun movimento" text="Pagamenti, tasse e trasferimenti compariranno qui." />
            )}
            <Link href="/portale/banca" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline">
              Apri il conto <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </Card>
          <Card icon={Info} title="Informazioni" tone="#60a5fa">
            <div className="grid grid-cols-2 gap-3">
              <Stat icon={Castle} label="Città" value={d.town?.name ?? "—"} tone="#ff8a80" />
              <Stat icon={Flag} label="Nazione" value={d.nation?.name ?? "—"} tone="#60a5fa" />
              <Stat icon={Crown} label="Ruolo" value={d.town?.role ?? "—"} tone="#c084fc" />
              <Stat icon={Wifi} label="Stato" value={d.online === undefined ? "—" : d.online ? <span className="text-emerald-300">In gioco</span> : "Non in gioco"} tone="#34d399" />
              <Stat icon={CalendarClock} label="Primo accesso" value={d.firstJoin ? formatDate(d.firstJoin) : "—"} />
              <Stat icon={Clock3} label="Ultimo accesso" value={d.lastSeen ? timeAgo(d.lastSeen) : "—"} />
            </div>
          </Card>
        </div>
      </section>

      <section>
        <SectionHead n={2} title="Cursus honorum" sub={`I traguardi del tuo percorso · ${done} su ${feats.length}`} />
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-gradient-to-r from-[#d0362b] to-gold" style={{ width: `${(done / feats.length) * 100}%` }} />
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {feats.map((f) => (
            <li key={f.key} className="portal-feat" data-done={f.done || undefined}>
              <span className="portal-feat-badge">{f.done ? <Trophy className="size-5" aria-hidden /> : <Lock className="size-4" aria-hidden />}</span>
              <span className="min-w-0">
                <span className="portal-engraved block truncate text-[0.9rem]">{f.title}</span>
                <span className="block text-[0.8rem] leading-snug text-white/50">{f.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHead n={3} title="Vie di Roma" sub="Tutto quello che ti serve, a un clic" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SHORTCUTS.map(({ href, label, text, icon: Icon, tone }) => (
            <li key={href}>
              <Link href={href} className="portal-link group" style={{ ["--t" as string]: tone }}>
                <span className="portal-link-icon">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{label}</span>
                  <span className="block truncate text-[0.82rem] text-white/50">{text}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-white/30 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {player.updatedAt && <p className="text-center text-xs uppercase tracking-[0.15em] text-white/35">Dati aggiornati {timeAgo(player.updatedAt)}</p>}
    </div>
  );
}

function Medal({ icon: Icon, img, label, value, tone }: { icon?: LucideIcon; img?: string; label: string; value: string; tone: string }) {
  return (
    <div className="portal-medal" style={{ ["--t" as string]: tone }}>
      <span className="portal-medal-icon">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img ? <img src={img} alt="" width={26} height={26} className="size-[26px] object-contain" /> : Icon ? <Icon className="size-[22px]" aria-hidden /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white/50">{label}</span>
        <span className="portal-value block truncate !text-[1.6rem]">{value}</span>
      </span>
    </div>
  );
}
