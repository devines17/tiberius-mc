import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHead } from "@/components/ui/PageHead";
import { Btn } from "@/components/ui/Btn";
import { Words } from "@/components/ui/Words";
import { ForumNav } from "@/components/forum/ForumNav";
import { Notice, PrivateBadge } from "@/components/forum/bits";
import { ForumLoading, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { CATEGORIES, SUBCATEGORIES } from "@/lib/forum/config";

export const metadata: Metadata = {
  title: "Forum",
  description: "Assistenza, Towny e candidature staff di TiberiusMC: apri una pratica e seguila fino alla risposta dello staff.",
};

export default function Page() {
  return (
    <>
      <PageHead
        tone="accent"
        kicker="forum"
        title={"il foro\ndell'impero."}
        lead="Assistenza, questioni Towny e candidature. Ogni richiesta è una pratica privata tra te e lo staff."
        art="/images/art/village.png"
      />

      <div className="pt-10">
        <Suspense fallback={<ForumLoading rows={0} />}>
          <Top />
        </Suspense>
      </div>

      {CATEGORIES.map((c) => (
        <section key={c.key} className="wrap section" aria-labelledby={`cat-${c.key}`}>
          <div className="mb-8 grid gap-2">
            <h2 id={`cat-${c.key}`} className="text-[length:var(--step-head)]">
              <Words text={c.label} />
            </h2>
            <p className="text-muted" data-reveal="fade">
              {c.description}
            </p>
          </div>
          <ul className={`grid gap-4 ${SUBCATEGORIES.filter((s) => s.category === c.key).length > 1 ? "md:grid-cols-2" : ""} ${c.key === "assistenza" ? "lg:grid-cols-3" : ""}`} data-stagger="0.07">
            {SUBCATEGORIES.filter((s) => s.category === c.key).map((s) => (
              <li key={s.key} className="panel flex flex-col gap-4 p-6 md:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl">{s.label}</h3>
                  {s.sensitive && <PrivateBadge />}
                </div>
                <p className="flex-1 text-white/70">{s.description}</p>
                <div>
                  <Btn href={`/forum/nuova/${s.key}`} variant="accent" magnetic={false}>
                    nuova richiesta
                  </Btn>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

async function Top() {
  const { configured, session, unread } = await forumContext();
  if (!configured) return <NotConfigured />;
  return (
    <div className="forum-in grid gap-6">
      <ForumNav session={session} active="home" unread={unread} />
      <div className="wrap">
        <Notice>
          Questo non è un forum di discussione pubblico: le pratiche le vedete solo tu e lo staff della sezione. Segnalazioni, pratiche dello store e candidature sono riservate anche all&apos;interno dello staff.
        </Notice>
      </div>
    </div>
  );
}
