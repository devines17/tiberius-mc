import Image from "next/image";

/**
 * Logo ufficiale di Tiberius MC.
 *
 * Il file originale (public/images/tiberius-mc-logo.png, 569×569 con sfondo
 * trasparente) non viene mai modificato né ridisegnato. Il disegno occupa
 * solo l'area (93,142)–(478,440) del quadrato: il componente nasconde via
 * CSS il margine trasparente, così il logo si allinea correttamente nei
 * layout senza essere deformato. Il file è servito senza ricompressione.
 */

const SRC = "/images/tiberius-mc-logo.png";
const FULL = 569; // lato del file originale
const ART = { x: 93, y: 142, w: 385, h: 298 }; // area visibile del disegno

const variants = {
  /** Barra di navigazione */
  nav: "h-12 sm:h-14",
  /** Pannello player, sidebar, intestazioni */
  compact: "h-16",
  /** Footer, moduli di accesso */
  footer: "h-24",
  auth: "h-32 sm:h-36",
  /** Hero della homepage */
  hero: "h-52 sm:h-64 lg:h-80",
} as const;

export type TiberiusLogoVariant = keyof typeof variants;

type Props = {
  variant?: TiberiusLogoVariant;
  /** Da usare per il logo sopra la piega della pagina. */
  priority?: boolean;
  className?: string;
};

export function TiberiusLogo({
  variant = "nav",
  priority = false,
  className = "",
}: Props) {
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
