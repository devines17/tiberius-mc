import Link from "next/link";
import { Archive, Bell, FolderOpen, LayoutGrid, Search, ShieldCheck, UserRound } from "lucide-react";
import { displayName, type Session } from "@/lib/server/auth";
import { isAdmin, isStaff } from "@/lib/forum/rules";
import { DiscordIcon } from "@/components/ui/DiscordIcon";

type Tab = "home" | "mie" | "cerca" | "archivio" | "staff" | "notifiche" | "account";

/** Barra di navigazione interna del forum. Mostra lo staff solo a chi ha permessi. */
export function ForumNav({ session, active, unread = 0 }: { session: Session | null; active: Tab; unread?: number }) {
  const tabs: { key: Tab; href: string; label: string; icon: typeof LayoutGrid; show: boolean }[] = [
    { key: "home", href: "/forum", label: "sezioni", icon: LayoutGrid, show: true },
    { key: "mie", href: "/forum/mie", label: "le mie richieste", icon: FolderOpen, show: Boolean(session) },
    { key: "cerca", href: "/forum/cerca", label: "cerca", icon: Search, show: Boolean(session) },
    { key: "archivio", href: "/forum/archivio", label: "archivio", icon: Archive, show: Boolean(session) },
    { key: "staff", href: "/forum/staff", label: "pannello staff", icon: ShieldCheck, show: Boolean(session && (isStaff(session.viewer) || isAdmin(session.viewer))) },
  ];
  return (
    <nav aria-label="Forum" className="wrap">
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-2">
        <ul className="flex flex-wrap items-center gap-1">
          {tabs
            .filter((t) => t.show)
            .map(({ key, href, label, icon: Icon }) => (
              <li key={key}>
                <Link
                  href={href}
                  aria-current={active === key ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${active === key ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon className={`size-4 ${active === key ? "text-accent" : ""}`} aria-hidden />
                  {label}
                </Link>
              </li>
            ))}
        </ul>
        <div className="flex items-center gap-1">
          {session ? (
            <>
              <Link
                href="/forum/notifiche"
                aria-label={unread ? `Notifiche, ${unread} da leggere` : "Notifiche"}
                aria-current={active === "notifiche" ? "page" : undefined}
                className={`relative grid size-10 place-items-center rounded-xl transition-colors ${active === "notifiche" ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <Bell className="size-5" aria-hidden />
                {unread > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[0.65rem] font-bold leading-4 text-white">{unread > 99 ? "99+" : unread}</span>}
              </Link>
              <Link
                href="/forum/account"
                aria-current={active === "account" ? "page" : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${active === "account" ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <UserRound className="size-4" aria-hidden />
                <span className="max-w-32 truncate">{displayName(session.profile)}</span>
              </Link>
            </>
          ) : (
            <a href="/api/auth/discord/login?next=/forum" className="btn btn-discord !h-11 !px-5 !text-sm">
              <DiscordIcon className="size-5" /> Accedi con Discord
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
