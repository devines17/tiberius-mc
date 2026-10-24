import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ForumHero } from "@/components/forum/ForumHero";
import { ForumLoading, LoginRequired, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { NewsEditor } from "@/components/news/NewsEditor";
import { isOwner } from "@/lib/server/auth";
import { listAllForEditor } from "@/lib/server/news";

export const metadata: Metadata = { title: "Scrivi le news", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <ForumHero art="news" kicker="news · founder" title={"scrivi le\nnews."} lead="Scrivi, salva come bozza e pubblica. Le news appaiono subito sul sito." />
      <div className="wrap pb-20 pt-10">
        <Suspense fallback={<ForumLoading rows={4} />}>
          <Body />
        </Suspense>
      </div>
    </>
  );
}

async function Body() {
  const { configured, session } = await forumContext();
  if (!configured) return <NotConfigured />;
  if (!session) return <LoginRequired next="/forum/staff/news" text="Le news le pubblica solo il Founder: accedi con il tuo account Discord." />;
  if (!isOwner(session.profile)) notFound();
  let items: Awaited<ReturnType<typeof listAllForEditor>> = [];
  let missing = false;
  try {
    items = await listAllForEditor();
  } catch {
    missing = true;
  }
  if (missing) {
    return (
      <p className="rounded-2xl bg-accent/10 p-6 text-[#ffb3ab] ring-1 ring-inset ring-accent/30">
        La tabella delle news non esiste ancora: lancia la migrazione <code>20261024160000_news.sql</code> nell&apos;SQL Editor di Supabase, poi ricarica questa pagina.
      </p>
    );
  }
  return (
    <NewsEditor
      items={items.map((n) => ({ id: n.id, slug: n.slug, title: n.title, category: n.category, summary: n.summary, body: n.body, cover: n.cover, event_at: n.event_at, published_at: n.published_at, created_at: n.created_at }))}
    />
  );
}
