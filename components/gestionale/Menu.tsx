"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Castle, LayoutDashboard, Landmark, Swords } from "lucide-react";

const ITEMS = [
  { href: "/portale", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portale/banca", label: "Conto", icon: Landmark },
  { href: "/portale/citta", label: "Città e nazione", icon: Castle },
  { href: "/portale/guerre", label: "Guerre e PvP", icon: Swords },
];

export function Menu() {
  const pathname = usePathname();
  return (
    <nav aria-label="Sezioni del gestionale" className="grid gap-2">
      {ITEMS.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className="gest-nav">
          <Icon className="size-[18px] text-white/70" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}
