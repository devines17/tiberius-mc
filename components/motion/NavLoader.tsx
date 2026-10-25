"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Caricamento tra una pagina e l'altra: un Goldone che gira al centro dello schermo.
 * (Andando in home c'è invece il sipario nero.)
 */
export function NavLoader() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [on, setOn] = useState(false);
  const startedAt = useRef(0);

  // Clic su un link interno verso un'altra pagina: parte il caricamento
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || !a.href) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      // Verso la home c'è il sipario, non il Goldone
      if (url.pathname === "/") return;
      startedAt.current = performance.now();
      setOn(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Pagina arrivata: il Goldone resta almeno mezzo secondo, poi sparisce
  useEffect(() => {
    if (!startedAt.current) return;
    const left = Math.max(0, 550 - (performance.now() - startedAt.current));
    const t = setTimeout(() => {
      setOn(false);
      startedAt.current = 0;
    }, left);
    return () => clearTimeout(t);
  }, [pathname, search]);

  // Rete di sicurezza: mai bloccato più di 8 secondi
  useEffect(() => {
    if (!on) return;
    const t = setTimeout(() => setOn(false), 8000);
    return () => clearTimeout(t);
  }, [on]);

  return (
    <div aria-hidden={!on} role="status" className={`nav-loader ${on ? "is-on" : ""}`}>
      <div className="nav-loader-coin">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/goldone-loader.webp" alt="" width={96} height={96} />
      </div>
      <span className="nav-loader-shadow" />
      <p className="nav-loader-text">
        Caricamento<span>.</span>
        <span>.</span>
        <span>.</span>
      </p>
    </div>
  );
}
