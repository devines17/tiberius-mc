import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ForumHero } from "@/components/forum/ForumHero";
import { ForumNav } from "@/components/forum/ForumNav";
import { ForumLoading, LoginRequired, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { ActionForm } from "@/components/gestionale/ActionForm";
import { formatDateTime } from "@/lib/forum/format";
import { canReviewTowns, pendingTowns } from "@/lib/server/towns";

export const metadata: Metadata = { title: "Città da verificare", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <ForumHero kicker="forum · staff" title="Città da verificare" lead="Controlla in gioco che chi registra la città ne sia davvero il sindaco, poi approva o respingi." />
      <div className="pb-20 pt-10">
        <Suspense fallback={<ForumLoading rows={2} />}>
          <Body />
        </Suspense>
      </div>
    </>
  );
}

async function Body() {
  const { configured, session, unread } = await forumContext();
  if (!configured) return <NotConfigured />;
  if (!session) return <LoginRequired next="/forum/staff/citta" />;
  if (!canReviewTowns(session)) notFound();
  const towns = await pendingTowns(session).catch(() => []);
  return (
    <div className="grid gap-6">
      <ForumNav session={session} active="staff" unread={unread} />
      <div className="wrap grid gap-4">
        {towns.length === 0 && <p className="panel p-8 text-center text-white/60">Nessuna città da verificare.</p>}
        {towns.map((t) => (
          <article key={t.id} className="panel grid gap-4 p-6">
            <header>
              <h2 className="text-xl font-bold">{t.name}</h2>
              <p className="text-sm text-white/55">
                Richiesta da <strong className="text-white/85">{t.profiles?.mc_name ?? t.profiles?.discord_username ?? "?"}</strong>
                {t.profiles?.mc_name ? " (Minecraft collegato)" : t.profiles ? ` (Discord: ${t.profiles.discord_username}, Minecraft non collegato)` : ""} · {formatDateTime(t.created_at)}
              </p>
              {(t.motto || t.nation) && (
                <p className="text-sm text-white/55">
                  {t.motto && <em>{t.motto}</em>}
                  {t.motto && t.nation && " · "}
                  {t.nation && `Nazione: ${t.nation}`}
                </p>
              )}
            </header>
            <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">{t.description}</p>
            <div className="flex flex-wrap items-end gap-3 border-t border-white/10 pt-4">
              <ActionForm azione="verifica" className="flex">
                <input type="hidden" name="town" value={t.id} />
                <input type="hidden" name="esito" value="approva" />
                <button className="btn btn-accent !h-10 !text-xs">approva</button>
              </ActionForm>
              <ActionForm azione="verifica" className="flex flex-1 flex-wrap gap-2">
                <input type="hidden" name="town" value={t.id} />
                <input type="hidden" name="esito" value="respingi" />
                <input name="nota" required minLength={5} maxLength={1000} placeholder="Motivo (es. non risulta sindaco in gioco)" className="field !h-10 min-w-56 flex-1" />
                <button className="btn !h-10 !text-xs">respingi</button>
              </ActionForm>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
