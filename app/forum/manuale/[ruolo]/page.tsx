import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ForumHero } from "@/components/forum/ForumHero";
import { Btn } from "@/components/ui/Btn";
import { Notice } from "@/components/forum/bits";
import { getManual, MANUALS } from "@/lib/forum/manuali";

export function generateStaticParams() {
  return MANUALS.map((m) => ({ ruolo: m.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ ruolo: string }> }): Promise<Metadata> {
  const m = getManual((await params).ruolo);
  return m ? { title: m.label, description: m.short } : {};
}

export default async function Page({ params }: { params: Promise<{ ruolo: string }> }) {
  const m = getManual((await params).ruolo);
  if (!m) notFound();
  const [first, ...rest] = m.label.toLowerCase().split(" ");
  return (
    <>
      <ForumHero kicker="forum · towny" title={`${first}\n${rest.join(" ")}.`} lead={m.lead} />
      <div className="wrap grid gap-10 pb-20 pt-10 lg:grid-cols-[16rem_1fr] lg:items-start">
        <nav aria-label="Indice" className="panel grid gap-1 p-4 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          {m.sections.map((s, i) => (
            <a key={s.title} href={`#s${i}`} className="rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white">
              {s.title}
            </a>
          ))}
        </nav>
        <div className="grid gap-6">
          <Notice>Comandi standard di Towny. Costi, limiti e ranghi dipendono dalla configurazione del server: per qualsiasi dubbio apri una richiesta di assistenza.</Notice>
          {m.sections.map((s, i) => (
            <section key={s.title} id={`s${i}`} className="panel grid scroll-mt-[calc(var(--header-h)+1.5rem)] gap-4 p-6 md:p-8" data-reveal="up">
              <h2 className="text-xl md:text-2xl">{s.title}</h2>
              {s.text && <p className="leading-relaxed text-white/75">{s.text}</p>}
              {s.cmds && (
                <dl className="grid divide-y divide-white/10 overflow-hidden rounded-xl bg-black/25 ring-1 ring-white/10">
                  {s.cmds.map((c) => (
                    <div key={c.cmd} className="grid gap-1 px-4 py-3 md:grid-cols-[minmax(0,18rem)_1fr] md:gap-6">
                      <dt>
                        <code className="break-words font-mono text-sm text-[#ffb4ad]">{c.cmd}</code>
                      </dt>
                      <dd className="text-sm text-white/70">{c.desc}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {s.tips && (
                <ul className="grid gap-2 text-sm text-white/70">
                  {s.tips.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <div className="flex flex-wrap gap-3">
            <Btn href="/forum/nuova/diplomazia" variant="accent">
              apri una pratica di diplomazia
            </Btn>
            <Link href="/forum" className="btn">
              torna al forum
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
