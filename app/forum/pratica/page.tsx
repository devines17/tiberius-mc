import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FileText, ImageIcon, Lock, Globe, ShieldCheck } from "lucide-react";
import { ForumNav } from "@/components/forum/ForumNav";
import { Notice, PrivateBadge, StatusBadge } from "@/components/forum/bits";
import { Crumbs, Head, RoleTag, SkinBody, SubIcon } from "@/components/forum/zero";
import { ForumLoading, LoginRequired, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { PlayerButtons, PlayerReply, StaffPanel } from "@/components/forum/TicketActions";
import { TicketForm } from "@/components/forum/TicketForm";
import { getTicketView } from "@/lib/server/tickets";
import { HttpError } from "@/lib/server/http";
import { CATEGORIES, formFields, getStatus } from "@/lib/forum/config";
import { formatDate, formatDateTime, PRIORITY_LABEL, statusLabel, timeAgo } from "@/lib/forum/format";
import { requiresReason, ticketCode } from "@/lib/forum/rules";
import type { Attachment } from "@/lib/server/types";

// Mai nei motori di ricerca e mai titoli nei metadata: anche le discussioni pubbliche restano fuori dagli indici.
export const metadata: Metadata = { title: "Discussione", robots: { index: false, follow: false } };

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <div className="pb-20 pt-10">
      <Suspense fallback={<ForumLoading rows={4} />}>
        <Body searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function Attachments({ items }: { items: Attachment[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {items.map((a) => (
        <li key={a.id}>
          <a href={`/api/forum/allegati/${a.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 transition-colors hover:bg-white/10">
            {a.mime.startsWith("image/") ? <ImageIcon className="size-4" aria-hidden /> : <FileText className="size-4" aria-hidden />}
            <span className="max-w-48 truncate">{a.filename}</span>
            <span className="text-white/45">{Math.max(1, Math.round(a.size_bytes / 1024))} KB</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

async function Body({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // Numero nella query (?n=1042): così la rotta non ha parametri dinamici e la testata resta nel guscio statico
  const sp = await searchParams;
  const number = typeof sp.n === "string" && /^\d{1,9}$/.test(sp.n) ? Number(sp.n) : NaN;
  if (!Number.isSafeInteger(number) || number <= 0) notFound();
  const here = `/forum/pratica?n=${number}`;

  const { configured, session, unread } = await forumContext();
  if (!configured) return <NotConfigured />;

  let view;
  try {
    view = await getTicketView(session, number);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      // Senza accesso non si dice se la pratica esiste: potrebbe essere privata
      if (!session) return <LoginRequired next={here} text="Questa discussione non è pubblica, oppure non esiste. Se è una tua richiesta, accedi con Discord per vederla." />;
      notFound();
    }
    throw e;
  }
  const { ticket: t, sub, role } = view;
  const staff = role === "staff";
  const isPublic = Boolean(t.is_public) && t.status !== "bozza";
  const final = getStatus(sub, t.status)?.final ?? false;
  const cat = CATEGORIES.find((c) => c.key === sub.category);
  const fields = formFields(sub).filter((f) => t.fields[f.name]);
  const extraFields = Object.entries(t.fields).filter(([k]) => k.startsWith("domanda_"));
  const byMessage = (id: string) => view.attachments.filter((a) => a.message_id === id);
  const byNote = (id: string) => view.attachments.filter((a) => a.note_id === id);
  const optionLabel = (name: string, v: string) => sub.fields.find((f) => f.name === name)?.options?.find((o) => o.value === v)?.label ?? v;
  const first = view.messages[0];
  const replies = Math.max(0, view.messages.length - 1);
  const postIndex = new Map(view.messages.map((m, i) => [m.id, i + 1]));

  // Cronologia unica: messaggi, cambi di stato e (per lo staff) note interne
  type Item =
    | { kind: "msg"; at: string; m: (typeof view.messages)[number] }
    | { kind: "state"; at: string; h: (typeof view.history)[number] }
    | { kind: "note"; at: string; n: (typeof view.notes)[number] };
  const timeline: Item[] = [
    ...view.messages.map((m) => ({ kind: "msg" as const, at: m.created_at, m })),
    // L'apertura non serve: c'è già il primo messaggio
    ...view.history.filter((h) => h.from_status).map((h) => ({ kind: "state" as const, at: h.created_at, h })),
    ...view.notes.map((n) => ({ kind: "note" as const, at: n.created_at, n })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <div className="forum-in grid gap-6">
      <ForumNav session={session} active={staff ? "staff" : role === "autore" ? "mie" : "home"} unread={unread} next={here} />

      <div className="wrap grid gap-5">
        {sp.nuova && <Notice tone="ok">{sub.openReplies ? "Discussione pubblicata." : "Richiesta inviata. Riceverai una notifica quando lo staff risponde."}</Notice>}

        <Crumbs items={[{ href: "/forum", label: "Forum" }, { label: cat?.label ?? "" }, { href: `/forum/sezione?s=${sub.key}`, label: sub.label }]} />

        <header className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[0.8rem] text-white/50">
            <span className="font-mono">{ticketCode(t.number)}</span>
            <span aria-hidden>·</span>
            {isPublic ? (
              <span className="inline-flex items-center gap-1">
                <Globe className="size-3.5" aria-hidden /> pubblica
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Lock className="size-3.5" aria-hidden /> privata
              </span>
            )}
            {sub.sensitive && <PrivateBadge />}
          </div>
          <div className="flex flex-wrap items-start gap-3">
            <h1 className="min-w-0 flex-1 text-[clamp(1.5rem,3vw,2.2rem)] leading-tight">{t.title}</h1>
            <StatusBadge sub={t.subcategory} status={t.status} />
          </div>
          <p className="flex flex-wrap items-center gap-2 text-sm text-white/55">
            <Head name={first?.card.head ?? t.author_mc_name} size={22} />
            <span className="font-semibold text-white/85">{first?.card.name ?? t.author_mc_name ?? "Giocatore"}</span>
            {t.author_mc_verified ? <ShieldCheck className="size-4 text-emerald-300" aria-label="account Minecraft verificato" /> : null}
            <span aria-hidden>·</span>
            <time dateTime={t.created_at} title={formatDateTime(t.created_at)}>
              {timeAgo(t.created_at)}
            </time>
            <span aria-hidden>·</span>
            <span>
              {replies} {replies === 1 ? "risposta" : "risposte"}
            </span>
          </p>
          {staff && (
            <div className="panel grid gap-x-8 gap-y-2 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-white/50">Aperta il</p>
                <p>{formatDateTime(t.created_at)}</p>
              </div>
              <div>
                <p className="text-white/50">Ultimo aggiornamento</p>
                <p>{formatDateTime(t.updated_at)}</p>
              </div>
              <div>
                <p className="text-white/50">Assegnata · priorità</p>
                <p>
                  {view.assignee?.name ?? "nessuno"} · {PRIORITY_LABEL[t.priority]}
                </p>
              </div>
              {view.authorProfile && (
                <div className="sm:col-span-2 lg:col-span-4 text-xs text-white/45">
                  Discord: {view.authorProfile.discord_username}
                  {view.authorProfile.mc_uuid ? ` · UUID ${view.authorProfile.mc_uuid} (${view.authorProfile.mc_verified_by === "staff" ? "verificato dallo staff" : "verificato in gioco"})` : " · nessun account Minecraft collegato"}
                </div>
              )}
            </div>
          )}
        </header>

        {t.status === "bozza" && (
          <>
            <Notice tone="warn">È una bozza: la vedi solo tu. Completa i campi e inviala allo staff quando sei pronto.</Notice>
            <TicketForm
              meta={{ key: sub.key, label: sub.label, bodyLabel: sub.bodyLabel, notices: [], autoTitle: Boolean(sub.autoTitle), allowsDraft: true, identity: null }}
              fields={formFields(sub)}
              edit={{ number: t.number, title: t.title, body: view.messages[0]?.body ?? "", values: t.fields }}
            />
          </>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="grid min-w-0 gap-4">
            {(fields.length > 0 || extraFields.length > 0) && t.status !== "bozza" && (
              <section className="panel p-5 md:p-6" aria-label="Dati della richiesta">
                <dl className="grid gap-4 sm:grid-cols-2">
                  {fields.map((f) => (
                    <div key={f.name} className={f.type === "textarea" || f.type === "url-list" ? "sm:col-span-2" : ""}>
                      <dt className="text-sm text-white/50">{f.label}</dt>
                      <dd className="whitespace-pre-wrap break-words">
                        {f.type === "url-list"
                          ? t.fields[f.name].split("\n").map((u) => (
                              <a key={u} href={u} target="_blank" rel="noopener noreferrer nofollow ugc" className="link block break-all">
                                {u}
                              </a>
                            ))
                          : optionLabel(f.name, t.fields[f.name])}
                        {t.fields[`${f.name}_verificato_da`] && <span className="ml-2 text-xs text-emerald-300">verificato da {staff ? t.fields[`${f.name}_verificato_da`] : "staff"}</span>}
                      </dd>
                    </div>
                  ))}
                  {extraFields.map(([k, v], i) => (
                    <div key={k} className="sm:col-span-2">
                      <dt className="text-sm text-white/50">Domanda {i + 1}</dt>
                      <dd className="whitespace-pre-wrap break-words">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <ol className="grid gap-4" aria-label="Messaggi">
              {timeline.map((item) =>
                item.kind === "msg" ? (
                  <li key={`m-${item.m.id}`}>
                    <article className={`panel grid md:grid-cols-[11.5rem_minmax(0,1fr)] ${item.m.card.staff ? "!border-accent/35" : ""}`}>
                      <div className="fpost-user flex items-center gap-3 border-b border-white/[0.08] p-4 md:flex-col md:items-center md:gap-2 md:border-b-0 md:border-r md:px-3 md:py-6 md:text-center">
                        <Head name={item.m.card.head} size={44} className="md:hidden" />
                        <SkinBody name={item.m.card.head} className="hidden md:block" />
                        <div className="grid min-w-0 gap-1 md:justify-items-center">
                          <p className={`truncate font-bold ${item.m.card.staff ? "text-[#ff8a80]" : ""}`}>{item.m.card.name}</p>
                          <RoleTag role={item.m.card.role} staff={item.m.card.staff} />
                        </div>
                        {item.m.card.messages != null && (
                          <dl className="ml-auto grid gap-0.5 text-right text-[0.72rem] text-white/45 md:ml-0 md:mt-2 md:w-full md:border-t md:border-white/[0.08] md:pt-3 md:text-center">
                            <div>
                              <dt className="inline">Messaggi </dt>
                              <dd className="inline font-bold text-white/75">{item.m.card.messages}</dd>
                            </div>
                            {item.m.card.since && (
                              <div>
                                <dt className="inline">Dal </dt>
                                <dd className="inline font-bold text-white/75">{formatDate(item.m.card.since)}</dd>
                              </div>
                            )}
                          </dl>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col p-5 md:p-6">
                        <p className="flex-1 whitespace-pre-wrap break-words leading-relaxed text-white/85">{item.m.body}</p>
                        <Attachments items={byMessage(item.m.id)} />
                        <footer className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3 text-xs text-white/40">
                          <time dateTime={item.m.created_at}>{formatDateTime(item.m.created_at)}</time>
                          <span className="font-mono">#{postIndex.get(item.m.id)}</span>
                        </footer>
                      </div>
                    </article>
                  </li>
                ) : item.kind === "state" ? (
                  <li key={`h-${item.h.id}`} className="flex flex-wrap items-baseline justify-center gap-x-2 px-2 text-center text-sm text-white/55">
                    <span>
                      {item.h.actor_name} ha portato la discussione a <strong className="text-white/80">{statusLabel(t.subcategory, item.h.to_status)}</strong>
                      {item.h.reason && <span className="text-white/70">: {item.h.reason}</span>}
                    </span>
                    <time className="text-white/35" dateTime={item.h.created_at}>
                      {timeAgo(item.h.created_at)}
                    </time>
                  </li>
                ) : (
                  <li key={`n-${item.n.id}`} className="rounded-2xl border border-dashed border-gold/40 bg-gold/[0.06] p-5">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-semibold text-gold">Nota interna · {item.n.author_name}</span>
                      <time className="text-white/45">{formatDateTime(item.n.created_at)}</time>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-white/85">{item.n.body}</p>
                    <Attachments items={byNote(item.n.id)} />
                  </li>
                ),
              )}
            </ol>

            {view.canReply ? (
              <PlayerReply
                number={t.number}
                awaitingInfo={role === "autore" && t.status === "info_richieste"}
                label={role === "autore" ? (t.status === "info_richieste" ? undefined : sub.openReplies ? "Rispondi" : undefined) : "Rispondi alla discussione"}
              />
            ) : !staff && t.status !== "bozza" ? (
              <div className="panel flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm text-white/60">
                {final ? (
                  <span className="inline-flex items-center gap-2">
                    <Lock className="size-4" aria-hidden /> Discussione chiusa: non si possono aggiungere risposte.
                  </span>
                ) : !session ? (
                  <>
                    <span>Accedi per rispondere.</span>
                    <a href={`/api/auth/discord/login?next=${encodeURIComponent(here)}`} className="flex h-10 items-center rounded-lg bg-[#5865f2] px-4 font-bold text-white transition-colors hover:bg-[#4752c4]">
                      Accedi con Discord
                    </a>
                  </>
                ) : (
                  <span>In questa sezione rispondono solo chi ha aperto la discussione e lo staff.</span>
                )}
              </div>
            ) : null}
            {role === "autore" && final && !view.playerActions.includes("request_reopen") && t.reopen_requested_at && <Notice>Hai chiesto la riapertura: lo staff valuterà la richiesta.</Notice>}
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            {staff ? (
              <StaffPanel
                number={t.number}
                statuses={view.staffStatuses.map((s) => ({ value: s, label: statusLabel(t.subcategory, s) }))}
                finalStatuses={sub.statuses.filter((s) => s.final).map((s) => s.key)}
                needsReason={view.staffStatuses.filter((s) => requiresReason(t, s))}
                assignee={t.assigned_to}
                staffOptions={view.staffOptions.map((o) => ({ value: o.id, label: o.name }))}
                priority={t.priority}
                isFinal={final}
                reopenRequested={Boolean(t.reopen_requested_at)}
                verifiable={[
                  ...(t.fields.ruolo && !t.fields.ruolo_verificato_da && sub.key === "diplomazia" ? [{ value: "ruolo", label: "conferma ruolo Towny" }] : []),
                  ...(t.fields.nickname && !t.fields.nickname_verificato_da && sub.key === "unban" ? [{ value: "nickname", label: "conferma identità del bannato" }] : []),
                ]}
              />
            ) : (
              <>
                {role === "autore" && <PlayerButtons number={t.number} actions={view.playerActions} withdrawLabel={sub.category === "candidature" ? "ritira la candidatura" : "annulla la richiesta"} />}
                <section className="panel fside">
                  <div className="flex items-center gap-3 p-4">
                    <SubIcon k={sub.key} />
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-white/40">{cat?.label}</p>
                      <Link href={`/forum/sezione?s=${sub.key}`} className="font-bold hover:text-[#ff8a80]">
                        {sub.label}
                      </Link>
                    </div>
                  </div>
                  <p className="border-t border-white/[0.08] px-4 py-3 text-sm leading-relaxed text-white/55">{sub.description}</p>
                </section>
                {role === "autore" && sub.notices.length > 0 && (
                  <div className="grid gap-3">
                    {sub.notices.map((n) => (
                      <Notice key={n}>{n}</Notice>
                    ))}
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
