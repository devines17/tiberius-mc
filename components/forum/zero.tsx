/** Pezzi del forum in stile classico: teste, righe delle discussioni, paginazione, barra laterale. */

import Link from "next/link";
import type { ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  Bug,
  ChevronRight,
  Clapperboard,
  Coffee,
  FolderOpen,
  Gavel,
  Flag,
  Handshake,
  LifeBuoy,
  Lightbulb,
  PenLine,
  ShieldCheck,
  ShieldPlus,
  ShoppingBag,
  UserRound,
  Users,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { displayName, type Session } from "@/lib/server/auth";
import { timeAgo } from "@/lib/forum/format";
import { isAdmin, isStaff } from "@/lib/forum/rules";
import { forumStats, onlineNow, staffRoleFor, type ThreadRow } from "@/lib/server/tickets";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { StatusBadge } from "./bits";

/* ------------------------------------------------------------------ */

const steve = "MHF_Steve";

/** Nick per la testa: quello Minecraft collegato, oppure quello dello staff in elenco (stesso nick del gioco). */
export function headOf(p: { mc_name: string | null; discord_username: string }): string | null {
  return p.mc_name ?? staffRoleFor(displayName(p))?.head ?? null;
}

/** Testa Minecraft del giocatore (Steve se non ha collegato l'account). */
export function Head({ name, size = 32, className = "" }: { name: string | null | undefined; size?: number; className?: string }) {
  const n = name && /^[A-Za-z0-9_]{3,16}$/.test(name) ? name : steve;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`https://mc-heads.net/avatar/${n}/${Math.min(size * 2, 128)}`} alt="" width={size} height={size} loading="lazy" className={`fhead shrink-0 rounded-md bg-white/5 ${className}`} style={{ width: size, height: size }} />
  );
}

/** Figura intera della skin, per la scheda autore dei messaggi. */
export function SkinBody({ name, className = "" }: { name: string | null | undefined; className?: string }) {
  const n = name && /^[A-Za-z0-9_]{3,16}$/.test(name) ? name : steve;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`https://mc-heads.net/body/${n}/120`} alt="" width={60} height={120} loading="lazy" className={`fhead h-[120px] w-auto drop-shadow-[0_10px_14px_rgb(0_0_0/0.5)] ${className}`} />;
}

const ICONS: Record<string, LucideIcon> = {
  assistenza_generale: LifeBuoy,
  bug: Bug,
  unban: Gavel,
  segnalazioni: Flag,
  cambio_nick: PenLine,
  store: ShoppingBag,
  diplomazia: Handshake,
  salotto: Coffee,
  proposte: Lightbulb,
  candidature: ShieldPlus,
  candidature_media: Clapperboard,
  manuale: BookOpen,
};

export function SubIcon({ k, big = false }: { k: string; big?: boolean }) {
  const Icon = ICONS[k] ?? LifeBuoy;
  return (
    <span className={`grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent/30 to-accent/5 text-[#ff8a80] ring-1 ring-inset ring-accent/30 ${big ? "size-14" : "size-11"}`}>
      <Icon className={big ? "size-7" : "size-5"} aria-hidden />
    </span>
  );
}

export function RoleTag({ role, staff }: { role: string; staff: boolean }) {
  return (
    <span className={`font-badge inline-flex items-center rounded-md px-2 py-0.5 text-[0.68rem] uppercase tracking-wider ${staff ? "bg-accent text-white" : "bg-white/10 text-white/70"}`}>
      {role}
    </span>
  );
}

export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Percorso" className="flex flex-wrap items-center gap-1.5 text-sm text-white/55">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="size-3.5 text-white/30" aria-hidden />}
          {it.href ? (
            <Link href={it.href} className="transition-colors hover:text-white">
              {it.label}
            </Link>
          ) : (
            <span className="text-white/85">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Righe delle discussioni pubbliche (sezione, ultimi post). */
export function ThreadList({ rows, empty, showSection }: { rows: ThreadRow[]; empty: ReactNode; showSection?: (key: string) => string }) {
  if (!rows.length) return <div className="px-6 py-12 text-center text-white/55">{empty}</div>;
  return (
    <ul className="divide-y divide-white/[0.07]">
      {rows.map((t) => (
        <li key={t.number} className="frow relative grid gap-3 px-4 py-4 sm:grid-cols-[1fr_6.5rem_12rem] sm:items-center sm:gap-5 md:px-5">
          <div className="flex min-w-0 items-center gap-3.5">
            <Head name={t.author_mc} size={40} />
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <StatusBadge sub={t.subcategory} status={t.status} />
                <Link href={`/forum/pratica?n=${t.number}`} className="min-w-0 truncate font-bold text-white after:absolute after:inset-0 hover:text-[#ff8a80]">
                  {t.title}
                </Link>
              </div>
              <p className="mt-1 truncate text-[0.8rem] text-white/50">
                {t.author_name} · {timeAgo(t.created_at)}
                {showSection && (
                  <>
                    {" "}
                    · <span className="text-white/65">{showSection(t.subcategory)}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="hidden text-center text-[0.78rem] text-white/50 sm:block">
            <span className="block text-base font-bold text-white/85">{t.replies}</span>
            {t.replies === 1 ? "risposta" : "risposte"}
          </div>
          <div className="hidden min-w-0 items-center justify-end gap-2.5 text-right sm:flex">
            <div className="min-w-0 text-[0.78rem]">
              <p className="text-white/80">{timeAgo(t.last_at ?? t.updated_at)}</p>
              <p className="truncate text-white/50">{t.last_name ?? t.author_name}</p>
            </div>
            <Head name={t.last_mc ?? t.author_mc} size={30} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Pagination({ page, total, perPage, href }: { page: number; total: number; perPage: number; href: (p: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;
  const list = [...new Set([1, page - 1, page, page + 1, pages])].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  return (
    <nav aria-label="Pagine" className="flex flex-wrap items-center gap-1.5">
      {list.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - list[i - 1] > 1 && <span className="px-1 text-white/35">…</span>}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={`grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-bold transition-colors ${p === page ? "bg-accent text-white" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"}`}
          >
            {p}
          </Link>
        </span>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Barra laterale                                                       */
/* ------------------------------------------------------------------ */

function Box({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <section className="panel fside">
      <h2>
        <Icon className="size-4 text-accent" aria-hidden />
        {title}
      </h2>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function WelcomeBox({ session, unread, next = "/forum" }: { session: Session | null; unread: number; next?: string }) {
  if (!session) {
    return (
      <Box title="Benvenuto!" icon={UserRound}>
        <p className="text-sm leading-relaxed text-white/65">Accedi con Discord per aprire discussioni, rispondere e seguire le tue richieste. Non serve una nuova password.</p>
        <a href={`/api/auth/discord/login?next=${encodeURIComponent(next)}`} className="mt-4 flex h-11 items-center justify-center gap-2 rounded-lg bg-[#5865f2] text-sm font-extrabold text-white transition-colors hover:bg-[#4752c4]">
          <DiscordIcon className="size-5" /> Accedi
        </a>
      </Box>
    );
  }
  const link = "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-white/70 transition-colors hover:bg-white/5 hover:text-white";
  return (
    <Box title="Benvenuto!" icon={UserRound}>
      <div className="flex items-center gap-3">
        <Head name={headOf(session.profile)} size={44} />
        <div className="min-w-0">
          <p className="truncate font-bold">{displayName(session.profile)}</p>
          <p className="text-xs text-white/50">{session.profile.mc_name ? "account Minecraft collegato" : "Minecraft non collegato"}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-0.5 border-t border-white/10 pt-3">
        <Link href="/forum/mie" className={link}>
          <FolderOpen className="size-4" aria-hidden /> Le mie richieste
        </Link>
        <Link href="/forum/notifiche" className={link}>
          <Bell className="size-4" aria-hidden /> Notifiche
          {unread > 0 && <span className="font-badge ml-auto rounded-full bg-accent px-2 text-[0.7rem] leading-5 text-white">{unread}</span>}
        </Link>
        {(isStaff(session.viewer) || isAdmin(session.viewer)) && (
          <Link href="/forum/staff" className={link}>
            <ShieldCheck className="size-4" aria-hidden /> Pannello staff
          </Link>
        )}
        <Link href="/forum/account" className={link}>
          <UserRound className="size-4" aria-hidden /> Account
        </Link>
      </div>
    </Box>
  );
}

export async function OnlineBoxes() {
  const online = await onlineNow();
  const staff = online.filter((u) => u.staff);
  const users = online.filter((u) => !u.staff);
  return (
    <>
      <Box title="Staff online" icon={ShieldCheck}>
        {staff.length ? (
          <ul className="grid gap-2.5">
            {staff.map((u) => (
              <li key={u.name} className="flex items-center gap-3">
                <span className="relative">
                  <Head name={u.head} size={34} />
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#16141a]" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{u.name}</span>
                  <span className="block text-xs text-[#ff8a80]">{u.role}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/50">Nessun membro dello staff online.</p>
        )}
      </Box>
      <Box title="Utenti online" icon={Users}>
        {users.length ? <p className="text-sm leading-relaxed text-white/75">{users.map((u) => u.name).join(", ")}</p> : <p className="text-sm text-white/50">Nessun utente online.</p>}
        <p className="mt-3 border-t border-white/10 pt-3 text-xs text-white/45">
          Totale: <strong className="text-white/80">{online.length}</strong> · negli ultimi 10 minuti
        </p>
      </Box>
    </>
  );
}

export async function StatsBox() {
  const s = await forumStats();
  const row = "flex items-center justify-between gap-3 py-1.5 text-sm";
  return (
    <Box title="Statistiche forum" icon={BarChart3}>
      {s ? (
        <dl className="divide-y divide-white/[0.06]">
          <div className={row}>
            <dt className="text-white/55">Discussioni</dt>
            <dd className="font-bold">{s.threads.toLocaleString("it-IT")}</dd>
          </div>
          <div className={row}>
            <dt className="text-white/55">Messaggi</dt>
            <dd className="font-bold">{s.messages.toLocaleString("it-IT")}</dd>
          </div>
          <div className={row}>
            <dt className="text-white/55">Membri</dt>
            <dd className="font-bold">{s.members.toLocaleString("it-IT")}</dd>
          </div>
          {s.newest && (
            <div className={row}>
              <dt className="text-white/55">Ultimo iscritto</dt>
              <dd className="flex min-w-0 items-center gap-2 font-bold">
                <Head name={s.newestMc} size={20} />
                <span className="truncate">{s.newest}</span>
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="text-sm text-white/50">Le statistiche compariranno a breve.</p>
      )}
    </Box>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="grid gap-4" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="panel h-36 animate-pulse" />
      ))}
    </div>
  );
}

