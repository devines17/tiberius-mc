import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Lock } from "lucide-react";
import { ForumHero } from "@/components/forum/ForumHero";
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
      <ForumHero kicker="tiberiusmc · forum" title="Forum" lead="Chiedi aiuto, discuti con la community, proponi idee e segui le tue richieste allo staff." />
      <div className="pb-20 pt-10">
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
    <div className="forum-in grid gap-6">
      <ForumNav session={session} active="home" unread={unread} />
      <div className="wrap grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="grid gap-6">
          {CATEGORIES.map((c) => (
            <section key={c.key} className="panel" aria-labelledby={`cat-${c.key}`}>
              <h2 id={`cat-${c.key}`} className="fcat-head">
                {c.label}
              </h2>
              <ul className="divide-y divide-white/[0.07]">
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
    <li className="frow relative grid gap-4 px-4 py-5 md:grid-cols-[minmax(0,1fr)_10.5rem_15rem] md:items-center md:px-5">
      <div className="flex min-w-0 items-start gap-4">
        <SubIcon k={s.key} />
        <div className="min-w-0">
          <Link href={`/forum/sezione?s=${s.key}`} className="text-[1.05rem] font-bold text-white after:absolute after:inset-0 hover:text-[#ff8a80]">
            {s.label}
          </Link>
          <p className="mt-0.5 text-sm leading-relaxed text-white/55">{s.description}</p>
        </div>
      </div>
      {s.public ? (
        <>
          <dl className="hidden grid-cols-2 gap-2 text-center md:grid">
            <div>
              <dt className="text-[0.66rem] uppercase tracking-wide text-white/40">Discussioni</dt>
              <dd className="font-bold">{o?.threads ?? 0}</dd>
            </div>
            <div>
              <dt className="text-[0.66rem] uppercase tracking-wide text-white/40">Messaggi</dt>
              <dd className="font-bold">{o?.messages ?? 0}</dd>
            </div>
          </dl>
          {o?.last ? (
            <div className="relative z-10 flex min-w-0 items-center gap-3 pl-[3.75rem] md:pl-0">
              <Head name={o.last.last_mc ?? o.last.author_mc} size={34} />
              <div className="min-w-0 text-[0.8rem]">
                <div className="flex min-w-0 items-center gap-1.5">
                  <StatusBadge sub={o.last.subcategory} status={o.last.status} />
                </div>
                <Link href={`/forum/pratica?n=${o.last.number}`} className="mt-1 block truncate font-semibold text-white/85 hover:text-[#ff8a80]">
                  {o.last.title}
                </Link>
                <p className="truncate text-white/45">
                  {timeAgo(o.last.last_at ?? o.last.updated_at)} · {o.last.last_name ?? o.last.author_name}
                </p>
              </div>
            </div>
          ) : (
            <p className="pl-[3.75rem] text-sm text-white/40 md:pl-0">Nessuna discussione</p>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2 pl-[3.75rem] text-sm text-white/50 md:col-span-2 md:justify-end md:pl-0">
          <Lock className="size-4" aria-hidden /> Privata · la vedete solo tu e lo staff
        </div>
      )}
    </li>
  );
}

function ManualRow({ m }: { m: Manual }) {
  return (
    <li className="frow relative grid gap-4 px-4 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-5">
      <div className="flex min-w-0 items-start gap-4">
        <SubIcon k="manuale" />
        <div className="min-w-0">
          <Link href={`/forum/manuale/${m.key}`} className="text-[1.05rem] font-bold text-white after:absolute after:inset-0 hover:text-[#ff8a80]">
            {m.label}
          </Link>
          <p className="mt-0.5 text-sm leading-relaxed text-white/55">{m.short}</p>
        </div>
      </div>
      <span className="font-badge pl-[3.75rem] text-xs uppercase tracking-wider text-gold md:pl-0">Manuale · leggi</span>
    </li>
  );
}
