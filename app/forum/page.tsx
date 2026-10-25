import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Lock } from "lucide-react";
import { ForumNav } from "@/components/forum/ForumNav";
import { StatusBadge } from "@/components/forum/bits";
import { ForumLoading, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { Head, OnlineBoxes, SidebarSkeleton, StatsBox, SubIcon, WelcomeBox } from "@/components/forum/zero";
import { CATEGORIES, SUBCATEGORIES, type Subcategory } from "@/lib/forum/config";
import { getManual, type Manual } from "@/lib/forum/manuali";
import { timeAgo } from "@/lib/forum/format";
import { sectionOverview, type ThreadRow } from "@/lib/server/tickets";

type Item = { kind: "sub"; s: Subcategory } | { kind: "manual"; m: Manual };

/** Righe di una categoria. In Towny i manuali vengono prima di Diplomazia. */
function itemsFor(cat: string): Item[] {
  const subs: Item[] = SUBCATEGORIES.filter((s) => s.category === cat).map((s) => ({ kind: "sub", s }));
  if (cat !== "towny") return subs;
  const man = (k: string): Item[] => {
    const m = getManual(k);
    return m ? [{ kind: "manual", m }] : [];
  };
  return [...man("governatore"), ...man("sindaco"), ...subs];
}

export const metadata: Metadata = {
  title: "Forum",
  description: "Il forum di TiberiusMC: assistenza, Towny e diplomazia, community, proposte e candidature staff.",
};

export default function Page() {
  return (
    <>
      <div className="pb-20 pt-8 md:pt-10">
        <Suspense fallback={<ForumLoading rows={4} />}>
          <Body />
        </Suspense>
      </div>
    </>
  );
}

async function Body() {
  const { configured, session, unread } = await forumContext();
  if (!configured) return <NotConfigured />;
  const overview = await sectionOverview();

  return (
    <div className="forum-in grid gap-5">
      <ForumNav session={session} active="home" unread={unread} />
      <div className="wrap grid gap-5 lg:grid-cols-[minmax(0,1fr)_14.5rem] lg:items-start">
        <div className="grid gap-5">
          {CATEGORIES.map((c) => (
            <section key={c.key} aria-labelledby={`cat-${c.key}`} className="grid gap-2">
              <h2 id={`cat-${c.key}`} className="fcat-head">
                {c.label}
              </h2>
              <ul className="fbox divide-y divide-white/[0.07]">
                {itemsFor(c.key).map((it) => (it.kind === "sub" ? <SubRow key={it.s.key} s={it.s} o={overview.get(it.s.key)} /> : <ManualRow key={it.m.key} m={it.m} />))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="grid gap-4">
          <WelcomeBox session={session} unread={unread} />
          <Suspense fallback={<SidebarSkeleton />}>
            <OnlineBoxes />
            <StatsBox />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}

function SubRow({ s, o }: { s: Subcategory; o?: { threads: number; messages: number; last: ThreadRow | null } }) {
  return (
    <li className="frow relative flex min-h-[3.25rem] items-center gap-4 px-4 py-2.5">
      <SubIcon k={s.key} />
      <Link href={`/forum/sezione?s=${s.key}`} title={s.description} className="min-w-0 flex-1 truncate text-[0.95rem] font-semibold text-white/90 after:absolute after:inset-0 hover:underline">
        {s.label}
      </Link>
      {s.public ? (
        <>
          <dl className="hidden shrink-0 gap-6 text-center text-[0.72rem] text-white/45 md:flex">
            <div>
              <dt>Discussioni</dt>
              <dd className="text-[0.95rem] text-white/85">{o?.threads ?? 0}</dd>
            </div>
            <div>
              <dt>Messaggi</dt>
              <dd className="text-[0.95rem] text-white/85">{o?.messages ?? 0}</dd>
            </div>
          </dl>
          <div className="relative z-10 hidden w-60 shrink-0 items-center gap-2.5 border-l border-white/10 pl-3 sm:flex">
            {o?.last ? (
              <>
                <Head name={o.last.last_mc ?? o.last.author_mc} size={30} />
                <div className="min-w-0 text-[0.78rem] leading-snug">
                  <p className="flex min-w-0 items-center gap-1.5">
                    <StatusBadge sub={o.last.subcategory} status={o.last.status} small />
                    <Link href={`/forum/pratica?n=${o.last.number}`} className="truncate text-white/85 hover:underline">
                      {o.last.title}
                    </Link>
                  </p>
                  <p className="truncate text-white/45">
                    {timeAgo(o.last.last_at ?? o.last.updated_at)} · {o.last.last_name ?? o.last.author_name}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-[0.8rem] text-white/40">Nessuno</p>
            )}
          </div>
        </>
      ) : (
        <span className="flex shrink-0 items-center gap-1.5 text-[0.8rem] text-white/50 sm:w-60 sm:justify-center">
          <Lock className="size-3.5" aria-hidden /> Privata
        </span>
      )}
    </li>
  );
}

function ManualRow({ m }: { m: Manual }) {
  return (
    <li className="frow relative flex min-h-[3.25rem] items-center gap-4 px-4 py-2.5">
      <SubIcon k="manuale" />
      <Link href={`/forum/manuale/${m.key}`} title={m.short} className="min-w-0 flex-1 truncate text-[0.95rem] font-semibold text-white/90 after:absolute after:inset-0 hover:underline">
        {m.label}
      </Link>
      <span className="shrink-0 text-[0.8rem] text-white/45 sm:w-60 sm:text-center">Guida</span>
    </li>
  );
}
