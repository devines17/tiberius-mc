import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ForumHero } from "@/components/forum/ForumHero";
import { ForumNav } from "@/components/forum/ForumNav";
import { ForumLoading, LoginRequired, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { AdminPanel } from "@/components/forum/AdminPanel";
import { getCandidatureSettings } from "@/lib/server/tickets";
import { db } from "@/lib/server/db";
import { PERMISSIONS } from "@/lib/forum/config";
import { isAdmin } from "@/lib/forum/rules";

export const metadata: Metadata = { title: "Amministrazione forum", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <ForumHero kicker="forum · amministrazione" title="Amministrazione" lead="Permessi, impostazioni e registro. Ogni modifica viene registrata." />
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
  if (!session) return <LoginRequired next="/forum/staff/amministrazione" />;
  if (!isAdmin(session.viewer)) notFound();
  const [cand, arch] = await Promise.all([getCandidatureSettings(), db.one<{ value: { conservazione_giorni: number | null } }>("forum_settings", "value", { key: "eq.archivio" })]);
  return (
    <div className="forum-in grid gap-8">
      <ForumNav session={session} active="staff" unread={unread} />
      <div className="wrap">
        <AdminPanel permissions={PERMISSIONS.map((p) => ({ key: p.key, label: p.label }))} candidature={cand} retention={arch?.value.conservazione_giorni ?? null} />
      </div>
    </div>
  );
}
