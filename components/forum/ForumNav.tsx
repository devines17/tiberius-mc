import Link from "next/link";
import { Archive, Bell, FolderOpen, MessagesSquare, Search, ShieldCheck, Clock3, Users } from "lucide-react";
import { displayName, type Session } from "@/lib/server/auth";
import { isAdmin, isStaff } from "@/lib/forum/rules";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { Head, headOf } from "./zero";

type Tab = "home" | "membri" | "cerca" | "ultimi" | "mie" | "archivio" | "staff" | "notifiche" | "account";

/**
 * Barra del forum: Forum, Membri, Cerca, Ultimi post e la ricerca veloce a destra.
 * Sotto, per chi ha fatto l'accesso, le proprie richieste, le notifiche e (solo allo staff) il pannello.
 */
export function ForumNav({ session, active, unread = 0, next = "/forum" }: { session: Session | null; active: Tab; unread?: number; next?: string }) {
  const tabs: { key: Tab; href: string; label: string; icon: typeof Users }[] = [
    { key: "home", href: "/forum", label: "Forum", icon: MessagesSquare },
    { key: "membri", href: "/forum/membri", label: "Membri", icon: Users },
    { key: "cerca", href: "/forum/cerca", label: "Cerca", icon: Search },
    { key: "ultimi", href: "/forum/ultimi", label: "Ultimi post", icon: Clock3 },
  ];
  const staff = Boolean(session && (isStaff(session.viewer) || isAdmin(session.viewer)));
  const mine: { key: Tab; href: string; label: string; icon: typeof Users; badge?: number }[] = session
    ? [
        { key: "mie", href: "/forum/mie", label: "Le mie richieste", icon: FolderOpen },
        { key: "archivio", href: "/forum/archivio", label: "Archivio", icon: Archive },
        { key: "notifiche", href: "/forum/notifiche", label: "Notifiche", icon: Bell, badge: unread },
        ...(staff ? [{ key: "staff" as Tab, href: "/forum/staff", label: "Pannello staff", icon: ShieldCheck }] : []),
      ]
    : [];

  return (
    <nav aria-label="Forum" className="wrap grid w-full gap-2">
      <div className="fbar flex flex-wrap items-stretch justify-between overflow-hidden rounded-2xl">
        <ul className="no-scrollbar flex min-w-0 items-stretch overflow-x-auto">
          {tabs.map(({ key, href, label, icon: Icon }) => (
            <li key={key} className="flex">
              <Link href={href} aria-current={active === key ? "page" : undefined} className="fbar-tab">
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <form action="/forum/cerca" method="get" role="search" className="hidden items-center p-2 md:flex">
          <label htmlFor="fbar-q" className="sr-only">
            Cerca nel forum
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" aria-hidden />
            <input id="fbar-q" name="q" type="search" maxLength={100} placeholder="Cerca nel forum…" className="h-10 w-64 rounded-xl border border-white/10 bg-black/30 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-accent/60 focus:outline-none" />
          </div>
        </form>
      </div>

      {session ? (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <ul className="flex flex-wrap items-center gap-1">
            {mine.map(({ key, href, label, icon: Icon, badge }) => (
              <li key={key}>
                <Link
                  href={href}
                  aria-current={active === key ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[0.82rem] font-semibold transition-colors ${active === key ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon className={`size-4 ${active === key ? "text-accent" : ""}`} aria-hidden />
                  {label}
                  {badge ? <span className="font-badge grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[0.68rem] leading-5 text-white">{badge > 99 ? "99+" : badge}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/forum/account"
            aria-current={active === "account" ? "page" : undefined}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[0.82rem] font-semibold transition-colors ${active === "account" ? "bg-white/10" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
          >
            <Head name={headOf(session.profile)} size={22} />
            <span className="max-w-36 truncate">{displayName(session.profile)}</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-end gap-3 px-1 text-[0.82rem] text-white/55">
          <span>Accedi per aprire discussioni e rispondere.</span>
          <a href={`/api/auth/discord/login?next=${encodeURIComponent(next)}`} className="flex items-center gap-2 rounded-lg bg-[#5865f2] px-3 py-2 font-bold text-white transition-colors hover:bg-[#4752c4]">
            <DiscordIcon className="size-4" /> Accedi con Discord
          </a>
        </div>
      )}
    </nav>
  );
}
