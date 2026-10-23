"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Indirizzo del server copiabile.
 * Se l'IP non è ancora configurato non mostra un pulsante finto:
 * mostra un pannello informativo.
 */
export function CopyIp({ ip }: { ip: string | null }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!ip) {
    return (
      <div className="panel flex items-center gap-3 px-5 py-4 text-left">
        <div>
          <p className="font-display text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold">
            Indirizzo del server
          </p>
          <p className="mt-1 text-sm text-stone">
            L&apos;indirizzo verrà pubblicato a breve. Torna presto a trovarci.
          </p>
        </div>
      </div>
    );
  }

  async function copy() {
    if (!ip) return;
    try {
      await navigator.clipboard.writeText(ip);
      setState("copied");
    } catch {
      setState("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
  }

  return (
    <div className="panel flex items-center justify-between gap-4 py-3 pl-5 pr-3">
      <div className="min-w-0 text-left">
        <p className="font-display text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold">
          Indirizzo del server
        </p>
        <p className="mt-0.5 truncate font-mono text-lg font-semibold text-ivory sm:text-xl">{ip}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-2 rounded-md border border-gold/50 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-bright transition-colors hover:bg-gold/20"
      >
        {state === "copied" ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
        {state === "copied" ? "Copiato" : state === "error" ? "Copia a mano" : "Copia IP"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied"
          ? "Indirizzo copiato negli appunti"
          : state === "error"
            ? "Impossibile copiare automaticamente: seleziona l'indirizzo e copialo a mano"
            : ""}
      </span>
    </div>
  );
}
