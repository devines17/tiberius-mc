import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PenLine } from "lucide-react";
import { DiscordBand } from "@/components/ui/Blocks";
import { NewsRow } from "@/components/news/parts";
import { listPublished } from "@/lib/server/news";
import { getSession, isOwner } from "@/lib/server/auth";

export const metadata: Metadata = { title: "News ed eventi", description: "Aggiornamenti, eventi e annunci ufficiali di TiberiusMC." };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <div className="mx-auto w-full max-w-[90rem] pb-16 pt-8 sm:px-[var(--gutter)] md:pt-12">
        <div className="overflow-hidden bg-[#17181a] pb-8 sm:rounded-md">
          <header>
            <h1 className="bg-[#8f1d14] pb-3 pt-7 text-center text-3xl font-bold uppercase text-white md:text-4xl">Novità ed eventi</h1>
            <div className="bg-[#d0362b] pt-2">
              <div aria-hidden className="onde translate-y-px" />
            </div>
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
  await searchParams;
  const [items, session] = await Promise.all([listPublished(), getSession().catch(() => null)]);
  const owner = session ? isOwner(session.profile) : false;

  return (
    <div className="mx-5 grid gap-4 pt-6 lg:mx-20">
      {owner && (
        <div className="flex justify-end">
          <Link href="/forum/staff/news" className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold text-white/60 ring-1 ring-inset ring-white/15 transition-colors hover:text-white">
            <PenLine className="size-4" aria-hidden /> scrivi una news
          </Link>
        </div>
      )}
      {items.length === 0 ? (
        <div className="rounded-xl p-10 text-center ring-1 ring-inset ring-white/10">
          <p className="text-xl font-bold">Ancora nessuna news.</p>
          <p className="mt-2 text-white/60">Gli annunci appariranno qui. Nel frattempo le novità passano dal nostro Discord.</p>
        </div>
      ) : (
        items.map((n) => <NewsRow key={n.id} item={n} />)
      )}
    </div>
  );
}
