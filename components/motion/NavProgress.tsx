"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Barra di caricamento in cima alla pagina durante i cambi di pagina
 * (al posto del sipario, che resta solo entrando in home da fuori sito).
 */
export function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [w, setW] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clic su un link interno: parte la barra
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      setState("loading");
      setW(12);
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(() => setW((x) => (x < 88 ? x + (90 - x) * 0.12 : x)), 180);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Pagina nuova arrivata: la barra si completa e sparisce
  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setState((s) => (s === "loading" ? "done" : s));
    setW((x) => (x > 0 ? 100 : 0));
    const t = setTimeout(() => {
      setState("idle");
      setW(0);
    }, 450);
    return () => clearTimeout(t);
  }, [pathname, search]);

  return (
    <div aria-hidden className={`pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px] transition-opacity duration-300 ${state === "idle" ? "opacity-0" : "opacity-100"}`}>
      <div className="navbar-progress h-full" style={{ width: `${w}%` }} />
    </div>
  );
}
