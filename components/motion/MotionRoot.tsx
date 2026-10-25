"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Motore delle animazioni. Legge gli attributi data-* nel DOM:
 *
 *   data-reveal              compare entrando nello schermo. Valori:
 *                              "" o "up"  sale dal basso
 *                              "left"     arriva da sinistra
 *                              "right"    arriva da destra
 *                              "zoom"     cresce leggermente
 *                              "fade"     solo dissolvenza
 *                              "clip"     si scopre dal basso (immagini)
 *   data-stagger="0.08"      i figli compaiono uno dopo l'altro
 *   data-delay="0.2"         ritardo in secondi (reveal e stagger)
 *   data-words               le parole del titolo salgono
 *   data-scrub               le parole si accendono con lo scroll
 *   data-parallax            l'elemento scorre più lento del resto
 *   data-magnetic            il pulsante segue il puntatore
 *
 * Le animazioni allo scroll sono reversibili: risalendo la pagina gli
 * elementi sotto lo schermo spariscono, scendendo di nuovo ricompaiono.
 *
 * Primo schermo di ogni pagina (dopo il sipario, una volta sola):
 *   data-hero-logo, data-hero-words, data-hero-in, data-fade
 *
 * Sicurezza:
 * - Lo stato nascosto di partenza esiste solo con la classe .motion,
 *   messa in <head> da uno script. Senza JavaScript tutto è visibile.
 * - Se questo file non parte entro 4 secondi, lo script in <head>
 *   toglie .motion e il contenuto appare comunque.
 * - Con "riduci movimento" .motion non viene messa (o viene tolta se
 *   l'utente cambia impostazione) e nulla si muove.
 */

type MotionWindow = Window & { __motionTimer?: number };

const EASE = "power3.out";
const START = "top 88%";
const HIDE = { duration: 0.45, ease: "power2.out" } as const;

/** Stato nascosto di ogni variante. La distanza laterale si accorcia sugli schermi stretti. */
function fromVars(variant: string, radius: string): gsap.TweenVars {
  const dx = Math.min(44, window.innerWidth * 0.08);
  switch (variant) {
    case "left":
      return { opacity: 0, x: -dx, y: 0, scale: 1 };
    case "right":
      return { opacity: 0, x: dx, y: 0, scale: 1 };
    case "zoom":
      return { opacity: 0, x: 0, y: 12, scale: 0.92 };
    case "fade":
      return { opacity: 0, x: 0, y: 0, scale: 1 };
    case "clip":
      return { opacity: 1, clipPath: `inset(100% 0% 0% 0% round ${radius})` };
    default:
      return { opacity: 0, x: 0, y: 36, scale: 1 };
  }
}

/** Stato visibile, scritto per intero così si può partire da qui quando si nasconde. */
function shownVars(variant: string, radius: string): gsap.TweenVars {
  if (variant === "clip") return { opacity: 1, clipPath: `inset(0% 0% 0% 0% round ${radius})` };
  return { opacity: 1, x: 0, y: 0, scale: 1 };
}

/** A fine entrata l'elemento torna "normale": così gli effetti hover in CSS funzionano. */
function settle(el: Element) {
  el.classList.add("is-in");
  gsap.set(el, { clearProps: "opacity,transform,clipPath,willChange" });
}

/** Prima di nasconderlo, l'elemento riprende gli stili inline che il CSS gli toglierebbe di colpo. */
function unsettle(el: Element, shown: gsap.TweenVars) {
  gsap.killTweensOf(el);
  if (el.classList.contains("is-in")) {
    gsap.set(el, shown);
    el.classList.remove("is-in");
  }
}

export function MotionRoot() {
  const pathname = usePathname();

  // Ricaricando la pagina si riparte dall'alto (il browser altrimenti ripristina l'ultima posizione).
  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === "reload" && !location.hash) {
      // ScrollTrigger ricorda la posizione e la ripristina: va azzerata anche lì
      ScrollTrigger.clearScrollMemory("manual");
      window.scrollTo(0, 0);
      requestAnimationFrame(() => window.scrollTo(0, 0));
      window.addEventListener("load", () => window.scrollTo(0, 0), { once: true });
    }
    const beforeUnload = () => {
      history.scrollRestoration = "manual";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const w = window as MotionWindow;
    if (w.__motionTimer) {
      clearTimeout(w.__motionTimer);
      w.__motionTimer = undefined;
    }

    const mm = gsap.matchMedia();

    // Chi chiede meno movimento vede tutto subito, anche se cambia idea a pagina aperta.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      root.classList.remove("motion");
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Se lo script di sicurezza ha già mostrato tutto, non nascondiamo più nulla.
      if (!root.classList.contains("motion")) return;
      root.dataset.motionReady = "1";
      const cleanups: Array<() => void> = [];
      const curtainDelay = root.classList.contains("intro") ? 0.75 : 0.1;

      /* ---------- Primo schermo ---------- */
      const intro = gsap.timeline({ delay: curtainDelay });
      const logo = document.querySelector("[data-hero-logo]");
      if (logo) {
        intro.fromTo(logo, { opacity: 0, scale: 0.9, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "power4.out" });
      }
      // y: 0 annulla lo spostamento del CSS di partenza: a muovere le parole è solo yPercent.
      const heroWords = gsap.utils.toArray<HTMLElement>("[data-hero-words] .w > span");
      if (heroWords.length) {
        intro.fromTo(
          heroWords,
          { y: 0, yPercent: 112 },
          { y: 0, yPercent: 0, duration: 1.05, ease: "power4.out", stagger: 0.08 },
          logo ? "-=0.75" : 0,
        );
      }
      const heroIn = gsap.utils.toArray<HTMLElement>("[data-hero-in]");
      if (heroIn.length) {
        intro.fromTo(heroIn, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.1 }, heroWords.length ? "-=0.7" : 0);
      }
      // Le dissolvenze arrivano all'opacità prevista dal CSS (es. opacity-70), non a 1.
      gsap.utils.toArray<HTMLElement>("[data-fade]").forEach((el) => {
        el.classList.add("is-in");
        const target = Number(getComputedStyle(el).opacity) || 1;
        el.classList.remove("is-in");
        intro.fromTo(el, { opacity: 0 }, { opacity: target, duration: 0.8, onComplete: () => settle(el) }, 0);
      });

      // Quello che è già sullo schermo al caricamento parte quando il sipario si alza.
      const t0 = performance.now();
      const wait = () => Math.max(0, curtainDelay - (performance.now() - t0) / 1000);

      /* ---------- Elementi che compaiono allo scroll ---------- */
      // Anche gli elementi già comparsi (es. il footer dopo un cambio pagina) restano reversibili.
      const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      const radiusOf = (el: HTMLElement) => getComputedStyle(el).borderTopLeftRadius || "0px";
      const variantOf = (el: HTMLElement) => el.dataset.reveal || "up";
      const imgOf = (el: HTMLElement) => (variantOf(el) === "clip" ? el.querySelector("img") : null);

      reveals.forEach((el) => {
        if (el.classList.contains("is-in")) return;
        gsap.set(el, { ...fromVars(variantOf(el), radiusOf(el)), willChange: "transform, opacity" });
        const img = imgOf(el);
        if (img) gsap.set(img, { scale: 1.12 });
      });

      const show = (el: HTMLElement, delay: number) => {
        const variant = variantOf(el);
        gsap.killTweensOf(el);
        const clip = variant === "clip";
        gsap.to(el, {
          ...shownVars(variant, radiusOf(el)),
          duration: clip ? 1.15 : variant === "fade" ? 0.8 : 0.9,
          ease: clip ? "power4.out" : EASE,
          delay,
          onComplete: () => settle(el),
        });
        const img = imgOf(el);
        if (img) {
          gsap.killTweensOf(img);
          gsap.to(img, { scale: 1, duration: 1.4, ease: EASE, delay, clearProps: "transform" });
        }
      };

      const hide = (el: HTMLElement) => {
        const variant = variantOf(el);
        unsettle(el, shownVars(variant, radiusOf(el)));
        gsap.to(el, { ...fromVars(variant, radiusOf(el)), ...HIDE });
        const img = imgOf(el);
        if (img) {
          gsap.killTweensOf(img);
          gsap.set(img, { scale: 1.12 });
        }
      };

      if (reveals.length) {
        ScrollTrigger.batch(reveals, {
          start: START,
          onEnter: (batch) => {
            const base = wait();
            (batch as HTMLElement[]).forEach((el, i) => show(el, base + Number(el.dataset.delay || 0) + i * 0.08));
          },
          onLeaveBack: (batch) => (batch as HTMLElement[]).forEach(hide),
        });
      }

      /* ---------- Gruppi: i figli entrano uno dopo l'altro ---------- */
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
        const kids = Array.from(group.children);
        if (!kids.length) return;
        const hidden = kids.filter((c) => !c.classList.contains("is-in"));
        if (hidden.length) gsap.set(hidden, { opacity: 0, y: 28, willChange: "transform, opacity" });
        const each = Number(group.dataset.stagger || 0.09);
        ScrollTrigger.create({
          trigger: group,
          start: "top 90%",
          onEnter: () => {
            const delay = wait() + Number(group.dataset.delay || 0);
            kids.forEach((kid, i) => {
              gsap.killTweensOf(kid);
              gsap.to(kid, { opacity: 1, y: 0, duration: 0.8, ease: EASE, delay: delay + i * each, onComplete: () => settle(kid) });
            });
          },
          onLeaveBack: () => {
            kids.forEach((kid) => {
              unsettle(kid, { opacity: 1, y: 0 });
              gsap.to(kid, { opacity: 0, y: 28, ...HIDE });
            });
          },
        });
      });

      /* ---------- Titoli: parole che salgono ---------- */
      gsap.utils.toArray<HTMLElement>("[data-words]").forEach((el) => {
        const words = el.querySelectorAll(".w > span");
        if (!words.length) return;
        gsap.set(words, { y: 0, yPercent: 112 });
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          onEnter: () => {
            gsap.killTweensOf(words);
            gsap.to(words, {
              y: 0,
              yPercent: 0,
              duration: 1,
              ease: "power4.out",
              stagger: 0.07,
              delay: wait() + Number(el.dataset.delay || 0),
            });
          },
          onLeaveBack: () => {
            gsap.killTweensOf(words);
            gsap.to(words, { y: 0, yPercent: 112, ...HIDE });
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-scrub]").forEach((el) => {
        gsap.to(el.querySelectorAll(".sw"), {
          color: "#f4efe6",
          stagger: 0.12,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax || 0.1) * 100;
        gsap.fromTo(
          el,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      /* ---------- Pulsanti magnetici (solo mouse) ---------- */
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
          const qx = gsap.quickTo(el, "x", { duration: 0.5, ease: EASE });
          const qy = gsap.quickTo(el, "y", { duration: 0.5, ease: EASE });
          const move = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            qx((e.clientX - (r.left + r.width / 2)) * 0.22);
            qy((e.clientY - (r.top + r.height / 2)) * 0.3);
          };
          const leave = () => {
            qx(0);
            qy(0);
          };
          el.addEventListener("mousemove", move);
          el.addEventListener("mouseleave", leave);
          cleanups.push(() => {
            el.removeEventListener("mousemove", move);
            el.removeEventListener("mouseleave", leave);
          });
        });
      }

      // Le immagini e i font cambiano le altezze: ricalcola i punti di partenza.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      document.fonts?.ready.then(refresh).catch(() => {});
      cleanups.push(() => window.removeEventListener("load", refresh));

      return () => cleanups.forEach((fn) => fn());
    });

    return () => mm.revert();
  }, [pathname]);

  return null;
}
