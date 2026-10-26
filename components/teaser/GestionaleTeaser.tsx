import { StageView } from "@/components/gestionale/Stage";
import { PanoramicaView } from "@/components/gestionale/views/Panoramica";
import { ContoView } from "@/components/gestionale/views/Conto";
import { CittaView } from "@/components/gestionale/views/Citta";
import { GuerreView } from "@/components/gestionale/views/Guerre";
import { getSkin } from "@/lib/skins";
import { STAFF } from "@/lib/staff";
import type { PlayerView } from "@/lib/server/player";
import { Greeting } from "./Greeting";
import { TeaserPlayer } from "./TeaserPlayer";

/**
 * Teaser del gestionale per la home. Mostra le schermate vere (stessi componenti
 * di /portale) per il profilo del fondatore, così come le vede lui oggi:
 * account riconosciuto, nessun dato di gioco finché il server non è collegato.
 */
export async function GestionaleTeaser() {
  const founder = STAFF[0].membri[0];
  const base = await getSkin(founder.nick);
  const skin = founder.slim === undefined ? base : { ...base, slim: founder.slim };
  const player: PlayerView = { linked: true, name: skin.name, mc: skin.name, data: null, updatedAt: null };
  return (
    <TeaserPlayer
      stage={<StageView skin={skin} name={skin.name} greeting={<Greeting />} chips={[]} linkCta={false} heading="p" />}
      screens={{
        "/portale": <PanoramicaView player={player} notice={false} />,
        "/portale/banca": <ContoView player={player} notice={false} />,
        "/portale/citta": <CittaView player={player} notice={false} />,
        "/portale/guerre": <GuerreView player={player} notice={false} />,
      }}
    />
  );
}
