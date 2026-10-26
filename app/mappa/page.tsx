import type { Metadata } from "next";
import { Hand, Map as MapIcon, ZoomIn } from "lucide-react";
import { DiscordBand } from "@/components/ui/Blocks";
import { ForumHero } from "@/components/forum/ForumHero";
import { MapFrame } from "@/components/mappa/MapFrame";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Mappa", description: "La mappa del mondo di TiberiusMC: città, nazioni e confini." };

const TIPS = [
  { icon: Hand, text: "Trascina per spostarti" },
  { icon: ZoomIn, text: "Rotella o pizzico per lo zoom" },
];

export default function Page() {
  const src = siteConfig.links.map;
  return (
    <>
      <ForumHero art="mappa" title="Mappa" lead="Il mondo di TiberiusMC dal vivo: città, nazioni e i loro confini." />
      <div className="wrap pb-10 pt-10">
          <div className="grid gap-4">
            {src ? (
              <>
                <MapFrame src={src} />
                <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/55">
                  {TIPS.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-1.5">
                      <Icon className="size-4 text-white/40" aria-hidden />
                      {text}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="map-soon fbox relative grid min-h-[60svh] place-items-center overflow-hidden px-6 text-center">
                <div className="relative grid max-w-md justify-items-center gap-3">
                  <span className="grid size-14 place-items-center rounded-full bg-black/40 ring-1 ring-white/15">
                    <MapIcon className="size-6 text-gold" aria-hidden />
                  </span>
                  <h2 className="text-2xl font-bold">La mappa arriva presto</h2>
                  <p className="text-white/65">Qui vedrai il mondo del server dal vivo, con le città, le nazioni e i loro confini. La stiamo collegando al server.</p>
                </div>
              </div>
            )}
          </div>
      </div>
      <DiscordBand />
    </>
  );
}
