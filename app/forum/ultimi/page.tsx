import type { Metadata } from "next";
import { Suspense } from "react";
import { ForumNav } from "@/components/forum/ForumNav";
import { ForumLoading, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { Crumbs, Pagination, ThreadList } from "@/components/forum/zero";
import { subLabel } from "@/lib/forum/format";
import { publicThreads, THREADS_PER_PAGE } from "@/lib/server/tickets";

export const metadata: Metadata = { title: "Ultimi post" };

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
  const page = Math.max(1, Number.parseInt(typeof sp.p === "string" ? sp.p : "", 10) || 1);
  const { configured, session, unread } = await forumContext();
  if (!configured) return <NotConfigured />;
  const data = await publicThreads({ page });

  return (
    <div className="forum-in grid gap-6">
      <ForumNav session={session} active="ultimi" unread={unread} next="/forum/ultimi" />
      <div className="wrap grid gap-5">
        <Crumbs items={[{ href: "/forum", label: "Forum" }, { label: "Ultimi post" }]} />
        <h1 className="text-[clamp(1.6rem,3vw,2.3rem)] leading-tight">Ultimi post</h1>
        <section className="panel" aria-label="Discussioni più recenti">
          <ThreadList rows={data.rows} empty="Ancora nessuna discussione pubblica." showSection={subLabel} />
          {data.total > THREADS_PER_PAGE && (
            <div className="border-t border-white/[0.08] px-4 py-3 md:px-5">
              <Pagination page={page} total={data.total} perPage={THREADS_PER_PAGE} href={(p) => (p > 1 ? `/forum/ultimi?p=${p}` : "/forum/ultimi")} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
