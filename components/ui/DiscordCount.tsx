"use client";

import { useEffect, useState } from "react";

type Counts = { members: number; online: number };

/** Codice dell'invito da un link discord.gg/… o discord.com/invite/…; null se non è un invito. */
function inviteCode(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    if (u.hostname === "discord.gg" && parts[0]) return parts[0];
    if (/(^|\.)discord(app)?\.com$/.test(u.hostname) && parts[0] === "invite" && parts[1]) return parts[1];
  } catch {
    // link non valido: nessun conteggio
  }
  return null;
}

/**
 * Membri e utenti online del server Discord, letti dall'invito pubblico.
 * Se il link non è un invito o Discord non risponde, non mostra nulla.
 */
export function DiscordCount({ invite, className = "" }: { invite: string; className?: string }) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const code = inviteCode(invite);

  useEffect(() => {
    if (!code) return;
    let alive = true;
    fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        if (alive && typeof d.approximate_member_count === "number") {
          setCounts({ members: d.approximate_member_count, online: Number(d.approximate_presence_count ?? 0) });
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [code]);

  if (!counts) return null;
  return (
    <p className={`inline-flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold ${className}`}>
      <span className="inline-flex items-center gap-2">
        <span aria-hidden className="dot-live size-2.5 rounded-full bg-emerald-400" />
        {counts.online} online
      </span>
      <span className="inline-flex items-center gap-2">
        <span aria-hidden className="size-2.5 rounded-full bg-white/60" />
        {counts.members} {counts.members === 1 ? "membro" : "membri"}
      </span>
    </p>
  );
}
