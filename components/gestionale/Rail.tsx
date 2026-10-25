"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Castle, House, Landmark, Swords } from "lucide-react";

export const PORTAL_SECTIONS = [
  { href: "/portale", label: "Generale", icon: House },
  { href: "/portale/banca", label: "Banca", icon: Landmark },
  { href: "/portale/citta", label: "Città e nazione", icon: Castle },
  { href: "/portale/guerre", label: "Guerre e PvP", icon: Swords },
] as const;

/** Barra di icone a sinistra (in basso su telefono), con il nome della sezione al passaggio del mouse. */
export function Rail() {
  const pathname = usePathname();
  return (
    <nav aria-label="Sezioni del gestionale" className="portal-rail">
      {PORTAL_SECTIONS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} aria-label={label} aria-current={active ? "page" : undefined} className="portal-rail-btn group">
            <Icon className="size-[18px]" aria-hidden />
            <span className="portal-rail-tip">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
