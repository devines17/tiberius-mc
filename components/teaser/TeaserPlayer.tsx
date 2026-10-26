"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import { TiberiusLogo } from "@/components/TiberiusLogo";
import { DockView } from "@/components/gestionale/motion";

/** Didascalie: descrivono solo quello che le schermate mostrano davvero. */
const CAPTIONS = [
  { k: "intro", t: "Il tuo centro di comando", s: "Il gestionale di TiberiusMC, direttamente sul sito." },
  { k: "skin", t: "Il tuo personaggio", s: "La tua skin in 3D sul piedistallo: si gira trascinandola." },
  { k: "stats", t: "Patrimonio", s: "Monete, Goldoni, tempo di gioco e uccisioni." },
  { k: "eco", t: "Economia", s: "L'andamento del conto e le ultime transazioni." },
  { k: "conto", t: "Conto", s: "Saldo, entrate e uscite della settimana, movimenti." },
  { k: "citta", t: "Città e nazione", s: "Sindaco, cittadini, banca e tasse, territorio, alleati e nemici." },
  { k: "guerre", t: "Guerre e PvP", s: "Uccisioni, morti e le guerre combattute." },
  { k: "vex", t: "La tua città", s: "Il suo stendardo, con l'iniziale del nome." },
];

const TAGLINE = "Il tuo impero, sotto controllo";
const HOME = "/portale";

type Phase = "idle" | "playing" | "paused" | "done";

/**
 * Regia del teaser: le schermate vere del gestionale (passate dal server) dentro
 * uno schermo virtuale, inquadrato da una "camera" animata con GSAP.
 * Parte quando è in vista, si ferma quando esce, non blocca lo scroll.
 * Con "riduci movimento" mostra solo la composizione finale, ferma.
 */
export function TeaserPlayer({ stage, screens }: { stage: ReactNode; screens: Record<string, ReactNode> }) {
  const frame = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const cam = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const userPaused = useRef(false);
  const visible = useRef(false);

  const [active, setActive] = useState(HOME);
  const [still, setStill] = useState(false);
  const [vw, setVw] = useState(1280);
  const [size, setSize] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      setStill(rm.matches);
      setVw(wide.matches ? 1280 : 430);
    };
    sync();
    rm.addEventListener("change", sync);
    wide.addEventListener("change", sync);
    return () => {
      rm.removeEventListener("change", sync);
      wide.removeEventListener("change", sync);
    };
  }, []);

  // Larghezza della cornice: al cambio si ricostruisce la regia allo stesso punto
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let t = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = window.setTimeout(() => setSize(el.clientWidth), 120);
    });
    ro.observe(el);
    setSize(el.clientWidth);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, []);

  const go = useCallback((href: string) => flushSync(() => setActive(href)), []);

  useLayoutEffect(() => {
    const f = frame.current;
    const c = cam.current;
    const sc = screen.current;
    const tw = tilt.current;
    if (!f || !c || !sc || !tw || !size) return;
    const q = gsap.utils.selector(f);
    const mobile = vw < 768;
    const fit = () => f.clientWidth / vw;
    const fitView = { x: 0, y: 0, scale: fit() };

    // Posizione di un elemento dentro lo schermo virtuale (coordinate di layout, senza trasformazioni)
    const place = (sel: string) => {
      let el = sc.querySelector<HTMLElement>(sel);
      if (!el) return null;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      let x = 0;
      let y = 0;
      while (el && el !== sc) {
        x += el.offsetLeft;
        y += el.offsetTop;
        el = el.offsetParent as HTMLElement | null;
      }
      return { cx: x + w / 2, cy: y + h / 2 };
    };
    const zoom = (z: number) => 1 + (z - 1) * (mobile ? 0.5 : 1);
    const aim = (sel: string, z: number, k: "x" | "y" | "scale") => {
      const p = place(sel);
      const s = fit() * zoom(z);
      if (!p) return fitView[k];
      if (k === "scale") return s;
      if (k === "x") return f.clientWidth / 2 - p.cx * s;
      return f.clientHeight / 2 - p.cy * s;
    };
    const shot = (sel: string, z: number) => ({ x: () => aim(sel, z, "x"), y: () => aim(sel, z, "y"), scale: () => aim(sel, z, "scale") });
    const cap = (k: string) => q(`.tz-cap[data-k="${k}"]`);

    const prevTime = tl.current?.time() ?? 0;
    const wasPlaying = tl.current?.isActive() ?? false;
    tl.current?.kill();

    if (still) {
      gsap.set(c, fitView);
      gsap.set(tw, { autoAlpha: 1, clearProps: "transform" });
      gsap.set(q(".tz-intro, .tz-cap"), { autoAlpha: 0 });
      gsap.set(q(".tz-dim, .tz-outro, .tz-outro > *"), { autoAlpha: 1, clearProps: "transform" });
      tl.current = null;
      return;
    }

    const t = gsap.timeline({
      paused: true,
      defaults: { ease: "power2.inOut" },
      onUpdate: () => {
        gsap.set(q(".tz-bar"), { scaleX: t.progress() });
      },
      onComplete: () => setPhase("done"),
    });

    // Stato di partenza. sched: quale pagina è aperta da quale secondo (serve se la regia si ricostruisce a metà)
    const sched: [number, string][] = [[0, HOME]];
    t.call(() => setActive(HOME), [], 0);
    t.set(c, fitView, 0);
    t.set(tw, { autoAlpha: 0, rotationX: 0, rotationY: 0, y: 0, scale: 1 }, 0);
    t.set(q(".tz-dim, .tz-outro, .tz-cap"), { autoAlpha: 0 }, 0);
    t.set(q(".tz-intro"), { autoAlpha: 1 }, 0);
    t.set(q(".tz-logo"), { autoAlpha: 0, scale: 1.18, filter: "blur(14px)" }, 0);
    t.set(q(".tz-rule"), { scaleX: 0 }, 0);
    t.set(q(".tz-w"), { autoAlpha: 0, yPercent: 60 }, 0);
    t.set(q(".tz-sweep"), { xPercent: -130 }, 0);

    // 1. Introduzione: il logo emerge dal buio, poi la frase
    t.to(q(".tz-logo"), { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1.4, ease: "power3.out" }, 0.2);
    t.to(q(".tz-rule"), { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0.9);
    t.to(q(".tz-w"), { autoAlpha: 1, yPercent: 0, duration: 0.6, stagger: 0.07, ease: "power3.out" }, 1.1);
    t.to(q(".tz-intro"), { autoAlpha: 0, y: -24, duration: 0.6, ease: "power2.in" }, 2.5);
    t.set(q(".tz-intro"), { y: 0 }, 3.2);

    // 2. Ingresso nel gestionale: lo schermo si raddrizza venendo avanti, la testata si apre dal centro
    t.fromTo(tw, { autoAlpha: 0, rotationX: mobile ? 0 : 26, y: 70, scale: 0.84 }, { autoAlpha: 1, rotationX: 0, y: 0, scale: 1, duration: 2, ease: "power3.inOut" }, 2.7);
    t.fromTo(q(".tz-screen .gx-stage"), { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power3.inOut", clearProps: "clipPath" }, 2.9);
    t.fromTo(cap("intro"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 4.0);
    t.to(cap("intro"), { autoAlpha: 0, y: -10, duration: 0.4 }, 5.1);

    // 3. Le sezioni, una alla volta
    let at = 5.2;
    const visit = (sel: string, z: number, k: string, hold = 1.0, dur = 1.25) => {
      t.to(c, { ...shot(sel, z), duration: dur }, at);
      t.fromTo(cap(k), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }, at + dur * 0.55);
      t.to(cap(k), { autoAlpha: 0, y: -10, duration: 0.35 }, at + dur + hold);
      at += dur + hold + 0.1;
    };
    visit(".gx-hero-figure", 1.55, "skin", 0.8, 1.3);
    visit('[data-tz="stats"]', 1.22, "stats", 0.75, 1.15);
    visit('[data-tz="economia"]', 1.1, "eco", 0.75, 1.15);

    // Le altre pagine: la barra resta in alto nell'inquadratura e la pillola scivola da una sezione all'altra
    const top = (z: number, k: "x" | "y" | "scale") => {
      const p = place(".gx-dock");
      const sc2 = fit() * zoom(z);
      if (!p) return fitView[k];
      if (k === "scale") return sc2;
      if (k === "x") return f.clientWidth / 2 - (vw / 2) * sc2;
      return f.clientHeight * 0.08 - (p.cy - 30) * sc2;
    };
    t.to(c, { x: () => top(1.05, "x"), y: () => top(1.05, "y"), scale: () => top(1.05, "scale"), duration: 1.0 }, at);
    at += 0.9;
    for (const [href, k] of [["/portale/banca", "conto"], ["/portale/citta", "citta"], ["/portale/guerre", "guerre"]] as const) {
      t.call(() => go(href), [], at);
      sched.push([at, href]);
      t.fromTo(cap(k), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, at + 0.25);
      t.to(c, { y: "-=26", duration: 1.9, ease: "none" }, at);
      t.to(cap(k), { autoAlpha: 0, y: -10, duration: 0.3 }, at + 1.65);
      at += 2.0;
    }

    // 4. Momento spettacolare: lo stendardo della città da vicino, con un riflesso d'oro
    t.to(c, { ...fitView, duration: 0.7, ease: "power2.in" }, at);
    t.call(() => go(HOME), [], at + 0.7);
    sched.push([at + 0.7, HOME]);
    at += 0.85;
    t.to(c, { ...shot(".gx-vex", 2.2), duration: 1.6, ease: "power3.inOut" }, at);
    if (!mobile) t.to(tw, { rotationY: -7, rotationX: 5, duration: 1.6, ease: "power3.inOut" }, at);
    t.fromTo(cap("vex"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }, at + 0.9);
    t.to(q(".tz-sweep"), { xPercent: 130, duration: 1.5, ease: "power2.inOut" }, at + 1.0);
    t.to(cap("vex"), { autoAlpha: 0, y: -10, duration: 0.35 }, at + 2.6);
    at += 2.7;

    // 5. Chiusura: si torna indietro, il gestionale resta sullo sfondo, logo, frase e invito
    t.to(c, { ...fitView, duration: 1.6, ease: "power3.inOut" }, at);
    t.to(tw, { rotationY: 0, rotationX: 0, duration: 1.6, ease: "power3.inOut" }, at);
    t.to(q(".tz-dim"), { autoAlpha: 1, duration: 1.2 }, at + 0.4);
    t.set(q(".tz-outro"), { autoAlpha: 1 }, at + 0.8);
    t.fromTo(q(".tz-outro > *"), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.18, ease: "power3.out" }, at + 0.8);
    t.to({}, { duration: 0.6 }, at + 2.0);

    tl.current = t;
    if (prevTime) {
      setActive(sched.filter(([s0]) => s0 <= prevTime).pop()?.[1] ?? HOME);
      t.time(prevTime);
      if (wasPlaying) t.play();
    } else {
      t.progress(0);
    }
  }, [still, vw, size, go]);

  // Parte quando il teaser è in vista, si ferma quando esce
  useEffect(() => {
    const el = frame.current;
    if (!el || still) return;
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting;
        const t = tl.current;
        if (!t) return;
        if (e.isIntersecting && !userPaused.current && t.progress() < 1) {
          t.play();
          setPhase("playing");
        } else if (!e.isIntersecting && t.isActive()) {
          t.pause();
          setPhase("paused");
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [still, size]);

  const toggle = () => {
    const t = tl.current;
    if (!t) return;
    if (phase === "done") {
      userPaused.current = false;
      t.restart();
      setPhase("playing");
    } else if (t.isActive()) {
      userPaused.current = true;
      t.pause();
      setPhase("paused");
    } else {
      userPaused.current = false;
      t.play();
      setPhase("playing");
    }
  };

  const replay = () => {
    userPaused.current = false;
    tl.current?.restart();
    setPhase("playing");
  };

  return (
    <div ref={frame} className="tz-frame" data-still={still || undefined}>
      {/* Schermo virtuale: le pagine vere del gestionale, solo da guardare */}
      <div className="tz-persp" aria-hidden>
        <div ref={tilt} className="tz-tilt">
          <div ref={cam} className="tz-cam">
            <div ref={screen} className="tz-screen" style={{ width: vw }} inert>
              <div className="gx pb-12">
                {stage}
                <DockView current={active} />
                <div className="mx-auto w-full max-w-[72rem] px-4 pt-8 md:px-8">
                  <div key={active}>{screens[active]}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tz-vignette" aria-hidden />
      <div className="tz-sweep" aria-hidden />
      <div className="tz-dim" aria-hidden />

      {/* 1. Introduzione */}
      <div className="tz-intro" aria-hidden>
        <div className="tz-logo">
          <TiberiusLogo variant="fluid" className="w-full" />
        </div>
        <span className="tz-rule" />
        <p className="tz-tag">
          {TAGLINE.split(" ").map((w, i) => (
            <span key={i} className="tz-wbox">
              <span className="tz-w">{w}</span>
            </span>
          ))}
        </p>
      </div>

      {/* Didascalie delle sezioni */}
      <div className="tz-caps" aria-hidden>
        {CAPTIONS.map((c) => (
          <div key={c.k} className="tz-cap" data-k={c.k}>
            <p className="tz-cap-t">{c.t}</p>
            <p className="tz-cap-s">{c.s}</p>
          </div>
        ))}
      </div>

      {/* 5. Chiusura */}
      <div className="tz-outro">
        <div className="tz-ologo">
          <TiberiusLogo variant="fluid" className="w-full" />
        </div>
        <p className="tz-otag">{TAGLINE}</p>
        <div>
          <Link href={HOME} className="btn btn-accent tz-cta">
            Entra nel gestionale <ArrowRight className="size-5" aria-hidden />
          </Link>
        </div>
      </div>

      {!still && (
        <div className="tz-controls">
          <button type="button" onClick={toggle} className="tz-btn" aria-label={phase === "playing" ? "Metti in pausa il teaser" : phase === "done" ? "Rivedi il teaser" : "Riproduci il teaser"}>
            {phase === "playing" ? <Pause className="size-4" aria-hidden /> : phase === "done" ? <RotateCcw className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          </button>
          {phase !== "done" && phase !== "idle" && (
            <button type="button" onClick={replay} className="tz-btn" aria-label="Ricomincia il teaser">
              <RotateCcw className="size-4" aria-hidden />
            </button>
          )}
        </div>
      )}
      <span className="tz-bar" aria-hidden />
    </div>
  );
}
