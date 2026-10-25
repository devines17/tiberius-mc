import type { Metadata } from "next";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { ForumNav } from "@/components/forum/ForumNav";
import { ForumLoading, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { Crumbs, Head, Pagination, RoleTag } from "@/components/forum/zero";
import { formatDate, timeAgo } from "@/lib/forum/format";
import { members, MEMBERS_PER_PAGE } from "@/lib/server/tickets";

export const metadata: Metadata = { title: "Membri", robots: { index: false, follow: true } };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <div className="pb-20 pt-10">
      <Suspense fallback={<ForumLoading rows={6} />}>
        <Body searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Body({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 32) : "";
  const page = Math.max(1, Number.parseInt(typeof sp.p === "string" ? sp.p : "", 10) || 1);
  const { configured, session, unread } = await forumContext();
  if (!configured) return <NotConfigured />;
  const data = await members(q, page);
  const href = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (p > 1) u.set("p", String(p));
    return `/forum/membri${u.size ? `?${u}` : ""}`;
  };
  const online = (iso: string | null) => Boolean(iso && Date.now() - Date.parse(iso) < 10 * 60_000);

  return (
    <div className="forum-in grid gap-6">
      <ForumNav session={session} active="membri" unread={unread} next="/forum/membri" />
      <div className="wrap grid gap-5">
        <Crumbs items={[{ href: "/forum", label: "Forum" }, { label: "Membri" }]} />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[clamp(1.6rem,3vw,2.3rem)] leading-tight">Membri</h1>
            <p className="mt-1 text-white/55">{data.total ? `${data.total.toLocaleString("it-IT")} ${data.total === 1 ? "membro" : "membri"}${q ? ` per "${q}"` : ""}` : ""}</p>
          </div>
          <form method="get" role="search" className="relative w-full sm:w-72">
            <label htmlFor="mq" className="sr-only">
              Cerca un membro
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" aria-hidden />
            <input id="mq" name="q" type="search" defaultValue={q} maxLength={32} placeholder="Cerca un membro…" className="field !h-11 w-full !pl-9" />
          </form>
        </div>

        <section className="fbox" aria-label="Elenco dei membri">
          <div className="hidden grid-cols-[minmax(0,1fr)_7rem_9rem_9rem] gap-4 border-b border-white/[0.08] px-5 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-white/40 md:grid">
            <span>Membro</span>
            <span className="text-center">Messaggi</span>
            <span>Registrato</span>
            <span>Ultima attività</span>
          </div>
          {data.rows.length ? (
            <ul className="divide-y divide-white/[0.07]">
              {data.rows.map((m) => (
                <li key={`${m.name}-${m.since}`} className="frow grid gap-2 px-4 py-3.5 md:grid-cols-[minmax(0,1fr)_7rem_9rem_9rem] md:items-center md:gap-4 md:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="relative">
                      <Head name={m.head} size={40} />
                      {online(m.lastSeen) && <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-[#16141a]" aria-label="online" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{m.name}</p>
                      <RoleTag role={m.role} staff={m.staff} />
                    </div>
                  </div>
                  <p className="text-sm text-white/60 md:text-center">
                    <span className="font-bold text-white md:block">{m.messages}</span> <span className="md:hidden">messaggi</span>
                  </p>
                  <p className="text-sm text-white/60">
                    <span className="md:hidden">Registrato il </span>
                    {formatDate(m.since)}
                  </p>
                  <p className="text-sm text-white/60">{online(m.lastSeen) ? <span className="text-emerald-300">online ora</span> : m.lastSeen ? timeAgo(m.lastSeen) : "—"}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 py-12 text-center text-white/55">{q ? "Nessun membro con questo nome." : "Ancora nessun membro."}</p>
          )}
          {data.total > MEMBERS_PER_PAGE && (
            <div className="border-t border-white/[0.08] px-4 py-3 md:px-5">
              <Pagination page={page} total={data.total} perPage={MEMBERS_PER_PAGE} href={href} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
