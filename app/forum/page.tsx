import type { Metadata } from "next";
import { Suspense } from "react";
import { ForumHero } from "@/components/forum/ForumHero";
import { Btn } from "@/components/ui/Btn";
import { Words } from "@/components/ui/Words";
import { ForumNav } from "@/components/forum/ForumNav";
import { Notice, PrivateBadge } from "@/components/forum/bits";
import { ForumLoading, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { BookOpen } from "lucide-react";
import { CATEGORIES, SUBCATEGORIES, type Subcategory } from "@/lib/forum/config";
import { getManual, type Manual } from "@/lib/forum/manuali";

type Item = { kind: "sub"; s: Subcategory } | { kind: "manual"; m: Manual };

/** Schede di una categoria. In Towny i manuali stanno attorno a Diplomazia. */
function itemsFor(cat: string): Item[] {
  const subs: Item[] = SUBCATEGORIES.filter((s) => s.category === cat).map((s) => ({ kind: "sub", s }));
  if (cat !== "towny") return subs;
  const man = (k: string): Item[] => {
    const m = getManual(k);
    return m ? [{ kind: "manual", m }] : [];
  };
  return [...man("sindaco"), ...subs, ...man("governatore")];
}

export const metadata: Metadata = {
  title: "Forum",
  description: "Assistenza, Towny e candidature staff di TiberiusMC: apri una pratica e seguila fino alla risposta dello staff.",
};

export default function Page() {
  return (
    <>
      <ForumHero
        kicker="tiberiusmc · forum"
        title="Forum"
        lead="Assistenza, Towny e candidature staff. Ogni richiesta è privata: la vedete solo tu e lo staff della sezione."
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
          <ul className={`grid gap-4 md:grid-cols-2 ${c.key !== "candidature" ? "lg:grid-cols-3" : ""}`} data-stagger="0.07">
            {itemsFor(c.key).map((it) =>
              it.kind === "sub" ? (
                <li key={it.s.key} className="panel flex flex-col gap-4 p-6 md:p-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl">{it.s.label}</h3>
                    {it.s.sensitive && <PrivateBadge />}
                  </div>
                  <p className="flex-1 text-white/70">{it.s.description}</p>
                  <div>
                    <Btn href={`/forum/nuova/${it.s.key}`} variant="accent" magnetic={false}>
                      nuova richiesta
                    </Btn>
                  </div>
                </li>
              ) : (
                <li key={it.m.key} className="panel flex flex-col gap-4 p-6 md:p-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <BookOpen className="size-5 text-gold" aria-hidden />
                    <h3 className="text-xl">{it.m.label}</h3>
                  </div>
                  <p className="flex-1 text-white/70">{it.m.short}</p>
                  <div>
                    <Btn href={`/forum/manuale/${it.m.key}`} magnetic={false}>
                      leggi il manuale
                    </Btn>
                  </div>
                </li>
              ),
            )}
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
