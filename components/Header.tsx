"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { pages, siteConfig } from "@/lib/site-config";

const top = [
  { href: "/news", label: "news" },
  { href: "/regole", label: "regole" },
  { href: "/mappa", label: "mappa" },
  { href: "/forum", label: "forum" },
  { href: "/store", label: "store" },
  { href: "/staff", label: "staff" },
  { href: "/vota", label: "vota" },
  { href: "/wiki", label: "wiki" },
  { href: "/portale", label: "gestionale" },
];

export function Header() {
  const [open, setOpen] = useState(false);

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
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-6 px-[var(--gutter)]">
        <Link href="/" className="relative z-10 text-xl font-bold tracking-tight" aria-label="TiberiusMC, home">
          Tiberius<span className="text-accent">MC</span>
        </Link>
        <nav aria-label="Principale" className="hidden items-center gap-5 xl:flex">
          {top.map((p) => (
            <Link key={p.href} href={p.href} className="text-sm font-medium transition-colors hover:text-accent">
              {p.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/store"
            aria-label="Carrello"
            className="grid size-11 place-items-center rounded-xl border border-white/15 transition-colors hover:bg-white/10"
          >
            <ShoppingCart className="size-5" aria-hidden />
          </Link>
          <Link href="/portale" className="btn hidden !bg-[#5865f2] !text-white hover:!bg-[#4752c4] sm:inline-flex" data-magnetic>
            <DiscordIcon className="size-5" /> area personale
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu"
            className="flex h-11 items-center gap-3 px-2 text-sm font-medium"
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
