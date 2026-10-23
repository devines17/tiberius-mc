"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Motore delle animazioni di scroll. Legge gli attributi data-* nel DOM:
 *   data-reveal        sale e compare
 *   data-stagger       i figli compaiono uno dopo l'altro
 *   data-words         le parole del titolo salgono
 *   data-scrub         le parole si accendono con lo scroll
 *   data-parallax      l'elemento scorre più lento del resto
 *   data-magnetic      il pulsante segue il puntatore
 * Con "riduci movimento" attivo non parte nulla e il contenuto resta visibile.
 */
export function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      root.dataset.motionReady = "1";
      const at = (trigger: Element, start = "top 88%") => ({ trigger, start, once: true });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          delay: Number(el.dataset.delay ?? 0),
          scrollTrigger: at(el),
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
        gsap.to(group.children, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: Number(group.dataset.stagger || 0.09),
          scrollTrigger: at(group, "top 86%"),
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-words]").forEach((el) => {
        gsap.to(el.querySelectorAll(".w > span"), {
          y: 0,
          duration: 1,
          ease: "power4.out",
          stagger: 0.07,
          scrollTrigger: at(el, "top 90%"),
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-scrub]").forEach((el) => {
        gsap.to(el.querySelectorAll(".sw"), {
          color: "#0a0a0a",
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

      const cleanups: Array<() => void> = [];
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
          const qx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
          const qy = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
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

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      cleanups.push(() => window.removeEventListener("load", refresh));

      return () => cleanups.forEach((fn) => fn());
    });

    return () => mm.revert();
  }, [pathname]);

  return null;
}
