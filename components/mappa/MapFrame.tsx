"use client";

import { useRef, useState } from "react";
import { ExternalLink, Maximize2, RotateCw } from "lucide-react";

/** Mappa dal vivo del server (BlueMap, Dynmap o squaremap) dentro la pagina, con schermo intero. */
export function MapFrame({ src }: { src: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [key, setKey] = useState(0);

  return (
    <div ref={box} className="map-box fbox overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] px-3 py-2">
        <p className="flex items-center gap-2 px-1 text-sm font-semibold">
          <span className="size-2 rounded-full bg-emerald-400" aria-hidden />
          Mappa dal vivo
        </p>
        <div className="flex gap-1.5">
          <button type="button" className="map-btn" onClick={() => { setLoaded(false); setKey((k) => k + 1); }} title="Ricarica la mappa">
            <RotateCw className="size-4" aria-hidden />
            <span className="sr-only">Ricarica</span>
          </button>
          <button type="button" className="map-btn" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : box.current?.requestFullscreen?.())} title="Schermo intero">
            <Maximize2 className="size-4" aria-hidden />
            <span className="hidden sm:inline">Schermo intero</span>
          </button>
          <a href={src} target="_blank" rel="noopener noreferrer" className="map-btn" title="Apri in una nuova scheda">
            <ExternalLink className="size-4" aria-hidden />
            <span className="hidden sm:inline">Nuova scheda</span>
          </a>
        </div>
      </div>
      <div className="relative h-[72svh] min-h-[26rem] bg-[#0f1012]">
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center text-sm text-white/50">
            <span className="flex items-center gap-2">
              <RotateCw className="size-4 animate-spin" aria-hidden /> Carico la mappa…
            </span>
          </div>
        )}
        <iframe key={key} src={src} title="Mappa di TiberiusMC" onLoad={() => setLoaded(true)} allow="fullscreen" className="relative h-full w-full border-0" />
      </div>
    </div>
  );
}
