/** Formattazione condivisa da server e client (date, stati). */

import { getStatus, getSubcategory } from "./config.ts";

const dateFmt = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Rome" });
const dateTimeFmt = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });

export function formatDate(iso: string | null | undefined): string {
  return iso ? dateFmt.format(new Date(iso)) : "";
}

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dateTimeFmt.format(new Date(iso)) : "";
}

export type StatusTone = "aperta" | "attesa" | "positiva" | "negativa" | "chiusa" | "bozza";

const POSITIVE = new Set(["risolta", "accolta", "approvata", "accettata", "completata", "provvedimento"]);
const NEGATIVE = new Set(["respinta", "non_fondata", "annullata", "ritirata"]);

export function statusTone(status: string): StatusTone {
  if (status === "bozza") return "bozza";
  if (status === "info_richieste" || status === "colloquio") return "attesa";
  if (POSITIVE.has(status)) return "positiva";
  if (NEGATIVE.has(status)) return "negativa";
  if (status === "chiusa") return "chiusa";
  return "aperta";
}

export function statusLabel(subKey: string, status: string): string {
  const s = getSubcategory(subKey);
  return (s && getStatus(s, status)?.label) ?? status;
}

export function subLabel(subKey: string): string {
  return getSubcategory(subKey)?.label ?? subKey;
}

export const PRIORITY_LABEL: Record<string, string> = { bassa: "Bassa", normale: "Normale", alta: "Alta", urgente: "Urgente" };

const rtf = new Intl.RelativeTimeFormat("it-IT", { numeric: "auto" });

/** "3 minuti fa", "ieri", "2 settimane fa"; oltre i 30 giorni la data. */
export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "";
  const s = Math.round((Date.parse(iso) - now) / 1000);
  const a = Math.abs(s);
  if (a < 45) return "adesso";
  if (a < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (a < 86400) return rtf.format(Math.round(s / 3600), "hour");
  if (a < 7 * 86400) return rtf.format(Math.round(s / 86400), "day");
  if (a < 30 * 86400) return rtf.format(Math.round(s / (7 * 86400)), "week");
  return formatDate(iso);
}
