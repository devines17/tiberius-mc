"use client";

import { useEffect } from "react";
import gsap from "gsap";

/** Entrata del primo schermo: parole, poi il resto. Parte dopo il sipario. */
export function HeroIntro() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ delay: 0.7 });
      tl.to("[data-hero-words] .w > span", { y: 0, duration: 1.1, ease: "power4.out", stagger: 0.09 })
        .to("[data-hero-in]", { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 }, "-=0.7")
        .to("[data-fade]", { opacity: 1, duration: 0.8 }, "<");
      gsap.fromTo("[data-hero-arch]", { yPercent: 14, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.4, ease: "power4.out", delay: 0.6 });
      gsap.to("[data-float]", { y: -14, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.4 });
    });
    return () => mm.revert();
  }, []);
  return null;
}
