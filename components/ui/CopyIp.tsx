"use client";

import { useRef, useState } from "react";

/** Indirizzo del server con pulsante "copia". `tone` decide i colori per ogni fondo. */
export function CopyIp({
  ip,
  tone = "light",
  className = "",
}: {
  ip: string;
  tone?: "light" | "dark" | "paper";
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(ip);
      setState("copied");
    } catch {
      setState("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
  }

  const tones = {
    light: "bg-surface text-ink",
    dark: "bg-white text-black",
    paper: "bg-white text-black",
  } as const;

  return (
    <div className={`inline-flex h-14 items-stretch rounded-t-[56px] ${tones[tone]} ${className}`}>
      <span className="flex items-center pl-7 pr-4 text-[1.0625rem] font-semibold tracking-tight">{ip}</span>
      <button
        type="button"
        onClick={copy}
        className="m-1.5 ml-0 min-w-[96px] rounded-t-[48px] bg-accent px-5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-white hover:text-black"
      >
        {state === "copied" ? "copiato" : state === "error" ? "copia a mano" : "copia"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? "Indirizzo copiato negli appunti" : ""}
      </span>
    </div>
  );
}
