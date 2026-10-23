import { ExternalLink, Map as MapIcon } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { SectionHeading } from "@/components/ui";

export function MapPreview() {
  const mapUrl = siteConfig.links.map;

  return (
    <section id="mappa" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeading
        eyebrow="Mappa"
        title="Il mondo, dall'alto"
        description="Esplora i territori dell'impero e individua città e nazioni."
      />

      <div className="panel mt-12 overflow-hidden">
        {mapUrl ? (
          <>
            <iframe
              src={mapUrl}
              title="Mappa interattiva di Tiberius MC"
              loading="lazy"
              className="h-[28rem] w-full border-0 sm:h-[36rem]"
              referrerPolicy="no-referrer"
            />
            <div className="flex justify-end border-t border-gold/15 p-3">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-gold-bright transition-colors hover:bg-gold/10"
              >
                Apri a schermo intero
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </div>
          </>
        ) : (
          <div className="relative flex min-h-[22rem] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            {/* Griglia cartografica decorativa */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-gold) 1px, transparent 1px), linear-gradient(90deg, var(--color-gold) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
            <span className="relative flex size-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold-bright">
              <MapIcon className="size-7" aria-hidden="true" />
            </span>
            <h3 className="relative font-display text-xl font-bold uppercase tracking-wide text-ivory">
              Mappa in preparazione
            </h3>
            <p className="relative max-w-xl text-stone">
              La mappa interattiva sarà collegata non appena Dynmap, BlueMap o un servizio equivalente sarà disponibile
              sul server. Nessuna mappa simulata: quando comparirà, sarà quella reale.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
