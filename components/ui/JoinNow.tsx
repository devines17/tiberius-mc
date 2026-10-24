"use client";

import type { MouseEvent } from "react";
import { Swords } from "lucide-react";

/**
 * "Entra ora" della home: scorre alla guida per entrare a ogni click.
 * Un semplice link #ancora funziona solo la prima volta (poi l'indirizzo non cambia più).
 */
export function JoinNow({ target }: { target: string }) {
  function go(e: MouseEvent<HTMLAnchorElement>) {
    const el = document.getElementById(target);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  return (
    <a href={`#${target}`} onClick={go} className="btn-play">
      <Swords className="size-5" aria-hidden />
      entra ora
    </a>
  );
}
