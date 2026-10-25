import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Settings, Castle } from "lucide-react";
import { ForumHero } from "@/components/forum/ForumHero";
import { ForumNav } from "@/components/forum/ForumNav";
import { Notice, TicketRows } from "@/components/forum/bits";
import { ForumLoading, LoginRequired, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { staffQueue } from "@/lib/server/tickets";
import { SUBCATEGORIES } from "@/lib/forum/config";
import { PRIORITY_LABEL } from "@/lib/forum/format";
import { isAdmin, isStaff, staffSubcategories } from "@/lib/forum/rules";
import type { Ticket } from "@/lib/server/types";

export const metadata: Metadata = { title: "Pannello staff", robots: { index: false, follow: false } };

type SP = Promise<Record<string, string | string[] | undefined>>;
const str = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <ForumHero kicker="forum · staff" title="Pannello staff" lead="Le pratiche delle sezioni di cui hai il permesso." />
      <div className="pb-20 pt-10">
        <Suspense fallback={<ForumLoading rows={5} />}>
          <Body searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

function flag(t: Ticket): string | null {
  if (t.reopen_requested_at && t.closed_at) return "riapertura chiesta";
  if (t.awaiting === "staff") return t.assigned_to ? "da rispondere" : "nuova · non assegnata";
  if (t.priority === "urgente") return "urgente";
  return null;
}

async function Body({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { configured, session, unread } = await forumContext();
  if (!configured) return <NotConfigured />;
  if (!session) return <LoginRequired next="/forum/staff" />;
  const staff = isStaff(session.viewer);
  const admin = isAdmin(session.viewer);
  if (!staff && !admin) notFound();

  const subs = staffSubcategories(session.viewer);
  const mine = SUBCATEGORIES.filter((s) => subs.includes(s.key));
  const f = {
    sub: str(sp.sezione),
    status: str(sp.stato),
    priority: str(sp.priorita),
    mine: str(sp.mie) === "1",
    from: DATE.test(str(sp.dal)) ? str(sp.dal) : "",
    to: DATE.test(str(sp.al)) ? str(sp.al) : "",
    closed: str(sp.chiuse) === "1",
  };
  const subDef = mine.find((s) => s.key === f.sub);
  const statusOpts = subDef ? subDef.statuses : [...new Map(mine.flatMap((s) => s.statuses).map((s) => [s.key, s])).values()];
  const tickets = staff ? await staffQueue(session, { ...f, status: statusOpts.some((s) => s.key === f.status) ? f.status : undefined }) : [];
  // Prima chi aspetta lo staff, poi per priorità, poi le più vecchie
  const PRI = { urgente: 0, alta: 1, normale: 2, bassa: 3 } as const;
  tickets.sort((a, b) => Number(b.awaiting === "staff") - Number(a.awaiting === "staff") || PRI[a.priority] - PRI[b.priority] || a.updated_at.localeCompare(b.updated_at));

  return (
    <div className="forum-in grid gap-8">
      <ForumNav session={session} active="staff" unread={unread} />
      <div className="wrap grid gap-6">
        {admin && (
          <Link href="/forum/staff/amministrazione" className="panel flex items-center gap-3 p-5 transition-colors hover:bg-white/[0.04]">
            <Settings className="size-5 text-accent" aria-hidden />
            <span>
              <strong>Amministrazione</strong>
              <span className="block text-sm text-white/55">Permessi dello staff, candidature, conservazione, collegamenti Minecraft, registro attività.</span>
            </span>
          </Link>
        )}
        {(admin || session.viewer.permissions.has("citta")) && (
          <Link href="/forum/staff/citta" className="panel flex items-center gap-3 p-5 transition-colors hover:bg-white/[0.04]">
            <Castle className="size-5 text-accent" aria-hidden />
            <span>
              <strong>Città da verificare</strong>
              <span className="block text-sm text-white/55">Registrazioni delle città nel gestionale: controlla in gioco e approva.</span>
            </span>
          </Link>
        )}
        {!staff ? (
          <Notice>Non hai permessi su nessuna sezione. Da amministratore puoi assegnarli (anche a te stesso) nella pagina di amministrazione.</Notice>
        ) : (
          <>
            <form method="get" className="panel grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <label className="grid gap-2 text-sm font-semibold">
                Sezione
                <select name="sezione" defaultValue={f.sub} className="field">
                  <option value="">Tutte le mie</option>
                  {mine.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Stato
                <select name="stato" defaultValue={f.status} className="field">
                  <option value="">Qualsiasi</option>
                  {statusOpts
                    .filter((s) => s.key !== "bozza")
                    .map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Priorità
                <select name="priorita" defaultValue={f.priority} className="field">
                  <option value="">Qualsiasi</option>
                  {Object.entries(PRIORITY_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Mostra
                <select name="chiuse" defaultValue={f.closed ? "1" : ""} className="field">
                  <option value="">Pratiche in corso</option>
                  <option value="1">Pratiche chiuse</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Aperta dal
                <input type="date" name="dal" defaultValue={f.from} className="field" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Al
                <input type="date" name="al" defaultValue={f.to} className="field" />
              </label>
              <label className="flex items-center gap-3 self-end py-3 text-sm font-semibold">
                <input type="checkbox" name="mie" value="1" defaultChecked={f.mine} className="size-4 accent-[var(--color-accent)]" />
                Solo assegnate a me
              </label>
              <div className="self-end">
                <button type="submit" className="btn btn-accent w-full">
                  filtra
                </button>
              </div>
            </form>
            <p className="text-sm text-white/55">
              {tickets.length} pratich{tickets.length === 1 ? "a" : "e"}
              {tickets.length === 200 ? " (mostrate le prime 200: usa i filtri)" : ""}
            </p>
            <TicketRows tickets={tickets} empty="Nessuna pratica con questi filtri." showAuthor highlight={flag} />
          </>
        )}
      </div>
    </div>
  );
}
