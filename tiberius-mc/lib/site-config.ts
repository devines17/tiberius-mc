/**
 * Configurazione del sito Tiberius MC.
 *
 * Nessun valore è inventato: tutto ciò che dipende dal server reale
 * arriva da variabili d'ambiente (vedi .env.example). Se una variabile
 * non è impostata il valore è `null` e l'interfaccia mostra uno stato
 * "in arrivo" invece di dati finti.
 */

function env(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const siteConfig = {
  name: "Tiberius MC",
  description:
    "Tiberius MC è un server Minecraft Java a tema romano basato su Survival Towny: città, nazioni, economia, diplomazia, guerre e PvP in un impero vivo.",
  url: env(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000",

  server: {
    /** Indirizzo IP/hostname reale del server. */
    ip: env(process.env.NEXT_PUBLIC_SERVER_IP),
    /** Versione Minecraft Java supportata. */
    version: env(process.env.NEXT_PUBLIC_MC_VERSION),
  },

  links: {
    discord: env(process.env.NEXT_PUBLIC_DISCORD_URL),
    store: env(process.env.NEXT_PUBLIC_STORE_URL),
    /** URL di Dynmap/BlueMap (o equivalente) quando sarà disponibile. */
    map: env(process.env.NEXT_PUBLIC_MAP_URL),
  },
} as const;

/** Voci di navigazione: puntano a sezioni reali della homepage. */
export const navItems = [
  { href: "#caratteristiche", label: "Il Server" },
  { href: "#citta", label: "Città e Nazioni" },
  { href: "#guerre", label: "Guerre e PvP" },
  { href: "#diplomazia", label: "Diplomazia" },
  { href: "#mappa", label: "Mappa" },
  { href: "#news", label: "News" },
] as const;
