"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, Menu, X } from "lucide-react";
import { navItems, siteConfig } from "@/lib/site-config";
import { TiberiusLogo } from "@/components/TiberiusLogo";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  const externalLinks = [
    siteConfig.links.discord && { href: siteConfig.links.discord, label: "Discord" },
    siteConfig.links.store && { href: siteConfig.links.store, label: "Store" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || open
          ? "border-gold/25 bg-obsidian/90 backdrop-blur-md"
          : "border-transparent bg-obsidian/40 backdrop-blur-sm"
      }`}
    >
      <nav
        aria-label="Navigazione principale"
        className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Link href="/" onClick={close} aria-label="Tiberius MC — Home" className="flex items-center">
          <TiberiusLogo variant="nav" priority />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={`/${item.href}`}
                className="rounded-md px-3 py-2 font-display text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-stone transition-colors hover:text-gold-bright"
              >
                {item.label}
              </Link>
            </li>
          ))}
          {externalLinks.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 font-display text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-stone transition-colors hover:text-gold-bright"
              >
                {item.label}
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/#entra"
            onClick={close}
            className="hidden rounded-md border border-gold/60 bg-gradient-to-b from-gold-bright to-gold px-5 py-2.5 font-display text-[0.8rem] font-bold uppercase tracking-[0.16em] text-obsidian shadow-[0_8px_24px_-10px_rgb(201_162_75/0.7)] transition hover:brightness-110 sm:inline-block"
          >
            Entra nel server
          </Link>

          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-md border border-gold/30 text-gold-bright transition-colors hover:bg-gold/10 lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Chiudi il menu" : "Apri il menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="menu-mobile" className="border-t border-gold/20 bg-obsidian/95 lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={`/${item.href}`}
                  onClick={close}
                  className="block rounded-md px-3 py-3 font-display text-sm font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-gold/10 hover:text-gold-bright"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {externalLinks.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md px-3 py-3 font-display text-sm font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-gold/10 hover:text-gold-bright"
                >
                  {item.label}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/#entra"
                onClick={close}
                className="block rounded-md border border-gold/60 bg-gradient-to-b from-gold-bright to-gold px-5 py-3 text-center font-display text-sm font-bold uppercase tracking-[0.16em] text-obsidian"
              >
                Entra nel server
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
