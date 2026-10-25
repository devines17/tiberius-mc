"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Ogni navigazione ricrea questo template: un sipario nero dal bordo ad
 * arco si alza e scopre la pagina. Senza JavaScript o con "riduci
 * movimento" il sipario non esiste.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    // Il sipario c'è solo entrando in home da fuori sito (classe .intro messa in <head>)
    if (!root.classList.contains("intro")) {
      el.style.display = "none";
      return;
    }
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el,
        { yPercent: 0 },
        {
          yPercent: -115,
          duration: 0.95,
          ease: "power4.inOut",
          delay: 0.08,
          onComplete: () => {
            el.style.display = "none";
            root.classList.remove("intro");
          },
        },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <>
      <div ref={ref} className="curtain" aria-hidden="true" />
      {children}
    </>
  );
}
