"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, FileText, LogOut, UserRound } from "lucide-react";

type Me = { name: string; mcVerified: boolean; mcUuid: string | null; staff: boolean; unread: number };

/** Testa della skin: con l'account Minecraft collegato la sua, altrimenti quella di Steve. */
function Head({ uuid, className = "" }: { uuid: string | null; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://mc-heads.net/avatar/${uuid ?? "MHF_Steve"}/48`}
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

  if (!me) {
    return (
      <Link
        href="/forum/accedi"
        className={`btn !h-11 !bg-transparent !px-5 !text-white ring-1 ring-inset ring-white/25 hover:!bg-white/10 hover:ring-white/45 ${me === undefined ? "opacity-0" : ""}`}
      >
        accedi
      </Link>
    );
  }

  const item = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-white/80 transition-colors hover:bg-white/10 hover:text-white";
  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-11 items-center gap-2.5 rounded-[14px] py-1.5 pl-1.5 pr-3 ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/10 hover:ring-white/30"
      >
        <span className="relative">
          <Head uuid={me.mcUuid} className="size-8" />
          {me.unread > 0 && <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-accent ring-2 ring-[#0b0b0c]" aria-label={`${me.unread} notifiche non lette`} />}
        </span>
        <span className="max-w-[9rem] truncate text-sm font-bold xl:max-2xl:sr-only">{me.name}</span>
        <ChevronDown className={`size-4 text-white/60 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-2xl border border-white/10 bg-[#141416] p-2 shadow-2xl shadow-black/60">
          <div className="flex items-center gap-3 border-b border-white/10 px-3 pb-3 pt-2">
            <Head uuid={me.mcUuid} className="size-10" />
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
        </div>
      )}
    </div>
  );
}
