import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { PenLine } from "lucide-react";
import { ForumHero } from "@/components/forum/ForumHero";
import { DiscordBand } from "@/components/ui/Blocks";
import { CategoryBadge, EventDate, NewsCard, NewsCover, NewsMeta, newsHref } from "@/components/news/parts";
import { listPublished } from "@/lib/server/news";
import { getSession, isOwner } from "@/lib/server/auth";
import { isNewsCategory, NEWS_CATEGORIES } from "@/lib/news/config";

export const metadata: Metadata = { title: "News ed eventi", description: "Aggiornamenti, eventi e annunci ufficiali di TiberiusMC." };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <ForumHero art="news" kicker="tiberiusmc · news" title="News" lead="Aggiornamenti, eventi e annunci ufficiali del server, tutti in un posto." />
      <Suspense fallback={<div className="wrap min-h-[40vh] py-16" />}>
        <List searchParams={searchParams} />
      </Suspense>
      <DiscordBand />
    </>
  );
}

async function List({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const c = typeof sp.c === "string" && isNewsCategory(sp.c) ? sp.c : null;
  const [all, session] = await Promise.all([listPublished(), getSession().catch(() => null)]);
  const owner = session ? isOwner(session.profile) : false;
  const items = c ? all.filter((n) => n.category === c) : all;
  const now = Date.now();
  const upcoming = all.filter((n) => n.event_at && new Date(n.event_at).getTime() > now).sort((a, b) => a.event_at!.localeCompare(b.event_at!));
  const [first, ...rest] = items;

  return (
    <section className="wrap pb-6 pt-12 md:pt-16">
      {/* Filtri per categoria */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter href="/news" active={!c}>Tutte</Filter>
        {NEWS_CATEGORIES.map((k) => (
          <Filter key={k.key} href={`/news?c=${k.key}`} active={c === k.key}>
            {k.label}
          </Filter>
        ))}
        {owner && (
          <Link href="/forum/staff/news" className="btn ml-auto !h-10 !px-4 !text-xs">
            <PenLine className="size-4" aria-hidden /> scrivi una news
          </Link>
        )}
      </div>

      {upcoming.length > 0 && !c && (
        <div className="mt-8 rounded-2xl bg-[#ffc94d]/[0.07] p-5 ring-1 ring-inset ring-[#ffc94d]/25">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#ffc94d]">prossimi eventi</p>
          <ul className="mt-3 grid gap-2">
            {upcoming.slice(0, 4).map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <EventDate iso={e.event_at!} />
                <Link href={newsHref(e.slug)} className="font-bold hover:text-[#ffc94d]">
                  {e.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!first ? (
        <div className="mt-10 rounded-2xl p-10 text-center ring-1 ring-inset ring-white/10">
          <p className="text-xl font-bold">{c ? "Nessuna news in questa categoria." : "Ancora nessuna news."}</p>
          <p className="mt-2 text-white/60">Gli annunci appariranno qui. Nel frattempo le novità passano dal nostro Discord.</p>
        </div>
      ) : (
        <>
          {/* L'ultima news in grande */}
          <Link href={newsHref(first.slug)} className="group mt-8 grid overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.07] lg:grid-cols-[1.25fr_1fr]">
            <NewsCover src={first.cover} priority className="aspect-[16/9] lg:aspect-auto lg:min-h-[22rem]" />
            <div className="flex flex-col gap-3 p-6 md:p-8 lg:justify-center">
              <div>
                <CategoryBadge category={first.category} />
              </div>
              {first.event_at && <EventDate iso={first.event_at} />}
              <h2 className="text-[clamp(1.7rem,3vw,2.6rem)] leading-tight transition-colors group-hover:text-[#ff8a80]">{first.title}</h2>
              <p className="text-lg text-white/75">{first.summary}</p>
              <NewsMeta item={first} />
            </div>
          </Link>
          {rest.length > 0 && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((n) => (
                <NewsCard key={n.id} item={n} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Filter({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${active ? "bg-white text-black" : "bg-white/[0.06] text-white/75 ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:text-white"}`}
    >
      {children}
    </Link>
  );
}
