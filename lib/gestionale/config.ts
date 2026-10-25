/**
 * Gestionale delle città (fase 1): ruoli, stati e chi può fare cosa.
 * Modulo puro, testato in tests/gestionale.
 */

export type TownRole = "sindaco" | "assistente" | "cittadino";
export type TownStatus = "in_attesa" | "attiva" | "respinta" | "chiusa";
export type ProjectStatus = "da_iniziare" | "in_corso" | "fermo" | "completato";

export const ROLE_LABEL: Record<TownRole, string> = { sindaco: "Sindaco", assistente: "Assistente", cittadino: "Cittadino" };
export const TOWN_STATUS_LABEL: Record<TownStatus, string> = { in_attesa: "In attesa di verifica", attiva: "Attiva", respinta: "Non approvata", chiusa: "Chiusa" };
export const PROJECT_STATUS: { key: ProjectStatus; label: string; tone: string }[] = [
  { key: "da_iniziare", label: "Da iniziare", tone: "#9aa3b2" },
  { key: "in_corso", label: "In corso", tone: "#ffc94d" },
  { key: "fermo", label: "Fermo", tone: "#ff8a80" },
  { key: "completato", label: "Completato", tone: "#7ee2a8" },
];

export const LIMITS = { name: 40, motto: 120, description: 4000, nation: 40, message: 1000, post: 4000, projectTitle: 80, projectText: 2000, location: 80, itemName: 60, items: 30, photos: 6 } as const;

export type TownAction =
  | "modifica_citta" // nome escluso: lo cambia lo staff
  | "ruoli"
  | "rimuovi_assistente"
  | "rimuovi_cittadino"
  | "candidature"
  | "fissa_post"
  | "elimina_post_altrui"
  | "gestisci_cantieri"
  | "scrivi"
  | "aggiorna_materiali"
  | "lascia";

const RULES: Record<TownAction, TownRole[]> = {
  modifica_citta: ["sindaco"],
  ruoli: ["sindaco"],
  rimuovi_assistente: ["sindaco"],
  rimuovi_cittadino: ["sindaco", "assistente"],
  candidature: ["sindaco", "assistente"],
  fissa_post: ["sindaco", "assistente"],
  elimina_post_altrui: ["sindaco", "assistente"],
  gestisci_cantieri: ["sindaco", "assistente"],
  scrivi: ["sindaco", "assistente", "cittadino"],
  aggiorna_materiali: ["sindaco", "assistente", "cittadino"],
  // Il sindaco non può lasciare la città senza prima passare la carica (lo fa lo staff)
  lascia: ["assistente", "cittadino"],
};

export function can(role: TownRole | null | undefined, action: TownAction): boolean {
  return Boolean(role && RULES[action].includes(role));
}

export const isManager = (role: TownRole | null | undefined) => role === "sindaco" || role === "assistente";

/** Nome città → indirizzo (minuscole, senza accenti, trattini). */
export function townSlug(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50)
      .replace(/-+$/g, "") || "citta"
  );
}

/** Nomi delle città: lettere (anche accentate), numeri, spazi, apostrofi e trattini. */
export function validTownName(name: string): boolean {
  const n = name.trim();
  return n.length >= 3 && n.length <= LIMITS.name && /^[\p{L}\p{N}][\p{L}\p{N} '’-]*$/u.test(n);
}

export function projectProgress(items: { needed: number; done: number }[]): number {
  const need = items.reduce((s, i) => s + i.needed, 0);
  if (!need) return 0;
  const done = items.reduce((s, i) => s + Math.min(i.done, i.needed), 0);
  return Math.round((done / need) * 100);
}
