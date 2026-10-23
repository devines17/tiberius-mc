import type { Metadata } from "next";
import { Suspense } from "react";
import { ForumHero } from "@/components/forum/ForumHero";
import { ForumNav } from "@/components/forum/ForumNav";
import { Notice } from "@/components/forum/bits";
import { ForumLoading, LoginRequired, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { LinkMinecraft } from "@/components/forum/LinkMinecraft";
import { formatDate } from "@/lib/forum/format";
import { PERMISSIONS } from "@/lib/forum/config";
import { safeNext } from "@/lib/forum/rules";

export const metadata: Metadata = { title: "Il tuo account", robots: { index: false, follow: false } };

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <>
      <ForumHero kicker="forum · account" title={"il tuo\naccount."} lead="Accesso con Discord e collegamento al tuo account Minecraft." />
      <div className="pb-20 pt-10">
        <Suspense fallback={<ForumLoading rows={2} />}>
          <Body searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Body({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? safeNext(sp.next) : undefined;
  const { configured, session, unread } = await forumContext();
  if (!configured) return <NotConfigured />;
  if (!session) return <LoginRequired next="/forum/account" />;
  const { profile, viewer } = session;
  const perms = PERMISSIONS.filter((p) => viewer.permissions.has(p.key));

  return (
    <div className="forum-in grid gap-8">
      <ForumNav session={session} active="account" unread={unread} />
      <div className="wrap grid gap-6 lg:grid-cols-2">
        <section className="panel grid content-start gap-4 p-6 md:p-8">
          <h2 className="text-xl">Discord</h2>
          <p className="text-white/80">
            Accesso come <strong>{profile.discord_username}</strong>. Registrato il {formatDate(profile.created_at)}.
          </p>
          {perms.length > 0 && (
            <p className="text-sm text-white/60">Permessi staff: {perms.map((p) => p.label).join(", ")}.</p>
          )}
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="btn">
              esci
            </button>
          </form>
        </section>

        <section className="panel grid content-start gap-4 p-6 md:p-8">
          <h2 className="text-xl">Account Minecraft</h2>
          {profile.mc_uuid ? (
            <>
              <p className="text-white/80">
                Collegato a <strong>{profile.mc_name}</strong> ({profile.mc_verified_by === "staff" ? "verificato dallo staff" : "verificato in gioco"}).
              </p>
              <p className="break-all font-mono text-xs text-white/45">UUID {profile.mc_uuid}</p>
              <p className="text-sm text-white/60">Per cambiare account collegato apri una pratica di assistenza.</p>
            </>
          ) : (
            <>
              <ol className="grid gap-2 text-white/80">
                <li>1. Entra sul server <strong>play.tiberiusmc.it</strong>.</li>
                <li>
                  2. Scrivi <code className="rounded bg-white/10 px-1.5 py-0.5">/collega</code> in chat: riceverai un codice di 6 caratteri valido 10 minuti.
                </li>
                <li>3. Inseriscilo qui sotto.</li>
              </ol>
              <LinkMinecraft next={next} />
              <Notice>Se non riesci a entrare in gioco (per esempio perché sei bannato) puoi comunque aprire una richiesta di unban: il tuo nickname lo verificherà lo staff.</Notice>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
