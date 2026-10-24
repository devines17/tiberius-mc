"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, FileText, LogOut, UserRound } from "lucide-react";
import { DiscordIcon } from "@/components/ui/DiscordIcon";

type Me = { name: string; mcVerified: boolean; mcUuid: string | null; headName: string | null; staff: boolean; unread: number };

/** Testa della skin: con l'account Minecraft collegato la sua, altrimenti quella di Steve. */
function Head({ uuid, className = "" }: { uuid: string | null; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://mc-heads.net/avatar/${encodeURIComponent(uuid ?? "MHF_Steve")}/48`}
      alt=""
      width={48}
      height={48}
      className={`rounded-[4px] [image-rendering:pixelated] ${className}`}
    />
  );
}

/** Bottone in alto a destra: ACCEDI da non loggato, testa della skin e nick con menu da loggato. */
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

  const item = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-white/80 transition-colors hover:bg-white/10 hover:text-white";
  return (
    <div ref={box} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={me ? `Account di ${me.name}` : "Accedi"}
        className={`relative grid size-11 place-items-center rounded-xl bg-white/[0.06] ring-1 ring-inset transition-all duration-200 hover:bg-white/10 ${open ? "ring-white/35" : "ring-white/12"} ${me === undefined ? "opacity-0" : ""}`}
      >
        {me ? (
          <Head uuid={me.mcUuid ?? me.headName} className="size-7" />
        ) : (
          <svg viewBox="0 0 24 24" className="size-6 text-white" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4.2a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Zm0 13.6a7.8 7.8 0 0 1-5.6-2.4c.9-1.8 3.1-2.9 5.6-2.9s4.7 1.1 5.6 2.9a7.8 7.8 0 0 1-5.6 2.4Z" />
          </svg>
        )}
        {me && me.unread > 0 && <span className="absolute -right-1 -top-1 size-3 rounded-full bg-accent ring-2 ring-[#0b0b0c]" aria-label={`${me.unread} notifiche non lette`} />}
      </button>

      {/* pt-2 fa da ponte tra bottone e pannello, così il mouse non lo chiude passando */}
      <div
        role="menu"
        className={`absolute right-0 top-full z-50 origin-top-right pt-2 transition-[opacity,transform,visibility] duration-200 ease-out ${open ? "visible translate-y-0 scale-100 opacity-100" : "pointer-events-none invisible -translate-y-1 scale-[0.97] opacity-0"}`}
      >
        <div className="w-64 rounded-2xl border border-white/10 bg-[#141416]/95 p-2 shadow-2xl shadow-black/60 backdrop-blur">
          {me ? (
            <>
              <div className="flex items-center gap-3 border-b border-white/10 px-3 pb-3 pt-2">
                <Head uuid={me.mcUuid ?? me.headName} className="size-10" />
                <div className="min-w-0">
                  <p className="truncate font-bold">{me.name}</p>
                  <p className="text-xs text-white/50">{me.mcVerified ? "account Minecraft collegato" : "Minecraft non collegato"}</p>
                </div>
              </div>
              <div className="grid gap-0.5 pt-2">
                <Link href="/forum/account" role="menuitem" className={item}>
                  <UserRound className="size-4" aria-hidden /> il tuo account
                </Link>
                <Link href="/forum/mie" role="menuitem" className={item}>
                  <FileText className="size-4" aria-hidden /> le tue pratiche
                </Link>
                <Link href="/forum/notifiche" role="menuitem" className={item}>
                  <Bell className="size-4" aria-hidden /> notifiche
                  {me.unread > 0 && <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs text-white">{me.unread}</span>}
                </Link>
                <form action="/api/auth/logout" method="post" className="mt-1 border-t border-white/10 pt-1">
                  <button type="submit" role="menuitem" className={`${item} w-full`}>
                    <LogOut className="size-4" aria-hidden /> esci
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="grid gap-3 p-2">
              <div>
                <p className="font-bold">Non hai fatto l&apos;accesso</p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">Si entra con Discord, senza creare una nuova password.</p>
              </div>
              <a href={`/api/auth/discord/login?next=${encodeURIComponent(pathname || "/")}`} role="menuitem" className="btn btn-discord !h-10 !px-4 !text-xs">
                <DiscordIcon className="size-4" /> accedi con discord
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
