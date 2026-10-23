"use client";

import { useEffect, useState } from "react";

type Status =
  | { state: "loading" }
  | { state: "online"; players: number; max: number; version: string | null }
  | { state: "offline" }
  | { state: "error" };

/** Ogni quanto si ricontrolla il server. L'API stessa aggiorna i dati circa ogni minuto. */
const REFRESH_MS = 60_000;

/**
 * Stato dal vivo del server Minecraft, letto da api.mcstatus.io.
 * Nessun dato inventato: se l'API non risponde il badge sparisce.
 */
export function ServerStatus({ host, className = "" }: { host: string; className?: string }) {
  const [status, setStatus] = useState<Status>({ state: "loading" });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(host)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (!alive) return;
        if (data.online) {
          setStatus({
            state: "online",
            players: Number(data.players?.online ?? 0),
            max: Number(data.players?.max ?? 0),
            version: data.version?.name_clean ?? null,
          });
        } else {
          setStatus({ state: "offline" });
        }
      } catch {
        if (alive) setStatus({ state: "error" });
      }
    };
    load();
    const id = window.setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [host]);

  if (status.state === "error") return null;

  const online = status.state === "online";
  return (
    <p
      className={`inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-md ${className}`}
      aria-live="polite"
    >
      <span
        aria-hidden
        className={`size-2.5 rounded-full ${online ? "dot-live bg-emerald-400" : status.state === "offline" ? "bg-white/40" : "bg-white/20"}`}
      />
      {status.state === "loading" && <span className="text-white/60">controllo il server…</span>}
      {status.state === "offline" && <span>server offline</span>}
      {online && (
        <span>
          online · {status.players}
          {status.max ? `/${status.max}` : ""} {status.players === 1 ? "giocatore" : "giocatori"}
          {status.version && <span className="text-white/60"> · Java {status.version}</span>}
        </span>
      )}
    </p>
  );
}
