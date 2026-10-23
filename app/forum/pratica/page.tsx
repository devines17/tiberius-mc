import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FileText, ImageIcon, ShieldCheck } from "lucide-react";
import { ForumNav } from "@/components/forum/ForumNav";
import { Notice, PrivateBadge, StatusBadge } from "@/components/forum/bits";
import { ForumLoading, LoginRequired, NotConfigured } from "@/components/forum/states";
import { forumContext } from "@/components/forum/session";
import { PlayerButtons, PlayerReply, StaffPanel } from "@/components/forum/TicketActions";
import { TicketForm } from "@/components/forum/TicketForm";
import { getTicketView } from "@/lib/server/tickets";
import { HttpError } from "@/lib/server/http";
import { formFields, getStatus } from "@/lib/forum/config";
import { formatDateTime, PRIORITY_LABEL, statusLabel } from "@/lib/forum/format";
import { requiresReason, ticketCode } from "@/lib/forum/rules";
import type { Attachment } from "@/lib/server/types";

// Le pratiche sono private: mai nei motori di ricerca, mai titoli nei metadata.
export const metadata: Metadata = { title: "Pratica", robots: { index: false, follow: false } };

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

  const { configured, session, unread } = await forumContext();
  if (!configured) return <NotConfigured />;
  if (!session) return <LoginRequired next={`/forum/pratica?n=${number}`} />;

  let view;
  try {
    view = await getTicketView(session, number);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  }
  const { ticket: t, sub, role } = view;
  const staff = role === "staff";
  const final = getStatus(sub, t.status)?.final ?? false;
  const fields = formFields(sub).filter((f) => t.fields[f.name]);
  const extraFields = Object.entries(t.fields).filter(([k]) => k.startsWith("domanda_"));
  const byMessage = (id: string) => view.attachments.filter((a) => a.message_id === id);
  const byNote = (id: string) => view.attachments.filter((a) => a.note_id === id);
  const optionLabel = (name: string, v: string) => sub.fields.find((f) => f.name === name)?.options?.find((o) => o.value === v)?.label ?? v;

  // Cronologia unica: messaggi, cambi di stato e (per lo staff) note interne
  type Item =
    | { kind: "msg"; at: string; m: (typeof view.messages)[number] }
    | { kind: "state"; at: string; h: (typeof view.history)[number] }
    | { kind: "note"; at: string; n: (typeof view.notes)[number] };
  const timeline: Item[] = [
    ...view.messages.map((m) => ({ kind: "msg" as const, at: m.created_at, m })),
    ...view.history.map((h) => ({ kind: "state" as const, at: h.created_at, h })),
    ...view.notes.map((n) => ({ kind: "note" as const, at: n.created_at, n })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <div className="forum-in grid gap-8">
      <ForumNav session={session} active={staff ? "staff" : "mie"} unread={unread} />

      <div className="wrap grid gap-6">
        {sp.nuova && <Notice tone="ok">Richiesta inviata. Riceverai una notifica quando lo staff risponde.</Notice>}

        <header className="panel grid gap-4 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/55">
            <span className="font-mono">{ticketCode(t.number)}</span>
            <span>·</span>
            <Link href="/forum" className="hover:text-white">
              {sub.label}
            </Link>
            {sub.sensitive && <PrivateBadge />}
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-[length:var(--step-head)]">{t.title}</h1>
            <StatusBadge sub={t.subcategory} status={t.status} />
          </div>
          <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-white/50">Aperta il</dt>
              <dd>{formatDateTime(t.created_at)}</dd>
            </div>
            <div>
              <dt className="text-white/50">Ultimo aggiornamento</dt>
              <dd>{formatDateTime(t.updated_at)}</dd>
            </div>
            <div>
              <dt className="text-white/50">Richiedente</dt>
              <dd>
                {t.author_mc_name ?? view.authorProfile?.discord_username ?? "tu"}
                {t.author_mc_verified ? <ShieldCheck className="ml-1 inline size-4 text-emerald-300" aria-label="account verificato" /> : null}
              </dd>
            </div>
            {staff && (
              <div>
                <dt className="text-white/50">Assegnata · priorità</dt>
                <dd>
                  {view.assignee?.name ?? "nessuno"} · {PRIORITY_LABEL[t.priority]}
                </dd>
              </div>
            )}
          </dl>
          {staff && view.authorProfile && (
            <p className="text-xs text-white/45">
              Discord: {view.authorProfile.discord_username}
              {view.authorProfile.mc_uuid ? ` · UUID ${view.authorProfile.mc_uuid} (${view.authorProfile.mc_verified_by === "staff" ? "verificato dallo staff" : "verificato in gioco"})` : " · nessun account Minecraft collegato"}
            </p>
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

        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div className="grid gap-6">
            {(fields.length > 0 || extraFields.length > 0) && t.status !== "bozza" && (
              <section className="panel p-6 md:p-8" aria-label="Dati della richiesta">
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

            <section className="grid gap-3" aria-label="Cronologia">
              <h2 className="text-xl">Cronologia</h2>
              <ol className="grid gap-3">
                {timeline.map((item) =>
                  item.kind === "msg" ? (
                    <li key={`m-${item.m.id}`} className={`panel p-5 md:p-6 ${item.m.is_staff ? "border-accent/30" : ""}`}>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className={`font-semibold ${item.m.is_staff ? "text-[#ff8a80]" : ""}`}>{item.m.author_name}</span>
                        <time className="text-white/45" dateTime={item.m.created_at}>
                          {formatDateTime(item.m.created_at)}
                        </time>
                      </div>
                      <p className="whitespace-pre-wrap break-words leading-relaxed text-white/85">{item.m.body}</p>
                      <Attachments items={byMessage(item.m.id)} />
                    </li>
                  ) : item.kind === "state" ? (
                    <li key={`h-${item.h.id}`} className="flex flex-wrap items-baseline gap-x-2 px-2 text-sm text-white/55">
                      <span className="size-1.5 translate-y-[-2px] rounded-full bg-white/30" aria-hidden />
                      <span>
                        {item.h.from_status ? (
                          <>
                            {item.h.actor_name} ha portato la pratica a <strong className="text-white/80">{statusLabel(t.subcategory, item.h.to_status)}</strong>
                          </>
                        ) : (
                          <>Pratica aperta ({statusLabel(t.subcategory, item.h.to_status)})</>
                        )}
                        {item.h.reason && <span className="text-white/70"> — {item.h.reason}</span>}
                      </span>
                      <time className="text-white/35" dateTime={item.h.created_at}>
                        {formatDateTime(item.h.created_at)}
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
            </section>

            {!staff && view.playerActions.includes("reply") && <PlayerReply number={t.number} awaitingInfo={t.status === "info_richieste"} />}
            {!staff && final && !view.playerActions.includes("request_reopen") && t.reopen_requested_at && (
              <Notice>Hai chiesto la riapertura: lo staff valuterà la richiesta.</Notice>
            )}
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
                <PlayerButtons number={t.number} actions={view.playerActions} withdrawLabel={sub.category === "candidature" ? "ritira la candidatura" : "annulla la richiesta"} />
                {sub.notices.length > 0 && (
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
