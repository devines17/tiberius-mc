import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Lock, Plus } from "lucide-react";
import { ForumNav } from "@/components/forum/ForumNav";
import { Notice, TicketRows } from "@/components/forum/bits";
import { ForumLoading, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { Crumbs, Pagination, SubIcon, ThreadList } from "@/components/forum/zero";
import { CATEGORIES, getSubcategory } from "@/lib/forum/config";
import { listMineIn, publicThreads, THREADS_PER_PAGE } from "@/lib/server/tickets";

export const metadata: Metadata = { title: "Forum" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <div className="pb-20 pt-10">
      <Suspense fallback={<ForumLoading rows={5} />}>
        <Body searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

async function Body({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const s = getSubcategory(str(sp.s));
  if (!s) notFound();
  const { configured, session, unread } = await forumContext();
  if (!configured) return <NotConfigured />;

  const cat = CATEGORIES.find((c) => c.key === s.category);
  const here = `/forum/sezione?s=${s.key}`;
  const status = s.statuses.some((x) => x.key === str(sp.stato)) ? str(sp.stato) : null;
  const page = Math.max(1, Number.parseInt(str(sp.p), 10) || 1);
  const link = (o: { stato?: string | null; p?: number }) => {
    const q = new URLSearchParams({ s: s.key });
    if (o.stato) q.set("stato", o.stato);
    if (o.p && o.p > 1) q.set("p", String(o.p));
    return `/forum/sezione?${q}`;
  };

  const newHref = session ? `/forum/nuova/${s.key}` : `/api/auth/discord/login?next=${encodeURIComponent(`/forum/nuova/${s.key}`)}`;
  const data = s.public ? await publicThreads({ sub: s.key, status, page }) : null;
  const mine = !s.public && session ? await listMineIn(session, s.key) : null;

  return (
    <div className="forum-in grid gap-6">
      <ForumNav session={session} active="home" unread={unread} next={here} />
      <div className="wrap grid gap-5">
        <Crumbs items={[{ href: "/forum", label: "Forum" }, { label: cat?.label ?? "" }, { label: s.label }]} />

        <header className="flex flex-wrap items-center gap-4">
          <SubIcon k={s.key} big />
          <div className="min-w-0 flex-1">
            <h1 className="text-[clamp(1.6rem,3vw,2.3rem)] leading-tight">{s.label}</h1>
            <p className="mt-1 text-white/60">{s.description}</p>
          </div>
        </header>

        {s.notices.length > 0 && (
          <div className="grid gap-2">
            {s.notices.map((n) => (
              <Notice key={n}>{n}</Notice>
            ))}
          </div>
        )}

        <div className="fbox flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-5">
          <p className="text-sm text-white/60">
            {s.public ? (session ? "Hai un problema o qualcosa da dire? Apri una discussione." : "Accedi per aprire una nuova discussione.") : session ? "Apri una nuova richiesta allo staff." : "Accedi per aprire una nuova richiesta."}
          </p>
          <a href={newHref} className="flex h-9 items-center gap-1.5 rounded-md bg-accent px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#c42b22]">
            <Plus className="size-4" aria-hidden />
            {s.public ? "Nuova discussione" : "Nuova richiesta"}
          </a>
        </div>

        {data ? (
          <section className="fbox" aria-label="Discussioni">
            <div className="flex flex-wrap items-center gap-1.5 border-b border-white/[0.08] px-4 py-3 md:px-5">
              {[{ key: null as string | null, label: "Tutte" }, ...s.statuses.map((x) => ({ key: x.key as string | null, label: x.label }))].map((f) => (
                <Link
                  key={f.key ?? "all"}
                  href={link({ stato: f.key })}
                  aria-current={status === f.key ? "page" : undefined}
                  className={`rounded-lg px-3 py-1.5 text-[0.8rem] font-bold transition-colors ${status === f.key ? "bg-white/12 text-white ring-1 ring-inset ring-white/15" : "text-white/55 hover:bg-white/5 hover:text-white"}`}
                >
                  {f.label}
                </Link>
              ))}
            </div>
            <ThreadList rows={data.rows} empty={status ? "Nessuna discussione con questo stato." : "Ancora nessuna discussione. Apri la prima!"} />
            {data.total > THREADS_PER_PAGE && (
              <div className="border-t border-white/[0.08] px-4 py-3 md:px-5">
                <Pagination page={page} total={data.total} perPage={THREADS_PER_PAGE} href={(p) => link({ stato: status, p })} />
              </div>
            )}
          </section>
        ) : (
          <section className="grid gap-4" aria-label="Le tue richieste">
            <div className="fbox flex items-start gap-3 p-5 text-sm leading-relaxed text-white/70">
              <Lock className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <p>
                Sezione privata: le richieste qui le vedete solo tu e lo staff che se ne occupa.
                {s.sensitive ? " È riservata anche dentro lo staff." : ""}
              </p>
            </div>
            {mine && <TicketRows tickets={mine} empty="Non hai ancora richieste in questa sezione." />}
          </section>
        )}
      </div>
    </div>
  );
}
