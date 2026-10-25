/** News ed eventi: categorie, limiti e piccole utilità condivise da pagine e API. */

export const NEWS_CATEGORIES = [
  { key: "aggiornamento", label: "Aggiornamento", tone: "#8fd3ff" },
  { key: "evento", label: "Evento", tone: "#ffc94d" },
  { key: "annuncio", label: "Annuncio", tone: "#ff8a80" },
  { key: "manutenzione", label: "Manutenzione", tone: "#c9cdff" },
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number]["key"];

export const NEWS_LIMITS = { title: 120, summary: 220, body: 20000 } as const;

/** Copertina usata quando una news non ne ha una sua. */
export const NEWS_DEFAULT_COVER = "/images/news-banditore.webp";

export function isNewsCategory(v: unknown): v is NewsCategory {
  return typeof v === "string" && NEWS_CATEGORIES.some((c) => c.key === v);
}

export function categoryLabel(key: string): string {
  return NEWS_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export function categoryTone(key: string): string {
  return NEWS_CATEGORIES.find((c) => c.key === key)?.tone ?? "#ffffff";
}

/** Titolo → slug per l'indirizzo: minuscole, senza accenti, parole separate da trattini. */
export function slugify(title: string): string {
  const s = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
  return s || "news";
}

const FMT_DATE = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" });
const FMT_EVENT = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });

export function formatNewsDate(iso: string): string {
  return FMT_DATE.format(new Date(iso));
}

const FMT_LONG = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" });

/** "Martedì 20 ottobre 2026" */
export function formatNewsDateLong(iso: string): string {
  const s = FMT_LONG.format(new Date(iso));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatEventDate(iso: string): string {
  return FMT_EVENT.format(new Date(iso));
}
