import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHead } from "@/components/ui/PageHead";
import { ForumNav } from "@/components/forum/ForumNav";
import { ForumLoading, LoginRequired, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { MarkAllRead } from "@/components/forum/MarkAllRead";
import { notificationsFor } from "@/lib/server/tickets";
import { formatDateTime } from "@/lib/forum/format";

export const metadata: Metadata = { title: "Notifiche", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <PageHead kicker="forum · notifiche" title={"le tue\nnotifiche."} lead="Risposte dello staff, cambi di stato e decisioni sulle tue pratiche." art="/images/art/village.png" />
      <div className="pb-20 pt-10">
        <Suspense fallback={<ForumLoading rows={3} />}>
          <Body />
        </Suspense>
      </div>
    </>
  );
}

async function Body() {
  const { configured, session, unread } = await forumContext();
  if (!configured) return <NotConfigured />;
  if (!session) return <LoginRequired next="/forum/notifiche" />;
  const items = await notificationsFor(session, 50);

  return (
    <div className="forum-in grid gap-8">
      <ForumNav session={session} active="notifiche" unread={unread} />
      <div className="wrap grid gap-4">
        {unread > 0 && (
          <div className="flex justify-end">
            <MarkAllRead />
          </div>
        )}
        {items.length === 0 ? (
          <div className="panel p-8 text-center text-muted">Nessuna notifica per ora.</div>
        ) : (
          <ul className="panel divide-y divide-white/10">
            {items.map((n) => {
              const inner = (
                <>
                  <span className={`mt-2 size-2 shrink-0 rounded-full ${n.read_at ? "bg-transparent" : "bg-accent"}`} aria-hidden />
                  <span className="grid min-w-0 gap-0.5">
                    <span className={`break-words ${n.read_at ? "text-white/65" : "font-semibold"}`}>
                      {n.title}
                      {!n.read_at && <span className="sr-only"> (da leggere)</span>}
                    </span>
                    <time className="text-sm text-white/45" dateTime={n.created_at}>
                      {formatDateTime(n.created_at)}
                    </time>
                  </span>
                </>
              );
              return (
                <li key={n.id}>
                  {n.tickets ? (
                    <Link href={`/forum/pratica?n=${n.tickets.number}`} className="flex gap-4 px-5 py-4 transition-colors hover:bg-white/[0.04] md:px-6">
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex gap-4 px-5 py-4 md:px-6">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
