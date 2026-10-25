"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { House, MessagesSquare, Newspaper, ScrollText, Shield, ShoppingCart, Store } from "lucide-react";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { AccountButton } from "@/components/AccountButton";
import { siteConfig } from "@/lib/site-config";

type NavItem = { href: string; label: string; icon: LucideIcon; highlight?: boolean };

const top: NavItem[] = [
  { href: "/", label: "home", icon: House },
  { href: "/news", label: "news", icon: Newspaper },
  { href: "/regole", label: "regole", icon: ScrollText },
  { href: "/forum", label: "forum", icon: MessagesSquare },
  { href: "/staff", label: "staff", icon: Shield },
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
          {top.map(({ href, label, highlight }) => {
            const active = isActive(pathname, href);
            if (highlight) {
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`ml-2 rounded-md bg-accent px-3.5 py-1.5 text-[0.85rem] font-bold uppercase text-white transition-colors hover:bg-[#c42b22] ${active ? "bg-[#c42b22]" : ""}`}
                >
                  {label}
                </Link>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 text-[0.9rem] font-bold uppercase transition-colors ${active ? "bg-white/10 text-white" : "text-white/75 hover:text-white"}`}
              >
                {label}
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
            {top.map((p) => ({ href: p.href, short: p.label })).map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="block py-1.5 text-2xl font-bold capitalize leading-tight transition-colors hover:text-accent">
                  {p.short}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <a href={siteConfig.links.discord} target="_blank" rel="noopener noreferrer" className="btn !bg-[#5865f2] !text-white">
              <DiscordIcon className="size-5" /> Entra nel Discord
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
