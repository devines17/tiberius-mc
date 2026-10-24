import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DiscordBand } from "@/components/ui/Blocks";
import { CategoryBadge, EventDate, NewsBody, NewsCover, NewsMeta } from "@/components/news/parts";
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
    <article className="wrap max-w-4xl pb-10 pt-10 md:pt-14">
      <Link href="/news" className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white">
        <ArrowLeft className="size-4" aria-hidden /> tutte le news
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <CategoryBadge category={n.category} />
        <NewsMeta item={n} />
      </div>
      <h1 className="mt-4 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05]">{n.title}</h1>
      {n.event_at && (
        <div className="mt-4">
          <EventDate iso={n.event_at} />
        </div>
      )}
      <p className="mt-5 text-xl leading-relaxed text-white/80">{n.summary}</p>
      <NewsCover src={n.cover} priority className="mt-8 aspect-[16/9] rounded-2xl" />
      {n.body && (
        <div className="mt-10">
          <NewsBody text={n.body} />
        </div>
      )}
    </article>
  );
}
