import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ClipboardList, ExternalLink, Hammer, LayoutDashboard, Megaphone, Settings, Users } from "lucide-react";
import { PageHead } from "@/components/ui/PageHead";
import { ForumLoading, LoginRequired, NotConfigured } from "@/components/forum/states";
import { Notice } from "@/components/forum/bits";
import { Head } from "@/components/forum/zero";
import { ActionForm, ImageUpload } from "@/components/gestionale/ActionForm";
import { Progress, ProjectBadge, RoleBadge, TownEmblem } from "@/components/gestionale/parts";
import { forumContext } from "@/components/forum/session";
import { formatDate, timeAgo } from "@/lib/forum/format";
import { can, isManager, LIMITS, PROJECT_STATUS, projectProgress, TOWN_STATUS_LABEL } from "@/lib/gestionale/config";
import {
  imageUrl,
  myApplications,
  myMembership,
  overview,
  townApplications,
  townMembers,
  townPosts,
  townProjects,
  type Membership,
} from "@/lib/server/towns";

export const metadata: Metadata = { title: "Gestionale", robots: { index: false, follow: false } };

type SP = Promise<Record<string, string | string[] | undefined>>;

const TABS = [
  { key: "panoramica", label: "Panoramica", icon: LayoutDashboard },
  { key: "bacheca", label: "Bacheca", icon: Megaphone },
  { key: "cantieri", label: "Cantieri", icon: Hammer },
  { key: "cittadini", label: "Cittadini", icon: Users },
  { key: "impostazioni", label: "Scheda pubblica", icon: Settings },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageHead tone="field" kicker="area privata" title="Gestionale" lead="La tua città sul sito: cittadini, candidature, bacheca e cantieri. La vedete solo tu e chi ne fa parte." art="/images/art/town.png" />
      <div className="pb-20">
        <Suspense fallback={<ForumLoading rows={3} />}>
          <Body searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Body({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { configured, session } = await forumContext();
  if (!configured) return <NotConfigured />;
  if (!session) return <LoginRequired next="/portale" text="Il gestionale usa lo stesso accesso del forum: entra con il tuo account Discord." />;

  const m = await myMembership(session);
  if (!m) return <NoTown session={session} />;
  if (m.town.status !== "attiva") {
    return (
      <div className="wrap grid gap-4">
        <Notice tone="warn">
          <strong>{m.town.name}</strong>: {TOWN_STATUS_LABEL[m.town.status]}. Lo staff controlla in gioco che tu sia davvero il sindaco, poi la città si attiva e riceverai una notifica.
        </Notice>
      </div>
    );
  }

  const tab: Tab = TABS.some((t) => t.key === sp.t) ? (sp.t as Tab) : "panoramica";
  const visibleTabs = TABS.filter((t) => t.key !== "impostazioni" || can(m.role, "modifica_citta"));
  const apps = isManager(m.role) ? await townApplications(session) : [];

  return (
    <div className="wrap grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
      <aside className="panel p-3">
        <div className="flex items-center gap-3 border-b border-white/10 px-2 pb-3">
          <TownEmblem town={m.town} size={44} />
          <div className="min-w-0">
            <p className="truncate font-bold">{m.town.name}</p>
            <RoleBadge role={m.role} />
          </div>
        </div>
        <nav aria-label="Gestionale" className="mt-2 flex gap-1 overflow-x-auto lg:grid">
          {visibleTabs.map(({ key, label, icon: Icon }) => (
            <Link
              key={key}
              href={`/portale?t=${key}`}
              aria-current={tab === key ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${tab === key ? "bg-accent text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
            >
              <Icon className="size-4" aria-hidden />
              {label}
              {key === "cittadini" && apps.length > 0 && <span className="ml-auto rounded-full bg-gold px-1.5 text-[0.7rem] font-bold leading-5 text-black">{apps.length}</span>}
            </Link>
          ))}
          <Link href={`/citta/vedi?c=${m.town.slug}`} className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/50 hover:text-white">
            <ExternalLink className="size-4" aria-hidden /> Vedi la scheda pubblica
          </Link>
        </nav>
      </aside>

      <div className="min-w-0">
        {tab === "panoramica" && <Overview m={m} pending={apps.length} />}
        {tab === "bacheca" && <Board m={m} me={session.profile.id} />}
        {tab === "cantieri" && <Projects m={m} />}
        {tab === "cittadini" && <Citizens m={m} me={session.profile.id} apps={apps} />}
        {tab === "impostazioni" && can(m.role, "modifica_citta") && <TownSettings m={m} />}
      </div>
    </div>
  );
}

function Box({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="panel p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const field = "field";
const label = "grid gap-1.5 text-sm font-semibold";

/* ------------------------------------------------------------------ */

async function NoTown({ session }: { session: NonNullable<Awaited<ReturnType<typeof forumContext>>["session"]> }) {
  const apps = await myApplications(session);
  const pending = apps.filter((a) => a.status === "in_attesa");
  return (
    <div className="wrap grid gap-6">
      {pending.length > 0 && (
        <Box title="Le tue candidature">
          <ul className="grid gap-2">
            {pending.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white/[0.03] px-4 py-3">
                <span>
                  <Link href={`/citta/vedi?c=${a.towns.slug}`} className="font-semibold hover:underline">
                    {a.towns.name}
                  </Link>
                  <span className="text-sm text-white/50"> · inviata {timeAgo(a.created_at)}</span>
                </span>
                <ActionForm azione="ritira_candidatura">
                  <input type="hidden" name="id" value={a.id} />
                  <button className="text-sm font-semibold text-white/55 hover:text-white">ritira</button>
                </ActionForm>
              </li>
            ))}
          </ul>
        </Box>
      )}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Box title="Registra la tua città">
          <p className="mb-4 text-sm leading-relaxed text-white/60">
            Sei sindaco di una città sul server? Registrala qui. Lo staff controlla in gioco che sia davvero tua, poi la città compare nell&apos;elenco pubblico e puoi gestirla da qui.
          </p>
          <ActionForm azione="registra" className="grid gap-4" ok="Registrazione inviata allo staff.">
            <label className={label}>
              Nome della città (uguale a quello in gioco)
              <input name="name" required maxLength={LIMITS.name} className={field} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>
                Motto <span className="font-normal text-white/45">(facoltativo)</span>
                <input name="motto" maxLength={LIMITS.motto} className={field} />
              </label>
              <label className={label}>
                Nazione <span className="font-normal text-white/45">(se ne fa parte)</span>
                <input name="nation" maxLength={LIMITS.nation} className={field} />
              </label>
            </div>
            <label className={label}>
              Descrizione
              <textarea name="description" required minLength={20} maxLength={LIMITS.description} className={`${field} min-h-32`} placeholder="Dove si trova, che stile ha, che tipo di giocatori cerca…" />
            </label>
            <button type="submit" className="btn btn-accent w-fit">
              invia allo staff
            </button>
          </ActionForm>
        </Box>
        <Box title="Entra in una città">
          <p className="mb-4 text-sm leading-relaxed text-white/60">Guarda le città del server, leggi le loro schede e chiedi di entrare in quella che ti piace. Il sindaco riceve la richiesta e ti risponde.</p>
          <Link href="/citta" className="btn">
            vedi le città
          </Link>
        </Box>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

async function Overview({ m, pending }: { m: Membership; pending: number }) {
  const o = await overview(m);
  const active = o.projects.filter((p) => p.status === "in_corso");
  const stalled = o.projects.filter((p) => p.status === "fermo");
  const todo: { text: string; href: string }[] = [];
  if (isManager(m.role) && pending) todo.push({ text: `${pending} ${pending === 1 ? "candidatura" : "candidature"} da valutare`, href: "/portale?t=cittadini" });
  if (stalled.length) todo.push({ text: `${stalled.length} ${stalled.length === 1 ? "cantiere fermo" : "cantieri fermi"}`, href: "/portale?t=cantieri" });
  if (m.role === "sindaco" && !m.town.emblem_path) todo.push({ text: "Carica lo stemma della città", href: "/portale?t=impostazioni" });
  if (m.role === "sindaco" && !m.town.photos.length) todo.push({ text: "Aggiungi qualche foto alla scheda pubblica", href: "/portale?t=impostazioni" });

  const stat = (n: number | string, l: string) => (
    <div className="panel p-4">
      <p className="text-2xl font-bold">{n}</p>
      <p className="text-sm text-white/55">{l}</p>
    </div>
  );
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stat(o.members.length, o.members.length === 1 ? "cittadino" : "cittadini")}
        {stat(active.length, "cantieri in corso")}
        {stat(o.projects.filter((p) => p.status === "completato").length, "cantieri completati")}
        {stat(isManager(m.role) ? pending : "—", "candidature in attesa")}
      </div>
      {todo.length > 0 && (
        <Box title="Da fare">
          <ul className="grid gap-2">
            {todo.map((t) => (
              <li key={t.text}>
                <Link href={t.href} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-4 py-3 text-sm font-semibold hover:bg-white/[0.06]">
                  <ClipboardList className="size-4 text-gold" aria-hidden /> {t.text}
                </Link>
              </li>
            ))}
          </ul>
        </Box>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <Box title="Ultimi messaggi" action={<Link href="/portale?t=bacheca" className="text-sm font-semibold text-white/55 hover:text-white">bacheca →</Link>}>
          {o.latestPosts.length ? (
            <ul className="grid gap-3">
              {o.latestPosts.map((p) => (
                <li key={p.id} className="text-sm">
                  <p className="text-white/50">
                    {p.pinned && <span className="mr-1 font-bold text-gold">Annuncio ·</span>}
                    {p.name} · {timeAgo(p.created_at)}
                  </p>
                  <p className="line-clamp-2 text-white/80">{p.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/50">Ancora nessun messaggio.</p>
          )}
        </Box>
        <Box title="Cantieri in corso" action={<Link href="/portale?t=cantieri" className="text-sm font-semibold text-white/55 hover:text-white">cantieri →</Link>}>
          {active.length ? (
            <ul className="grid gap-4">
              {active.slice(0, 4).map((p) => (
                <li key={p.id} className="grid gap-1.5">
                  <p className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold">{p.title}</span>
                    <span className="text-white/50">{projectProgress(p.items)}%</span>
                  </p>
                  <Progress value={projectProgress(p.items)} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/50">Nessun cantiere in corso.</p>
          )}
        </Box>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

async function Board({ m, me }: { m: Membership; me: string }) {
  const posts = await townPosts(m.town.id);
  return (
    <div className="grid gap-6">
      <Box title="Scrivi in bacheca">
        <ActionForm azione="scrivi" className="grid gap-3">
          <textarea name="body" required maxLength={LIMITS.post} className="field min-h-24" placeholder="Scrivi ai cittadini…" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            {can(m.role, "fissa_post") ? (
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" name="annuncio" value="1" className="size-4 accent-[#e2352b]" /> Annuncio fissato in alto (avvisa tutti i cittadini)
              </label>
            ) : (
              <span />
            )}
            <button type="submit" className="btn btn-accent !h-10 !text-xs">
              pubblica
            </button>
          </div>
        </ActionForm>
      </Box>
      {posts.length === 0 && <p className="text-white/50">La bacheca è vuota: scrivi il primo messaggio.</p>}
      {posts.map((p) => (
        <article key={p.id} className={`panel p-5 ${p.pinned ? "!border-gold/40" : ""}`}>
          <header className="flex flex-wrap items-center gap-2.5 text-sm">
            <Head name={p.mc} size={26} />
            <span className="font-semibold">{p.name}</span>
            {p.role && p.role !== "cittadino" && <RoleBadge role={p.role} />}
            <span className="text-white/45">· {timeAgo(p.created_at)}</span>
            {p.pinned && <span className="ml-auto rounded bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold">Annuncio</span>}
          </header>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-white/85">{p.body}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/45">
            {can(m.role, "fissa_post") && (
              <ActionForm azione="fissa">
                <input type="hidden" name="id" value={p.id} />
                <button className="hover:text-white">{p.pinned ? "togli dall'alto" : "fissa in alto"}</button>
              </ActionForm>
            )}
            {(p.author_id === me || can(m.role, "elimina_post_altrui")) && (
              <ActionForm azione="elimina_post" confirm="Eliminare il messaggio e le sue risposte?">
                <input type="hidden" name="id" value={p.id} />
                <button className="hover:text-[#ff8a80]">elimina</button>
              </ActionForm>
            )}
          </div>
          {p.replies.length > 0 && (
            <ul className="mt-4 grid gap-3 border-l-2 border-white/10 pl-4">
              {p.replies.map((r) => (
                <li key={r.id} className="text-sm">
                  <p className="flex flex-wrap items-center gap-2 text-white/50">
                    <span className="font-semibold text-white/80">{r.name}</span> · {timeAgo(r.created_at)}
                    {(r.author_id === me || can(m.role, "elimina_post_altrui")) && (
                      <ActionForm azione="elimina_post">
                        <input type="hidden" name="id" value={r.id} />
                        <button className="text-xs hover:text-[#ff8a80]">elimina</button>
                      </ActionForm>
                    )}
                  </p>
                  <p className="whitespace-pre-line text-white/80">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
          <ActionForm azione="scrivi" className="mt-4 flex gap-2">
            <input type="hidden" name="parent" value={p.id} />
            <input name="body" required maxLength={LIMITS.post} placeholder="Rispondi…" className="field !h-10 flex-1" />
            <button type="submit" className="btn !h-10 !text-xs">
              invia
            </button>
          </ActionForm>
        </article>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

async function Projects({ m }: { m: Membership }) {
  const [projects, members] = await Promise.all([townProjects(m.town.id), townMembers(m.town.id)]);
  const manage = can(m.role, "gestisci_cantieri");
  return (
    <div className="grid gap-6">
      {manage && (
        <Box title="Nuovo cantiere">
          <ActionForm azione="nuovo_cantiere" className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>
                Nome del cantiere
                <input name="title" required maxLength={LIMITS.projectTitle} className={field} placeholder="Mura nord" />
              </label>
              <label className={label}>
                Dove <span className="font-normal text-white/45">(coordinate o zona)</span>
                <input name="location" maxLength={LIMITS.location} className={field} placeholder="x 120, z -340" />
              </label>
            </div>
            <label className={label}>
              Responsabile
              <select name="lead" className={field} defaultValue="">
                <option value="">Nessuno</option>
                {members.map((c) => (
                  <option key={c.profile_id} value={c.profile_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              Descrizione <span className="font-normal text-white/45">(facoltativa)</span>
              <textarea name="description" maxLength={LIMITS.projectText} className={`${field} min-h-20`} />
            </label>
            <label className={label}>
              Materiali che servono <span className="font-normal text-white/45">(uno per riga, es. &quot;640 pietra&quot;)</span>
              <textarea name="items" className={`${field} min-h-24 font-mono text-sm`} placeholder={"640 pietra\n128 legno di quercia\n32 lanterne"} />
            </label>
            <button type="submit" className="btn btn-accent w-fit">
              crea il cantiere
            </button>
          </ActionForm>
        </Box>
      )}
      {projects.length === 0 && <p className="text-white/50">Ancora nessun cantiere.</p>}
      {PROJECT_STATUS.map((s) => {
        const list = projects.filter((p) => p.status === s.key);
        if (!list.length) return null;
        return (
          <section key={s.key} className="grid gap-3">
            <h2 className="text-sm font-bold uppercase text-white/55">
              {s.label} · {list.length}
            </h2>
            {list.map((p) => {
              const pct = projectProgress(p.items);
              return (
                <article key={p.id} className="panel grid gap-4 p-5">
                  <header className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold">{p.title}</h3>
                      <p className="text-sm text-white/50">
                        {p.location && <>{p.location} · </>}
                        {p.lead ? `responsabile ${p.lead}` : "nessun responsabile"} · aggiornato {timeAgo(p.updated_at)}
                      </p>
                    </div>
                    <ProjectBadge status={p.status} />
                  </header>
                  {p.description && <p className="whitespace-pre-line text-sm text-white/75">{p.description}</p>}
                  {p.items.length > 0 && (
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3">
                        <Progress value={pct} />
                        <span className="w-10 shrink-0 text-right text-sm font-bold">{pct}%</span>
                      </div>
                      <ul className="grid gap-1.5 sm:grid-cols-2">
                        {p.items.map((it) => (
                          <li key={it.id}>
                            <ActionForm azione="materiale" resetOnSuccess={false} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-sm">
                              <input type="hidden" name="id" value={it.id} />
                              <span className={`min-w-0 flex-1 truncate ${it.done >= it.needed ? "text-emerald-300" : ""}`}>{it.name}</span>
                              <input
                                name="done"
                                type="number"
                                min={0}
                                max={1000000}
                                defaultValue={it.done}
                                aria-label={`Quantità portata di ${it.name}`}
                                className="h-8 w-20 rounded border border-white/10 bg-black/30 px-2 text-right text-sm"
                              />
                              <span className="text-white/45">/ {it.needed}</span>
                              <button className="rounded bg-white/10 px-2 py-1 text-xs font-bold hover:bg-white/20">ok</button>
                            </ActionForm>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {manage && (
                    <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-3 text-sm">
                      <ActionForm azione="stato_cantiere" resetOnSuccess={false} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={p.id} />
                        <select name="status" defaultValue={p.status} className="h-9 rounded border border-white/10 bg-black/30 px-2 text-sm">
                          {PROJECT_STATUS.map((x) => (
                            <option key={x.key} value={x.key}>
                              {x.label}
                            </option>
                          ))}
                        </select>
                        <button className="rounded bg-white/10 px-2.5 py-1.5 text-xs font-bold hover:bg-white/20">cambia stato</button>
                      </ActionForm>
                      <ActionForm azione="elimina_cantiere" confirm={`Eliminare il cantiere "${p.title}"?`} className="ml-auto">
                        <input type="hidden" name="id" value={p.id} />
                        <button className="text-xs text-white/45 hover:text-[#ff8a80]">elimina cantiere</button>
                      </ActionForm>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */

async function Citizens({ m, me, apps }: { m: Membership; me: string; apps: Awaited<ReturnType<typeof townApplications>> }) {
  const members = await townMembers(m.town.id);
  return (
    <div className="grid gap-6">
      {isManager(m.role) && (
        <Box title={`Candidature${apps.length ? ` · ${apps.length}` : ""}`}>
          {apps.length ? (
            <ul className="grid gap-3">
              {apps.map((a) => (
                <li key={a.id} className="grid gap-3 rounded-lg bg-white/[0.03] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold">
                      <Head name={a.mc} size={24} /> {a.name}
                      <span className="text-sm font-normal text-white/45">· {timeAgo(a.created_at)}</span>
                    </p>
                    {a.message && <p className="mt-1 whitespace-pre-line text-sm text-white/70">{a.message}</p>}
                  </div>
                  <div className="flex gap-2">
                    <ActionForm azione="decidi_candidatura">
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="esito" value="accetta" />
                      <button className="btn btn-accent !h-9 !px-4 !text-xs">accetta</button>
                    </ActionForm>
                    <ActionForm azione="decidi_candidatura" confirm={`Rifiutare la candidatura di ${a.name}?`}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="esito" value="rifiuta" />
                      <button className="btn !h-9 !px-4 !text-xs">rifiuta</button>
                    </ActionForm>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/50">Nessuna candidatura in attesa.</p>
          )}
        </Box>
      )}
      <Box title={`Cittadini · ${members.length}`}>
        <ul className="divide-y divide-white/[0.07]">
          {members.map((c) => (
            <li key={c.profile_id} className="flex flex-wrap items-center gap-3 py-3">
              <Head name={c.mc} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{c.name}</p>
                <p className="text-xs text-white/45">nella città dal {formatDate(c.joined_at)}</p>
              </div>
              <RoleBadge role={c.role} />
              {c.profile_id !== me && c.role !== "sindaco" && (
                <div className="flex gap-3 text-xs text-white/50">
                  {can(m.role, "ruoli") && (
                    <ActionForm azione="ruolo">
                      <input type="hidden" name="profile" value={c.profile_id} />
                      <input type="hidden" name="role" value={c.role === "assistente" ? "cittadino" : "assistente"} />
                      <button className="hover:text-white">{c.role === "assistente" ? "togli assistente" : "rendi assistente"}</button>
                    </ActionForm>
                  )}
                  {can(m.role, c.role === "assistente" ? "rimuovi_assistente" : "rimuovi_cittadino") && (
                    <ActionForm azione="rimuovi" confirm={`Togliere ${c.name} dalla città?`}>
                      <input type="hidden" name="profile" value={c.profile_id} />
                      <button className="hover:text-[#ff8a80]">rimuovi</button>
                    </ActionForm>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-white/40">Per ora l&apos;elenco è quello del sito. Quando il server sarà collegato, cittadini e ruoli arriveranno direttamente da Towny.</p>
      </Box>
      {can(m.role, "lascia") && (
        <ActionForm azione="lascia" confirm={`Vuoi davvero lasciare ${m.town.name} sul sito?`}>
          <button className="text-sm font-semibold text-white/50 hover:text-[#ff8a80]">Lascia la città</button>
        </ActionForm>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function TownSettings({ m }: { m: Membership }) {
  const t = m.town;
  return (
    <div className="grid gap-6">
      <Box title="Stemma">
        <div className="flex flex-wrap items-center gap-5">
          <TownEmblem town={t} size={80} />
          <div className="grid gap-2">
            <ImageUpload azione="stemma" label={t.emblem_path ? "cambia stemma" : "carica stemma"} />
            <p className="text-xs text-white/45">PNG con sfondo trasparente, quadrato, fino a 4 MB.</p>
          </div>
        </div>
      </Box>
      <Box title="Scheda pubblica">
        <ActionForm azione="impostazioni" resetOnSuccess={false} ok="Salvato." className="grid gap-4">
          <p className="text-sm text-white/55">
            Nome: <strong className="text-white">{t.name}</strong> (per cambiarlo scrivi allo staff)
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              Motto
              <input name="motto" defaultValue={t.motto} maxLength={LIMITS.motto} className={field} />
            </label>
            <label className={label}>
              Nazione
              <input name="nation" defaultValue={t.nation} maxLength={LIMITS.nation} className={field} />
            </label>
          </div>
          <label className={label}>
            Descrizione
            <textarea name="description" defaultValue={t.description} required minLength={20} maxLength={LIMITS.description} className={`${field} min-h-40`} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="recruiting" value="1" defaultChecked={t.recruiting} className="size-4 accent-[#e2352b]" /> La città cerca nuovi cittadini (si può chiedere di entrare)
          </label>
          <button type="submit" className="btn btn-accent w-fit">
            salva
          </button>
        </ActionForm>
      </Box>
      <Box title={`Foto · ${t.photos.length}/${LIMITS.photos}`} action={t.photos.length < LIMITS.photos ? <ImageUpload azione="foto" label="aggiungi foto" /> : undefined}>
        {t.photos.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {t.photos.map((p) => (
              <li key={p} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl(p) ?? ""} alt="" className="aspect-video w-full rounded-lg object-cover" />
                <ActionForm azione="togli_foto" confirm="Togliere questa foto?" className="absolute right-2 top-2">
                  <input type="hidden" name="path" value={p} />
                  <button className="rounded bg-black/70 px-2 py-1 text-xs font-bold hover:bg-accent">togli</button>
                </ActionForm>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/50">Mostra le vostre costruzioni migliori: le foto compaiono nella scheda pubblica.</p>
        )}
      </Box>
    </div>
  );
}
