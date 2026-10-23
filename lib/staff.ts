/**
 * Elenco ufficiale dello staff mostrato su /staff.
 * Ordine dei ruoli = ordine sulla pagina (dal più alto al più basso).
 * Per ogni membro basta il nickname Minecraft esatto: la skin viene presa da Mojang.
 */
/** Pose disponibili. Se non è indicata, le card alternano "cammina", "saluta" e "rilassato". */
export type Posa = "cammina" | "saluta" | "rilassato" | "saluto_frontale";
export type StaffMember = { nick: string; descrizione?: string; posa?: Posa };
/** scena "abbraccio": i primi due membri compaiono abbracciati in un'unica scena. */
export type StaffRole = { ruolo: string; membri: StaffMember[]; scena?: "abbraccio" };

export const STAFF: StaffRole[] = [
  { ruolo: "Founder", scena: "abbraccio", membri: [{ nick: "devines", posa: "rilassato" }, { nick: "joxe", posa: "rilassato" }] },
];
