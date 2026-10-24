import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ForumNav } from "@/components/forum/ForumNav";
import { Notice, PrivateBadge } from "@/components/forum/bits";
import { Crumbs, SubIcon } from "@/components/forum/zero";
import { ForumLoading, LoginRequired, NeedsMinecraft, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { TicketForm } from "@/components/forum/TicketForm";
import { CATEGORIES, formFields, getSubcategory, SUBCATEGORIES } from "@/lib/forum/config";
import { getCandidatureSettings } from "@/lib/server/tickets";
import { displayName } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Nuova richiesta", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return SUBCATEGORIES.map((s) => ({ sezione: s.key }));
}

export default async function Page({ params }: { params: Promise<{ sezione: string }> }) {
  const { sezione } = await params;
  const s = getSubcategory(sezione);
  if (!s) notFound();
  return (
    <div className="pb-20 pt-10">
      <Suspense fallback={<ForumLoading rows={2} />}>
        <Body sezione={s.key} />
      </Suspense>
    </div>
  );
}

async function Body({ sezione }: { sezione: string }) {
  const s = getSubcategory(sezione)!;
  const next = `/forum/nuova/${s.key}`;
  const { configured, session, unread } = await forumContext();
  if (!configured) return <NotConfigured />;
  if (!session) return <LoginRequired next={next} />;
  if (s.requiresVerifiedMc && !session.profile.mc_uuid) return <NeedsMinecraft next={next} />;

  const settings = s.key === "candidature" ? await getCandidatureSettings() : undefined;
  if (settings && (!settings.aperte || !settings.ruoli.length)) {
    return (
      <div className="forum-in grid gap-6">
        <ForumNav session={session} active="home" unread={unread} />
        <div className="wrap">
          <Notice tone="warn">Le candidature sono chiuse in questo momento. Gli annunci di apertura escono sul Discord.</Notice>
        </div>
      </div>
    );
  }

  const fields = formFields(s, settings);
  const cat = CATEGORIES.find((c) => c.key === s.category);
  return (
    <div className="forum-in grid gap-6">
      <ForumNav session={session} active="home" unread={unread} />
      <div className="wrap grid gap-5">
        <Crumbs items={[{ href: "/forum", label: "Forum" }, { label: cat?.label ?? "" }, { href: `/forum/sezione?s=${s.key}`, label: s.label }, { label: s.public ? "Nuova discussione" : "Nuova richiesta" }]} />
        <header className="flex flex-wrap items-center gap-4">
          <SubIcon k={s.key} big />
          <div className="min-w-0 flex-1">
            <h1 className="text-[clamp(1.6rem,3vw,2.3rem)] leading-tight">{s.public ? "Nuova discussione" : "Nuova richiesta"}</h1>
            <p className="mt-1 text-white/60">{s.description}</p>
          </div>
        </header>
      </div>
      <div className="wrap grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <TicketForm
          meta={{
            key: s.key,
            label: s.label,
            bodyLabel: s.bodyLabel,
            notices: s.notices,
            autoTitle: Boolean(s.autoTitle),
            allowsDraft: s.allowsDraft,
            identity: session.profile.mc_uuid ? `${displayName(session.profile)} (account verificato)` : `${session.profile.discord_username} (Discord)`,
          }}
          fields={fields}
        />
        <aside className="grid gap-4 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <div className="panel grid gap-3 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg">{s.label}</h2>
              {s.sensitive && <PrivateBadge />}
            </div>
            <p className="text-sm text-white/65">
              {s.openReplies
                ? "La discussione è pubblica e tutti gli utenti possono rispondere. Riceverai una notifica a ogni risposta."
                : s.public
                  ? "La discussione è pubblica: la leggono tutti, rispondete solo tu e lo staff. Riceverai una notifica a ogni risposta."
                  : "La pratica la vedete solo tu e lo staff di questa sezione. Riceverai una notifica a ogni risposta."}
            </p>
          </div>
          {s.notices.map((n) => (
            <Notice key={n} tone="warn">
              {n}
            </Notice>
          ))}
          <Link href={`/forum/sezione?s=${s.key}`} className="link text-sm">
            ← torna alla sezione
          </Link>
        </aside>
      </div>
    </div>
  );
}
