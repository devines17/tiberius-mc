import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DiscordBand } from "@/components/ui/Blocks";
import { CategoryTag, EventDate, NewsBody, NewsCover } from "@/components/news/parts";
import { formatNewsDateLong } from "@/lib/news/config";
import { getPublished } from "@/lib/server/news";

export const metadata: Metadata = { title: "News" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <Suspense fallback={<div className="wrap min-h-[60vh] py-16" />}>
        <Article searchParams={searchParams} />
      </Suspense>
      <DiscordBand />
    </>
  );
}

async function Article({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const slug = typeof sp.s === "string" ? sp.s : "";
  const n = await getPublished(slug);
  if (!n) notFound();
  return (
    <div className="wrap pb-16 pt-8 md:pt-12">
      <article className="overflow-hidden rounded-2xl bg-[#141416] ring-1 ring-inset ring-white/10">
        <div className="relative">
          <NewsCover src={n.cover} priority className="aspect-[16/9] md:aspect-[21/9]" />
          <CategoryTag category={n.category} className="absolute left-4 top-4 !px-3 !py-1.5 !text-sm" />
          <div aria-hidden className="merli absolute inset-x-0 bottom-0" />
        </div>
        <div className="px-5 pb-12 pt-4 md:px-10">
          <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition-colors hover:text-white">
            <ChevronLeft className="size-4" aria-hidden /> Torna alle news
          </Link>
          <div className="mx-auto mt-6 max-w-3xl">
            <h1 className="text-[clamp(2rem,4.5vw,3.2rem)] font-extrabold leading-[1.08]">{n.title}</h1>
            <div className="mt-4 h-1 w-14 rounded-full bg-accent" aria-hidden />
            <p className="mt-4 text-sm text-white/50">
              {formatNewsDateLong(n.published_at ?? n.created_at)}
              {n.author && <> · scritta da {n.author}</>}
            </p>
            {n.event_at && (
              <div className="mt-3">
                <EventDate iso={n.event_at} />
              </div>
            )}
            <p className="mt-6 text-xl leading-relaxed text-white/90">{n.summary}</p>
            {n.body && (
              <div className="mt-10">
                <NewsBody text={n.body} />
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
