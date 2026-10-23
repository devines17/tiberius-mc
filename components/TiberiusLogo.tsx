import Image from "next/image";

/**
 * Logo ufficiale di Tiberius MC.
 *
 * Il file originale (public/images/tiberius-mc-logo.png, 1254×1254 con
 * sfondo trasparente) non viene mai modificato né ridisegnato. Il disegno
 * occupa solo l'area (105,203)–(1166,1028) del quadrato: il componente
 * nasconde via CSS il margine trasparente, così il logo si allinea nei
 * layout senza essere deformato. Il file è servito senza ricompressione.
 */

const SRC = "/images/tiberius-mc-logo.png";
const FULL = 1254; // lato del file originale
const ART = { x: 105, y: 203, w: 1061, h: 825 }; // area visibile del disegno

const variants = {
  /** Barra di navigazione */
  nav: "h-14",
  /** Footer, moduli, pannelli */
  footer: "h-28",
  /** Larghezza decisa da chi lo usa (className con w-…) */
  fluid: "",
} as const;

export type TiberiusLogoVariant = keyof typeof variants;

type Props = {
  variant?: TiberiusLogoVariant;
  /** Da usare per il logo sopra la piega della pagina. */
  priority?: boolean;
  className?: string;
};

export function TiberiusLogo({ variant = "nav", priority = false, className = "" }: Props) {
  return (
    <span
      className={`relative inline-block shrink-0 ${variants[variant]} ${className}`}
      style={{ aspectRatio: `${ART.w} / ${ART.h}` }}
    >
      <Image
        src={SRC}
        alt="Logo ufficiale Tiberius MC"
        width={FULL}
        height={FULL}
        priority={priority}
        unoptimized
        draggable={false}
        className="pointer-events-none absolute max-w-none select-none"
        style={{
          width: `${(FULL / ART.w) * 100}%`,
          height: `${(FULL / ART.h) * 100}%`,
          left: `${(-ART.x / ART.w) * 100}%`,
          top: `${(-ART.y / ART.h) * 100}%`,
        }}
      />
    </span>
  );
}
