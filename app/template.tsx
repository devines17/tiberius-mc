"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * Ogni navigazione ricrea questo template. Sulla home (entrando da fuori sito
 * o arrivandoci da un'altra pagina) un sipario nero dal bordo ad arco si alza
 * e la scopre; le altre pagine usano il Goldone di caricamento (NavLoader).
 * Senza JavaScript o con "riduci movimento" il sipario non esiste.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Prima del disegno, così la home non si vede per un attimo prima del sipario
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (pathname === "/" && !reduce) root.classList.add("intro");
    if (!root.classList.contains("intro")) {
      el.style.display = "none";
      return;
    }
    el.style.display = "";
    const tween = gsap.fromTo(
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
    return () => {
      tween.kill();
      root.classList.remove("intro");
    };
  }, [pathname]);

  return (
    <>
      <div ref={ref} className="curtain" aria-hidden="true" />
      {children}
    </>
  );
}
