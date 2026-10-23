import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHead } from "@/components/ui/PageHead";
import { ForumNav } from "@/components/forum/ForumNav";
import { Notice, TicketRows } from "@/components/forum/bits";
import { ForumLoading, LoginRequired, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { search } from "@/lib/server/tickets";
import { HttpError } from "@/lib/server/http";
import { SUBCATEGORIES } from "@/lib/forum/config";
import { isStaff, parseTicketCode, staffSubcategories } from "@/lib/forum/rules";

export const metadata: Metadata = { title: "Cerca", robots: { index: false, follow: false } };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageHead kicker="forum · cerca" title={"cerca tra\nle pratiche."} lead="Trovi solo le richieste che hai il diritto di vedere: le tue e, se sei staff, quelle delle tue sezioni." art="/images/art/empire.png" />
      <div className="pb-20 pt-10">
        <Suspense fallback={<ForumLoading rows={3} />}>
          <Body searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

const str = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");

async function Body({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { configured, session, unread } = await forumContext();
  if (!configured) return <NotConfigured />;
  if (!session) return <LoginRequired next="/forum/cerca" />;

  const staff = isStaff(session.viewer);
  const mySubs = new Set(staffSubcategories(session.viewer));
  const q = str(sp.q);
  const sub = str(sp.sezione);
  const status = str(sp.stato);
  const from = str(sp.dal);
  const to = str(sp.al);
  const author = staff ? str(sp.autore) : "";
  const closed = str(sp.chiuse);
  const asked = Boolean(q || sub || status || from || to || author || closed);

  // Un numero di pratica ("TIB-01042" o "1042") cerca direttamente quella pratica
  const number = parseTicketCode(q);
  let results = null;
  let error: string | null = null;
  if (asked) {
    try {
      results = await search(session, {
        q: number ? undefined : q,
        number,
        sub,
        status,
        from,
        to,
        author,
        closed: closed === "si" ? true : closed === "no" ? false : null,
      });
    } catch (e) {
      error = e instanceof HttpError ? e.message : "Ricerca non riuscita. Riprova.";
    }
  }
  const subDef = SUBCATEGORIES.find((s) => s.key === sub);
  const statusOpts = subDef ? subDef.statuses : [...new Map(SUBCATEGORIES.flatMap((s) => s.statuses).map((s) => [s.key, s])).values()];

  return (
    <div className="forum-in grid gap-8">
      <ForumNav session={session} active="cerca" unread={unread} />
      <div className="wrap grid gap-6">
        <form method="get" className="panel grid gap-4 p-6 md:p-8" role="search">
          <div className="grid gap-2">
            <label htmlFor="q" className="text-sm font-semibold">
              Parole chiave o numero (es. TIB-01042)
            </label>
            <input id="q" name="q" defaultValue={q} maxLength={100} className="field" type="search" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="grid gap-2 text-sm font-semibold">
              Sezione
              <select name="sezione" defaultValue={sub} className="field">
                <option value="">Tutte</option>
                {SUBCATEGORIES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Stato
              <select name="stato" defaultValue={status} className="field">
                <option value="">Qualsiasi</option>
                {statusOpts.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Aperta dal
              <input type="date" name="dal" defaultValue={from} className="field" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Al
              <input type="date" name="al" defaultValue={to} className="field" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Pratiche
              <select name="chiuse" defaultValue={closed} className="field">
                <option value="">Aperte e chiuse</option>
                <option value="no">Solo aperte</option>
                <option value="si">Solo chiuse</option>
              </select>
            </label>
            {staff && (
              <label className="grid gap-2 text-sm font-semibold">
                Nick del richiedente
                <input name="autore" defaultValue={author} maxLength={16} className="field" autoComplete="off" spellCheck={false} />
              </label>
            )}
          </div>
          <div>
            <button type="submit" className="btn btn-accent">
              cerca
            </button>
          </div>
          {staff && <p className="text-xs text-white/45">Come staff vedi anche le pratiche di: {SUBCATEGORIES.filter((s) => mySubs.has(s.key)).map((s) => s.label).join(", ")}. Le note interne sono incluse nella ricerca solo per queste sezioni.</p>}
        </form>

        {error && <Notice tone="error">{error}</Notice>}
        {results && (
          <section aria-live="polite" className="grid gap-3">
            <p className="text-sm text-white/55">{results.length === 100 ? "Più di 100 risultati: restringi la ricerca." : `${results.length} risultat${results.length === 1 ? "o" : "i"}`}</p>
            <TicketRows tickets={results} empty="Nessuna pratica trovata." showAuthor={staff} />
          </section>
        )}
      </div>
    </div>
  );
}
