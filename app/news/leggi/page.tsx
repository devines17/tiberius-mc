import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CategoryTag, EventDate, NewsBody, NewsCover, NewsTitle } from "@/components/news/parts";
import { formatNewsDateLong } from "@/lib/news/config";
import { getPublished } from "@/lib/server/news";

export const metadata: Metadata = { title: "News" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<div className="wrap min-h-[60vh] py-16" />}>
      <Article searchParams={searchParams} />
    </Suspense>
  );
}

/** Una news: copertina larga con l'etichetta, poi il testo in una colonna stretta al centro. */
async function Article({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const slug = typeof sp.s === "string" ? sp.s : "";
  const n = await getPublished(slug);
  if (!n) notFound();
  return (
    <div className="wrap pb-20 pt-8 md:pt-12">
      <article className="overflow-hidden rounded-2xl bg-[#141416] ring-1 ring-inset ring-white/10">
        <div className="relative">
          <NewsCover src={n.cover} priority className="aspect-[16/9] md:aspect-[2.4/1]" />
          <CategoryTag category={n.category} className="absolute left-3 top-3 !px-3 !py-1.5 !text-[0.95rem]" />
          <div aria-hidden className="merli absolute inset-x-0 bottom-0" />
        </div>
        <div className="px-5 pb-14 pt-2 md:px-6">
          <Link href="/news" className="inline-flex items-center gap-1 text-[0.85rem] text-white/55 transition-colors hover:text-white">
            <ChevronLeft className="size-4" aria-hidden /> Torna alle novità
          </Link>
          <div className="mx-auto mt-6 max-w-[50rem]">
            <NewsTitle text={n.title} className="text-[clamp(2rem,4.2vw,2.9rem)] font-extrabold leading-[1.1]" />
            <div className="mt-4 h-0.5 w-10 rounded-full bg-white/25" aria-hidden />
            <p className="mt-3 text-[0.8rem] text-white/45">{formatNewsDateLong(n.published_at ?? n.created_at)}</p>
            {n.event_at && (
              <div className="mt-2">
                <EventDate iso={n.event_at} />
              </div>
            )}
            <div className="mt-6">
              <NewsBody text={n.body ? `${n.summary}\n\n${n.body}` : n.summary} />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
