"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TiberiusLogo } from "@/components/TiberiusLogo";
import { pages, siteConfig } from "@/lib/site-config";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
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
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${open ? "bg-field text-white" : solid ? "bg-paper/85 backdrop-blur" : "bg-transparent"}`}
      style={{ height: "var(--header-h)" }}
    >
      <div className="wrap flex h-full items-center justify-between">
        <Link href="/" aria-label="Tiberius MC, home" className="relative z-10">
          <TiberiusLogo variant="nav" priority />
        </Link>
        <nav aria-label="Principale" className="hidden items-center gap-8 lg:flex">
          {[{ href: "/news", short: "news" }, { href: "/regole", short: "regole" }, { href: "/mappa", short: "mappa" }, { href: "/forum", short: "forum" }, { href: "/portale", short: "gestionale" }].map((p) => (
            <Link
              key={p.href}
              href={p.href}
              aria-current={pathname === p.href ? "page" : undefined}
              className="text-[1.0625rem] font-semibold tracking-tight transition-colors hover:text-accent aria-[current=page]:text-accent"
            >
              {p.short}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/entra" className="btn btn-accent hidden sm:inline-flex" data-magnetic>
            entra
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu"
            className="flex h-14 items-center gap-3 px-2 text-[1.0625rem] font-semibold"
          >
            {open ? "chiudi" : "menu"}
            <span className="relative block h-3 w-7" aria-hidden>
              <span className={`absolute left-0 h-0.5 w-full bg-current transition-all ${open ? "top-1/2 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-0.5 w-full bg-current transition-all ${open ? "top-1/2 -rotate-45" : "bottom-0"}`} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="menu"
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
        hidden={!open}
        className="on-field fixed inset-x-0 bottom-0 overflow-y-auto"
        style={{ top: "var(--header-h)" }}
      >
        <div className="wrap flex min-h-full flex-col justify-between gap-12 py-10">
          <ul className="grid gap-1">
            {[{ href: "/entra", label: "come entrare", short: "entra" }, ...pages, { href: "/portale", label: "gestionale", short: "gestionale" }].map((p, i) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="group flex items-baseline gap-4 py-1 text-[clamp(2.5rem,8vw,5.5rem)] font-bold lowercase leading-none tracking-tighter transition-colors hover:text-accent"
                >
                  <span className="text-base font-semibold text-white/40">{String(i + 1).padStart(2, "0")}</span>
                  {p.short}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <a href={siteConfig.links.discord} target="_blank" rel="noopener noreferrer" className="btn btn-accent">
              entra nel discord
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
