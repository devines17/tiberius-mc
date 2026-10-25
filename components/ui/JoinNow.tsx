"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { MessagesSquare, Newspaper, ScrollText, Shield } from "lucide-react";

const LINKS = [
  { href: "/regole", t: "Regolamento", icon: ScrollText },
  { href: "/forum", t: "Forum", icon: MessagesSquare },
  { href: "/news", t: "News", icon: Newspaper },
  { href: "/staff", t: "Staff", icon: Shield },
];

/**
 * Barra sotto lo slogan della home: "Entra ora" in rosso e le sezioni principali, a blocchi inclinati.
 * "Entra ora" scorre alla guida a ogni click (un link #ancora funziona solo la prima volta).
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
    <nav aria-label="Inizia da qui" className="hb">
      <a href={`#${target}`} onClick={go} className="hb-item hb-play">
        <span>
          <svg viewBox="0 0 24 24" className="size-[1.1rem]" fill="currentColor" aria-hidden>
            <path d="M6 4l14 8-14 8z" />
          </svg>
          entra ora
        </span>
      </a>
      {LINKS.map(({ href, t, icon: Icon }) => (
        <Link key={href} href={href} className="hb-item group">
          <span>
            <Icon className="size-[1.15rem] transition-colors duration-200 group-hover:text-[#ff6b5e]" aria-hidden />
            {t}
          </span>
        </Link>
      ))}
    </nav>
  );
}
