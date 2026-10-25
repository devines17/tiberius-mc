/**
 * Dati di gioco mostrati nel gestionale personale.
 * Arrivano dal plugin del server (tabella player_snapshots, campo data):
 * ogni campo è facoltativo, il sito mostra "—" per quello che non c'è.
 */

export type PlayerData = {
  money?: number;
  goldoni?: number;
  playtime7d?: number; // minuti giocati negli ultimi 7 giorni
  firstJoin?: string;
  lastSeen?: string;
  online?: boolean;
  town?: {
    name: string;
    role?: string; // Sindaco, Assistente, Cittadino…
    mayor?: string;
    residents?: number;
    bank?: number;
    dailyTax?: number;
    upkeep?: number;
    claims?: number;
    maxClaims?: number;
    founded?: string;
    plots?: { name?: string; world?: string; x: number; z: number; type?: string }[];
  };
  nation?: { name: string; capital?: string; king?: string; towns?: number; residents?: number; bank?: number; allies?: string[]; enemies?: string[] };
  bank?: { in7d?: number; out7d?: number; transactions?: { at: string; amount: number; text: string }[] };
  pvp?: { kills?: number; deaths?: number; wars?: { name: string; side?: string; result?: string; at?: string }[] };
};

const money = new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const int = new Intl.NumberFormat("it-IT");

export const fmtMoney = (n: number | undefined) => (typeof n === "number" ? money.format(n) : "—");
export const fmtInt = (n: number | undefined) => (typeof n === "number" ? int.format(n) : "—");

export function fmtPlaytime(min: number | undefined): string {
  if (typeof min !== "number") return "—";
  if (min < 60) return min ? `${min} min` : "Non presente";
  const h = Math.floor(min / 60);
  return `${h} ${h === 1 ? "ora" : "ore"}${min % 60 ? ` ${min % 60} min` : ""}`;
}

/** "Buongiorno", "Buon pomeriggio", "Buonasera" secondo l'ora di Roma. */
export function greeting(now = new Date()): string {
  const h = Number(new Intl.DateTimeFormat("it-IT", { hour: "numeric", hour12: false, timeZone: "Europe/Rome" }).format(now));
  if (h >= 5 && h < 13) return "Buongiorno";
  if (h >= 13 && h < 18) return "Buon pomeriggio";
  return "Buonasera";
}
