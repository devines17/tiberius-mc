"use client";

import { useEffect } from "react";

/**
 * Ferma le animazioni dei personaggi 3D fuori dallo schermo (classe "sk-off"):
 * il browser non ricalcola centinaia di facce che nessuno sta guardando.
 */
export function PauseOffscreen({ selector = ".sk-stage" }: { selector?: string }) {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(selector);
    if (!els.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle("sk-off", !e.isIntersecting);
      },
      { rootMargin: "120px 0px" },
    );
    els.forEach((el) => io.observe(el));
    // Anche quando la scheda del browser non è in primo piano
    const vis = () => document.documentElement.classList.toggle("sk-hidden-tab", document.hidden);
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, [selector]);
  return null;
}
