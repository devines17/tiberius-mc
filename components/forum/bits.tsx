/** Piccoli componenti del forum, nello stile del sito (pannelli scuri, rosso imperiale). */

import Link from "next/link";
import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { statusLabel, statusTone, formatDate, subLabel } from "@/lib/forum/format";
import { getSubcategory } from "@/lib/forum/config";
import { ticketCode } from "@/lib/forum/rules";
import type { Ticket } from "@/lib/server/types";

const TONE: Record<string, string> = {
  aperta: "bg-accent/15 text-[#ff8a80] ring-accent/30",
  attesa: "bg-sky-400/15 text-sky-300 ring-sky-400/30",
  positiva: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
  negativa: "bg-white/10 text-white/70 ring-white/20",
  chiusa: "bg-white/5 text-white/50 ring-white/15",
  bozza: "bg-gold/15 text-gold ring-gold/30",
};

export function StatusBadge({ sub, status }: { sub: string; status: string }) {
  return (
    <span className={`font-badge inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs ring-1 ${TONE[statusTone(status)]}`}>
      {statusLabel(sub, status)}
    </span>
  );
}

export function PrivateBadge() {
  return (
    <span className="font-badge inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[0.7rem] uppercase tracking-wider text-white/60 ring-1 ring-white/10">
      <Lock className="size-3" aria-hidden /> riservata
    </span>
  );
}

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" | "error" | "ok" }) {
  const cls = {
    info: "border-white/10 bg-white/[0.03] text-white/80",
    warn: "border-gold/30 bg-gold/10 text-[#ffe3a3]",
    error: "border-accent/40 bg-accent/10 text-[#ffb4ad]",
    ok: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  }[tone];
  return <div className={`rounded-2xl border px-5 py-4 text-sm leading-relaxed ${cls}`}>{children}</div>;
}

export function TicketRows({ tickets, empty, showAuthor = false, highlight }: { tickets: Ticket[]; empty: ReactNode; showAuthor?: boolean; highlight?: (t: Ticket) => string | null }) {
  if (!tickets.length) return <div className="panel p-8 text-center text-muted">{empty}</div>;
  return (
    <ul className="forum-in panel divide-y divide-white/10">
      {tickets.map((t) => {
        const note = highlight?.(t);
        return (
          <li key={t.id}>
            <Link href={`/forum/pratica?n=${t.number}`} className="group grid gap-2 px-5 py-4 transition-colors hover:bg-white/[0.04] sm:grid-cols-[7rem_1fr_auto] sm:items-center sm:gap-5 md:px-6">
              <span className="font-mono text-sm text-white/50">{ticketCode(t.number)}</span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-semibold transition-colors group-hover:text-accent">{t.title}</span>
                  {getSubcategory(t.subcategory)?.sensitive && <PrivateBadge />}
                  {note && <span className="font-badge rounded-full bg-accent px-2 py-0.5 text-[0.7rem] text-white">{note}</span>}
                </span>
                <span className="mt-0.5 block text-sm text-white/55">
                  {subLabel(t.subcategory)}
                  {showAuthor && t.author_mc_name ? ` · ${t.author_mc_name}` : ""} · aggiornata {formatDate(t.updated_at)}
                  {t.priority !== "normale" && showAuthor ? ` · priorità ${t.priority}` : ""}
                </span>
              </span>
              <StatusBadge sub={t.subcategory} status={t.status} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[length:var(--step-head)]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
