/**
 * Liste dove votare TiberiusMC.
 * Quando il server è registrato su una lista basta mettere il link in `url`
 * (e il premio in `premio`, quando il plugin dei voti è attivo sul server).
 * Con url null la card mostra "Presto disponibile".
 */
export type VoteSite = {
  nome: string;
  /** Sigla mostrata nel riquadro al posto del logo. */
  sigla: string;
  colore: string;
  descrizione: string;
  url: string | null;
  premio: string | null;
  /** Ore tra un voto e l'altro. */
  ogni: number;
};

export const VOTE_SITES: VoteSite[] = [
  {
    nome: "Minecraft-Italia",
    sigla: "MI",
    colore: "#2f9e44",
    descrizione: "La classifica più conosciuta dei server italiani. Un voto al giorno.",
    url: null,
    premio: null,
    ogni: 24,
  },
  {
    nome: "Seconda lista",
    sigla: "II",
    colore: "#3b82f6",
    descrizione: "Una seconda lista su cui sostenerci: votando su entrambe aiuti il doppio.",
    url: null,
    premio: null,
    ogni: 24,
  },
];
