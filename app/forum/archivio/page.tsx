import type { Metadata } from "next";
import { Suspense } from "react";
import { ForumHero } from "@/components/forum/ForumHero";
import { ForumNav } from "@/components/forum/ForumNav";
import { Notice, Section, TicketRows } from "@/components/forum/bits";
import { ForumLoading, LoginRequired, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { listMine, staffQueue } from "@/lib/server/tickets";
import { isStaff } from "@/lib/forum/rules";

export const metadata: Metadata = { title: "Archivio", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <ForumHero kicker="forum · archivio" title={"pratiche\nchiuse."} lead="Lo storico delle richieste concluse. Non esiste un archivio pubblico: segnalazioni, candidature e dati personali restano riservati." />
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
  if (!session) return <LoginRequired next="/forum/archivio" />;
  const staff = isStaff(session.viewer);
  const [mine, sections] = await Promise.all([listMine(session), staff ? staffQueue(session, { closed: true }) : Promise.resolve([])]);
  const closedMine = mine.filter((t) => t.closed_at);

  return (
    <div className="forum-in grid gap-8">
      <ForumNav session={session} active="archivio" unread={unread} />
      <div className="wrap grid gap-12">
        <Notice>Una pratica chiusa non si può modificare. Se serve, dalla pratica puoi chiedere la riapertura: lo staff valuterà.</Notice>
        <Section title="Le tue pratiche chiuse">
          <TicketRows tickets={closedMine} empty="Nessuna pratica chiusa." />
        </Section>
        {staff && (
          <Section title="Chiuse nelle tue sezioni">
            <TicketRows tickets={sections} empty="Nessuna pratica chiusa nelle tue sezioni." showAuthor />
          </Section>
        )}
      </div>
    </div>
  );
}
