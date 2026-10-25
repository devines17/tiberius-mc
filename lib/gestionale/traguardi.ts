import type { PlayerData } from "./data";

export type Traguardo = { key: string; title: string; text: string; done: boolean };

/** Traguardi calcolati dai dati di gioco: senza dati restano tutti da sbloccare. */
export function traguardi(d: PlayerData | null, name: string | null): Traguardo[] {
  const t = d?.town;
  const role = t?.role?.toLowerCase() ?? "";
  return [
    { key: "civis", title: "Civis", text: "Entra in una città", done: Boolean(t) },
    { key: "dominus", title: "Dominus", text: "Possiedi almeno un lotto", done: (t?.plots?.length ?? 0) > 0 },
    { key: "sindaco", title: "Magistrato", text: "Guida una città come sindaco", done: role.includes("sindaco") || (Boolean(name) && t?.mayor === name) },
    { key: "nazione", title: "Foederatus", text: "Fai parte di una nazione", done: Boolean(d?.nation) },
    { key: "mercante", title: "Mercator", text: "Raggiungi 10.000 monete", done: (d?.money ?? 0) >= 10_000 },
    { key: "veterano", title: "Veteranus", text: "Gioca 10 ore in una settimana", done: (d?.playtime7d ?? 0) >= 600 },
    { key: "sangue", title: "Primo sangue", text: "Ottieni la prima uccisione", done: (d?.pvp?.kills ?? 0) >= 1 },
    { key: "legionario", title: "Legionarius", text: "Combatti in una guerra", done: (d?.pvp?.wars?.length ?? 0) > 0 },
  ];
}
