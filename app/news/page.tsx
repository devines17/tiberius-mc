import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { PenLine } from "lucide-react";
import { DiscordBand } from "@/components/ui/Blocks";
import { NewsRow } from "@/components/news/parts";
import { listPublished } from "@/lib/server/news";
import { getSession, isOwner } from "@/lib/server/auth";
import { isNewsCategory, NEWS_CATEGORIES } from "@/lib/news/config";

export const metadata: Metadata = { title: "News ed eventi", description: "Aggiornamenti, eventi e annunci ufficiali di TiberiusMC." };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <div className="wrap pb-16 pt-8 md:pt-12">
        <div className="overflow-hidden rounded-2xl bg-[#141416] ring-1 ring-inset ring-white/10">
          <header className="relative bg-[radial-gradient(60%_120%_at_50%_0%,rgb(255_190_80/0.18),transparent_60%),linear-gradient(180deg,#7d1912,#a3231a)] pt-9 text-center">
            <h1 className="px-4 text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold uppercase leading-none tracking-[0.04em] text-white">News ed eventi</h1>
            <p className="mt-3 px-4 text-white/75">Aggiornamenti, eventi e annunci ufficiali del server.</p>
            <div aria-hidden className="merli mt-8" />
          </header>
          <Suspense fallback={<div className="min-h-[40vh]" />}>
            <List searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
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

  return (
    <div className="grid gap-5 px-3 pb-6 pt-2 sm:px-6 md:px-10 md:pb-10">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Filter href="/news" active={!c}>Tutte</Filter>
        {NEWS_CATEGORIES.map((k) => (
          <Filter key={k.key} href={`/news?c=${k.key}`} active={c === k.key}>
            {k.label}
          </Filter>
        ))}
        {owner && (
          <Link href="/forum/staff/news" className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold text-white/60 ring-1 ring-inset ring-white/15 transition-colors hover:text-white sm:ml-3">
            <PenLine className="size-4" aria-hidden /> scrivi una news
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl p-10 text-center ring-1 ring-inset ring-white/10">
          <p className="text-xl font-bold">{c ? "Nessuna news in questa categoria." : "Ancora nessuna news."}</p>
          <p className="mt-2 text-white/60">Gli annunci appariranno qui. Nel frattempo le novità passano dal nostro Discord.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((n) => (
            <NewsRow key={n.id} item={n} />
          ))}
        </div>
      )}
    </div>
  );
}

function Filter({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${active ? "bg-accent text-white" : "bg-white/[0.05] text-white/70 ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:text-white"}`}
    >
      {children}
    </Link>
  );
}
