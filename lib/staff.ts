/**
 * Elenco ufficiale dello staff mostrato su /staff.
 * Ordine dei ruoli = ordine sulla pagina (dal più alto al più basso).
 * Per ogni membro basta il nickname Minecraft esatto: la skin viene presa da Mojang.
 */
export type StaffMember = { nick: string; descrizione?: string };
export type StaffRole = { ruolo: string; membri: StaffMember[] };

export const STAFF: StaffRole[] = [
  { ruolo: "PROVA", membri: [{ nick: "jeb_" }, { nick: "Dinnerbone", descrizione: "Prova descrizione." }, { nick: "Notch" }, { nick: "Technoblade" }] },
];
