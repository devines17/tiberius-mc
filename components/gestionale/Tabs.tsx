"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { roman } from "./ui";

export const PORTAL_SECTIONS = [
  { href: "/portale", label: "Generale" },
  { href: "/portale/banca", label: "Conto" },
  { href: "/portale/citta", label: "Città e nazione" },
  { href: "/portale/guerre", label: "Guerre e PvP" },
] as const;

/** Schede del gestionale, numerate come i capitoli di una tavola romana. */
export function Tabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Sezioni del gestionale" className="no-scrollbar flex overflow-x-auto px-2 md:justify-center md:px-6">
      {PORTAL_SECTIONS.map(({ href, label }, i) => (
        <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className="portal-tab">
          <span className="portal-tab-num">{roman(i + 1)}</span>
          {label}
        </Link>
      ))}
    </nav>
  );
}
