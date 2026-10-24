"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DiscordIcon } from "@/components/ui/DiscordIcon";

type Me = { name: string; mcVerified: boolean; mcUuid: string | null; headName: string | null; staff: boolean; unread: number };

/** Icona account in alto a destra: al passaggio del mouse si allarga col nome e scende il menu. */
export function AccountButton() {
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d: { user: Me | null }) => alive && setMe(d.user))
      .catch(() => alive && setMe(null));
    return () => {
      alive = false;
    };
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  // Si apre passando il mouse (con un attimo di ritardo in chiusura, per arrivare al pannello) o col click su touch
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enter = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => setOpen(false), 160);
  };

  const row = "flex items-center justify-between rounded-lg py-2 pl-[34px] pr-3 text-[0.95rem] font-bold text-white/75 transition-colors hover:bg-white/[0.07] hover:text-white";
  return (
    // Un'unica forma: chiusa è l'icona, aperta si allarga verso sinistra (icona e nome in alto) e sotto scende l'elenco
    <div ref={box} className="relative size-11" onMouseEnter={enter} onMouseLeave={leave}>
      <div data-open={open} className={`acc-box absolute right-0 top-0 z-50 overflow-hidden rounded-xl ${me === undefined ? "opacity-0" : ""}`}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={me ? `Account di ${me.name}` : "Accedi"}
          className="relative flex h-11 w-full items-center text-left"
        >
          <span className="grid size-11 shrink-0 place-items-center">
            <svg viewBox="0 0 24 24" className="size-6 text-white" fill="currentColor" aria-hidden>
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4.2a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Zm0 13.6a7.8 7.8 0 0 1-5.6-2.4c.9-1.8 3.1-2.9 5.6-2.9s4.7 1.1 5.6 2.9a7.8 7.8 0 0 1-5.6 2.4Z" />
            </svg>
          </span>
          <span className="acc-fade -ml-1 min-w-0 truncate pr-4 text-sm font-bold">{me ? me.name : "accedi"}</span>
          {me && me.unread > 0 && <span className="absolute left-7 top-2 size-2.5 rounded-full bg-accent ring-2 ring-[#141416]" aria-label={`${me.unread} notifiche non lette`} />}
        </button>

        <div className="acc-drop grid" role="menu">
          <div className="min-h-0 overflow-hidden">
            <div className="acc-fade mx-3 border-t border-accent/60" />
            {me ? (
              <div className="acc-fade grid gap-0.5 p-1.5 pt-2">
                <Link href="/forum/account" role="menuitem" className={row}>
                  Account
                </Link>
                <Link href="/forum/mie" role="menuitem" className={row}>
                  Le tue pratiche
                </Link>
                <Link href="/forum/notifiche" role="menuitem" className={row}>
                  Notifiche
                  {me.unread > 0 && <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-white">{me.unread}</span>}
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button type="submit" role="menuitem" className={`${row} w-full text-white/45 hover:!text-[#ff8a80]`}>
                    Esci
                  </button>
                </form>
              </div>
            ) : (
              <div className="acc-fade grid gap-3 p-3 pl-10 pt-3">
                <p className="text-xs leading-relaxed text-white/55">Si entra con Discord, senza creare una nuova password.</p>
                <a href={`/api/auth/discord/login?next=${encodeURIComponent(pathname || "/")}`} role="menuitem" className="btn btn-discord !h-9 !px-3 !text-[0.7rem]">
                  <DiscordIcon className="size-4" /> accedi con discord
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
