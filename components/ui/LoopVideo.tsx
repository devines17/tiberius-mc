"use client";

import { useEffect, useRef } from "react";

/**
 * Clip muta in loop, come una GIF ma leggera.
 * - Parte solo quando è sullo schermo e si ferma quando esce (risparmia batteria).
 * - Con "riduci movimento" resta ferma sul fotogramma di copertina.
 */
export function LoopVideo({ src, poster, label, className = "" }: { src: string; poster: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const play = () => {
      if (reduce.matches) return;
      video.play().catch(() => {
        // autoplay bloccato dal browser: resta la copertina
      });
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) play();
        else video.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(video);
    const onReduce = () => (reduce.matches ? video.pause() : play());
    reduce.addEventListener("change", onReduce);
    return () => {
      io.disconnect();
      reduce.removeEventListener("change", onReduce);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
      disablePictureInPicture
    />
  );
}
