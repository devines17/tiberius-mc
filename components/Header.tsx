"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  House,
  LayoutDashboard,
  Map as MapIcon,
  MessagesSquare,
  Newspaper,
  ScrollText,
  Shield,
  ShoppingCart,
  Store,
  Vote,
} from "lucide-react";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { AccountButton } from "@/components/AccountButton";
import { pages, siteConfig } from "@/lib/site-config";

type NavItem = { href: string; label: string; icon: LucideIcon; highlight?: boolean };

const top: NavItem[] = [
  { href: "/", label: "home", icon: House },
  { href: "/news", label: "news", icon: Newspaper },
  { href: "/regole", label: "regole", icon: ScrollText },
  { href: "/mappa", label: "mappa", icon: MapIcon },
  { href: "/forum", label: "forum", icon: MessagesSquare },
  { href: "/staff", label: "staff", icon: Shield },
  { href: "/vota", label: "vota", icon: Vote },
  { href: "/wiki", label: "wiki", icon: BookOpen },
  { href: "/portale", label: "gestionale", icon: LayoutDashboard },
  { href: "/store", label: "store", icon: Store, highlight: true },
];

/** La voce è attiva sulla sua pagina e sulle pagine figlie; la home solo su "/". */
function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <header className={`topbar fixed inset-x-0 top-0 z-50 ${open ? "!bg-field text-white" : ""}`} style={{ height: "var(--header-h)" }}>
      {/* Tre colonne uguali ai lati: il menu resta al centro esatto della pagina */}
      <div className="grid h-full grid-cols-[1fr_auto] items-center gap-6 px-[var(--gutter)] xl:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="relative z-10 shrink-0 justify-self-start transition-transform duration-300 hover:scale-[1.03]" aria-label="TiberiusMC, home">
          <Image src="/images/tiberiusmc-wordmark.webp" alt="TiberiusMC" width={900} height={151} priority unoptimized className="h-7 w-auto md:h-8 2xl:h-9" />
        </Link>
        <nav aria-label="Principale" className="hidden items-center gap-0.5 xl:flex">
          {top.map(({ href, label, icon: Icon, highlight }) => {
            const active = isActive(pathname, href);
            if (highlight) {
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`mx-1 flex items-center gap-1.5 rounded-xl bg-black/40 px-3.5 py-2 text-sm font-bold uppercase tracking-[0.04em] text-[#f3cf7a] ring-1 ring-inset ring-[#d9a63d]/55 transition-[background-color,box-shadow,color] hover:bg-[#d9a63d]/15 hover:text-[#ffe3a0] hover:ring-[#e9bb55] hover:shadow-[0_0_22px_-6px_rgb(233_187_85/0.6)] ${active ? "!ring-[#e9bb55] bg-[#d9a63d]/15" : ""}`}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-1.5 px-2.5 py-2 text-sm font-bold transition-colors ${active ? "text-white" : "text-white/70 hover:text-white"}`}
              >
                <Icon className={`size-4 transition-colors ${active ? "text-accent" : "group-hover:text-accent"}`} aria-hidden />
                {label}
                <span
                  aria-hidden
                  className={`absolute inset-x-2.5 -bottom-0.5 h-0.5 origin-left rounded-full bg-accent transition-transform duration-300 ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"}`}
                />
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <Link
            href="/store"
            aria-label="Carrello"
            className="grid size-11 place-items-center rounded-xl border border-white/15 transition-colors hover:bg-white/10 xl:hidden"
          >
            <ShoppingCart className="size-5" aria-hidden />
          </Link>
          {/* Il contenitore decide la visibilità: .btn impone display e vincerebbe su "hidden". */}
          <span className="hidden sm:block">
            <AccountButton />
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu"
            className="flex h-11 items-center gap-3 px-2 text-sm font-bold xl:hidden"
          >
            {open ? "chiudi" : "menu"}
            <span className="relative block h-3 w-6" aria-hidden>
              <span className={`absolute left-0 h-0.5 w-full bg-current transition-all ${open ? "top-1/2 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-0.5 w-full bg-current transition-all ${open ? "top-1/2 -rotate-45" : "bottom-0"}`} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="menu"
        hidden={!open}
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
        className="on-field fixed inset-x-0 bottom-0 overflow-y-auto"
        style={{ top: "var(--header-h)" }}
      >
        <div className="wrap flex min-h-full flex-col justify-between gap-10 py-10">
          <ul className="grid gap-1">
            {[{ href: "/entra", label: "come entrare", short: "entra" }, ...pages, { href: "/portale", label: "gestionale", short: "gestionale" }].map((p, i) => (
              <li key={p.href}>
                <Link href={p.href} className="group flex items-baseline gap-4 py-1 text-[clamp(1.5rem,4vw,2.5rem)] font-semibold leading-tight transition-colors hover:text-accent">
                  <span className="text-sm font-medium text-white/40">{String(i + 1).padStart(2, "0")}</span>
                  {p.short}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <a href={siteConfig.links.discord} target="_blank" rel="noopener noreferrer" className="btn !bg-[#5865f2] !text-white">
              <DiscordIcon className="size-5" /> entra nel discord
            </a>
            <a href={siteConfig.links.telegram} target="_blank" rel="noopener noreferrer" className="btn btn-light">
              telegram {siteConfig.links.telegramHandle}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
