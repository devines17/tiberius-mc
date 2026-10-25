import type { Metadata } from "next";
import { Suspense } from "react";
import { ForumHero } from "@/components/forum/ForumHero";
import { ForumNav } from "@/components/forum/ForumNav";
import { Section, TicketRows } from "@/components/forum/bits";
import { ForumLoading, LoginRequired, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { listMine } from "@/lib/server/tickets";
import { Btn } from "@/components/ui/Btn";
import type { Ticket } from "@/lib/server/types";

export const metadata: Metadata = { title: "Le mie richieste", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <ForumHero kicker="forum · le mie richieste" title="Le mie richieste" lead="Tutte le richieste che hai aperto, con lo stato aggiornato." />
      <div className="pb-20 pt-10">
        <Suspense fallback={<ForumLoading rows={4} />}>
          <Body />
        </Suspense>
      </div>
    </>
  );
}

async function Body() {
  const { configured, session, unread } = await forumContext();
  if (!configured) return <NotConfigured />;
  if (!session) return <LoginRequired next="/forum/mie" />;

  const all = await listMine(session);
  const used = new Set<string>();
  const take = (pred: (t: Ticket) => boolean) =>
    all.filter((t) => {
      if (used.has(t.id) || !pred(t)) return false;
      used.add(t.id);
      return true;
    });
  const waiting = take((t) => !t.closed_at && t.awaiting === "giocatore");
  const updated = take((t) => !t.closed_at && t.status !== "bozza" && t.updated_at > t.author_seen_at);
  const drafts = take((t) => t.status === "bozza");
  const open = take((t) => !t.closed_at);
  const closed = take((t) => Boolean(t.closed_at));

  return (
    <div className="forum-in grid gap-10">
      <ForumNav session={session} active="mie" unread={unread} />
      <div className="wrap grid gap-12">
        {all.length === 0 ? (
          <div className="panel grid justify-items-center gap-4 p-10 text-center">
            <p className="text-muted">Non hai ancora aperto nessuna richiesta.</p>
            <Btn href="/forum" variant="accent">
              scegli una sezione
            </Btn>
          </div>
        ) : (
          <>
            {waiting.length > 0 && (
              <Section title="Serve la tua risposta">
                <TicketRows tickets={waiting} empty="" highlight={() => "rispondi"} />
              </Section>
            )}
            {updated.length > 0 && (
              <Section title="Aggiornate di recente">
                <TicketRows tickets={updated} empty="" highlight={() => "novità"} />
              </Section>
            )}
            <Section title="Aperte">
              <TicketRows tickets={open} empty="Nessuna pratica aperta." />
            </Section>
            {drafts.length > 0 && (
              <Section title="Bozze">
                <TicketRows tickets={drafts} empty="" />
              </Section>
            )}
            <Section title="Chiuse">
              <TicketRows tickets={closed} empty="Nessuna pratica chiusa." />
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
