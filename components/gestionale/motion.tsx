"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Castle, LayoutDashboard, Landmark, Swords } from "lucide-react";

const still = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Il cielo e le monete della testata seguono il puntatore. */
export function Parallax({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || still()) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = ((e.clientY - r.top) / r.height) * 2 - 1;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--gx", x.toFixed(3));
        el.style.setProperty("--gy", y.toFixed(3));
      });
    };
    el.addEventListener("pointermove", move);
    return () => {
      el.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Il personaggio gira piano da solo; si può trascinare per girarlo a mano. */
export function Spin({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let angle = -28;
    let vel = 0;
    let drag: { x: number; a: number; t: number; last: number } | null = null;
    let raf = 0;
    let prev = performance.now();
    const idle = still() ? 0 : 14; // gradi al secondo
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (!drag) {
        vel += (idle - vel) * Math.min(1, dt * 1.6);
        angle += vel * dt;
      }
      el.style.setProperty("--spin", `${angle.toFixed(2)}deg`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, a: angle, t: performance.now(), last: e.clientX };
      el.setPointerCapture(e.pointerId);
      el.dataset.drag = "1";
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const now = performance.now();
      const dx = e.clientX - drag.last;
      vel = (dx * 0.6) / Math.max(0.008, (now - drag.t) / 1000);
      drag.t = now;
      drag.last = e.clientX;
      angle = drag.a + (e.clientX - drag.x) * 0.6;
    };
    const up = () => {
      drag = null;
      delete el.dataset.drag;
      vel = Math.max(-720, Math.min(720, vel));
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);
  return (
    <div ref={ref} className="gx-spin" title="Trascina per girare il personaggio">
      {children}
    </div>
  );
}

const fmt = {
  money: new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  int: new Intl.NumberFormat("it-IT"),
};

/** Numero che sale da zero al valore. */
export function CountUp({ value, kind = "int", prefix = "" }: { value: number; kind?: "money" | "int"; prefix?: string }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (still() || value === 0) return;
    let raf = 0;
    const start = performance.now();
    const D = 1400;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / D);
      setShown(value * (1 - Math.pow(2, -10 * p)));
      if (p < 1) raf = requestAnimationFrame(step);
      else setShown(value);
    };
    setShown(0);
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span className="tabular-nums">
      {prefix}
      {kind === "money" ? fmt.money.format(shown) : fmt.int.format(Math.round(shown))}
    </span>
  );
}

const ITEMS = [
  { href: "/portale", label: "Panoramica", icon: LayoutDashboard },
  { href: "/portale/banca", label: "Conto", icon: Landmark },
  { href: "/portale/citta", label: "Città e nazione", icon: Castle },
  { href: "/portale/guerre", label: "Guerre e PvP", icon: Swords },
];

/** Barra delle sezioni: la pillola rossa scivola sulla sezione aperta. */
export function Dock() {
  return <DockView current={usePathname()} />;
}

export const DOCK_ITEMS = ITEMS;

/** La barra vera e propria: current è l'indirizzo della sezione accesa (usata anche dal teaser). */
export function DockView({ current }: { current: string }) {
  const nav = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  useLayoutEffect(() => {
    const place = () => {
      const n = nav.current;
      const a = n?.querySelector<HTMLElement>('[aria-current="page"]');
      if (!n || !a) return;
      setPill({ x: a.offsetLeft, w: a.offsetWidth });
      // Su schermi stretti la barra scorre: porta la sezione accesa al centro
      if (n.scrollWidth > n.clientWidth) n.scrollTo({ left: a.offsetLeft - (n.clientWidth - a.offsetWidth) / 2, behavior: "smooth" });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [current]);
  return (
    <div className="gx-dock-wrap">
      <nav ref={nav} aria-label="Sezioni del gestionale" className="gx-dock no-scrollbar">
        {pill && <span className="gx-dock-pill" style={{ transform: `translateX(${pill.x}px)`, width: pill.w }} aria-hidden />}
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-current={current === href ? "page" : undefined} className="gx-dock-item">
            <Icon className="size-[18px]" aria-hidden />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
