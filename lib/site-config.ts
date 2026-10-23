/**
 * Configurazione del sito Tiberius MC.
 *
 * I dati pubblici sono fissi qui. Quelli che non esistono ancora
 * (versione, store, mappa) restano `null`: l'interfaccia mostra
 * "in arrivo" invece di valori inventati.
 */

function env(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const siteConfig = {
  name: "Tiberius MC",
  description:
    "Tiberius MC è un server Minecraft Java a tema romano, Survival Towny: fonda una città, forma una nazione, vai in guerra e scrivi la storia dell'impero.",
  url: env(process.env.NEXT_PUBLIC_SITE_URL) ?? "https://tiberiusmc.it",

  server: {
    ip: env(process.env.NEXT_PUBLIC_SERVER_IP) ?? "play.tiberiusmc.it",
    /** Versione Minecraft Java supportata: da inserire. */
    version: env(process.env.NEXT_PUBLIC_MC_VERSION),
  },

  links: {
    /**
     * Link provvisorio: quando il server avrà il boost per l'URL
     * personalizzato basta sostituirlo con https://discord.tiberiusmc.it
     * (oppure impostare NEXT_PUBLIC_DISCORD_URL).
     */
    discord: env(process.env.NEXT_PUBLIC_DISCORD_URL) ?? "https://discord.gg/uVwhyjV8G",
    telegram: env(process.env.NEXT_PUBLIC_TELEGRAM_URL) ?? "https://t.me/tiberiusmc",
    telegramHandle: "@tiberiusmc",
    store: env(process.env.NEXT_PUBLIC_STORE_URL),
    /** URL pubblico di Dynmap/BlueMap, quando sarà disponibile. */
    map: env(process.env.NEXT_PUBLIC_MAP_URL),
  },

  /**
   * Dati per il footer. Finché restano `null` la riga corrispondente
   * non compare: nessun dato inventato.
   */
  contact: {
    email: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL) ?? "business@tiberiusmc.it",
    /** Ragione sociale, P. IVA, sede: una riga sola, così com'è. */
    company: env(process.env.NEXT_PUBLIC_COMPANY_INFO),
  },
  legal: {
    privacy: env(process.env.NEXT_PUBLIC_PRIVACY_URL),
    terms: env(process.env.NEXT_PUBLIC_TERMS_URL),
    cookies: env(process.env.NEXT_PUBLIC_COOKIE_URL),
  },
} as const;

/** Pagine del sito, usate da navigazione, indice e footer. */
export const pages = [
  { href: "/citta", label: "città e nazioni", short: "città" },
  { href: "/guerre", label: "guerre e pvp", short: "guerre" },
  { href: "/diplomazia", label: "diplomazia", short: "diplomazia" },
  { href: "/mappa", label: "mappa", short: "mappa" },
  { href: "/archivio", label: "archivio imperiale", short: "archivio" },
  { href: "/news", label: "news ed eventi", short: "news" },
  { href: "/forum", label: "forum", short: "forum" },
  { href: "/regole", label: "regole", short: "regole" },
  { href: "/store", label: "store", short: "store" },
  { href: "/staff", label: "staff", short: "staff" },
  { href: "/vota", label: "vota il server", short: "vota" },
  { href: "/wiki", label: "wiki", short: "wiki" },
] as const;
