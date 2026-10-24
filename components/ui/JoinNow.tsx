"use client";

import Link from "next/link";
import { useServerStatus } from "@/components/ui/ServerStatus";

/** "Entra ora" della home: porta alla guida e, se il server è online con qualcuno dentro, dice sempre quanti giocano (0 se è offline). */
export function JoinNow({ host, href }: { host: string; href: string }) {
  const status = useServerStatus(host);
  const players = status.state === "online" ? status.players : 0;
  return (
    <Link href={href} className="btn btn-accent" data-magnetic aria-live="polite">
      {players > 0 && <span aria-hidden className="dot-live size-2 rounded-full bg-emerald-300" />}
      {`entra ora insieme a ${players} ${players === 1 ? "giocatore" : "giocatori"}`}
    </Link>
  );
}
