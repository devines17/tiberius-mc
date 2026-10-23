/**
 * Manuali Towny mostrati nella categoria Towny del forum.
 * Comandi standard del plugin Towny: costi, limiti e ranghi dipendono
 * dalla configurazione del server.
 */

export type Cmd = { cmd: string; desc: string };
export type ManualSection = { title: string; text?: string; cmds?: Cmd[]; tips?: string[] };
export type Manual = {
  key: "sindaco" | "governatore";
  label: string;
  short: string;
  lead: string;
  sections: ManualSection[];
};

export const MANUALS: Manual[] = [
  {
    key: "sindaco",
    label: "Manuale del sindaco",
    short: "Fondare e gestire una città: territorio, cittadini, tasse e permessi.",
    lead: "Come fondare una città e farla durare.",
    sections: [
      {
        title: "Fondare la città",
        text: "Mettiti nel punto in cui vuoi il centro della città: quel chunk diventa il blocco principale. Fondare una città costa, e i soldi vengono presi dal tuo saldo.",
        cmds: [
          { cmd: "/t new <nome>", desc: "Fonda una nuova città nel chunk in cui ti trovi." },
          { cmd: "/t", desc: "Mostra la scheda della tua città: banca, mantenimento, cittadini, chunk." },
          { cmd: "/t here", desc: "Mostra la città del territorio in cui ti trovi." },
        ],
      },
      {
        title: "Territorio",
        text: "Il territorio si espande un chunk alla volta, sempre a contatto con quello che possiedi già. Il numero di chunk dipende dai cittadini e dai bonus acquistati.",
        cmds: [
          { cmd: "/t claim", desc: "Rivendica il chunk in cui ti trovi." },
          { cmd: "/t unclaim", desc: "Libera il chunk in cui ti trovi." },
          { cmd: "/t claim outpost", desc: "Rivendica un avamposto staccato dalla città." },
          { cmd: "/t buy bonus <numero>", desc: "Compra chunk aggiuntivi oltre il limite." },
          { cmd: "/t set homeblock", desc: "Sposta il blocco principale nel chunk in cui ti trovi." },
          { cmd: "/t set spawn", desc: "Imposta il punto di arrivo della città (dentro il blocco principale)." },
        ],
      },
      {
        title: "Cittadini e ranghi",
        cmds: [
          { cmd: "/t add <giocatore>", desc: "Invita un giocatore nella città." },
          { cmd: "/t kick <giocatore>", desc: "Allontana un cittadino." },
          { cmd: "/t toggle open", desc: "Permette a chiunque di entrare senza invito con /t join." },
          { cmd: "/t ranklist", desc: "Elenca i ranghi disponibili sul server." },
          { cmd: "/t rank add <giocatore> <rango>", desc: "Assegna un rango, per esempio un assistente che ti aiuta a gestire la città." },
          { cmd: "/t rank remove <giocatore> <rango>", desc: "Toglie un rango." },
        ],
      },
      {
        title: "Banca, tasse e mantenimento",
        text: "Ogni giorno la città paga un mantenimento dalla propria banca. Se i soldi non bastano la città può cadere e perdere il territorio, quindi controlla spesso il saldo con /t.",
        cmds: [
          { cmd: "/t deposit <importo>", desc: "Versa denaro nella banca della città." },
          { cmd: "/t withdraw <importo>", desc: "Preleva dalla banca della città." },
          { cmd: "/t set taxes <importo>", desc: "Tassa giornaliera per ogni cittadino." },
          { cmd: "/t set plottax <importo>", desc: "Tassa giornaliera sui lotti posseduti dai cittadini." },
        ],
      },
      {
        title: "Permessi e protezioni",
        text: "Decidi chi può costruire, rompere e usare porte, leve e oggetti nel territorio. Per chi non fa parte della città è consigliato tenere spenti costruzione e distruzione.",
        cmds: [
          { cmd: "/t set perm <resident|ally|outsider> <build|destroy|switch|itemuse> <on|off>", desc: "Imposta un permesso per cittadini, alleati o esterni." },
          { cmd: "/t toggle pvp", desc: "Attiva o disattiva il PvP in città." },
          { cmd: "/t toggle fire", desc: "Attiva o disattiva la propagazione del fuoco." },
          { cmd: "/t toggle explosion", desc: "Attiva o disattiva le esplosioni." },
          { cmd: "/t toggle mobs", desc: "Attiva o disattiva i mostri in città." },
        ],
      },
      {
        title: "Lotti",
        text: "Puoi dividere la città in lotti e venderli ai cittadini. Il comando vale per il chunk in cui ti trovi.",
        cmds: [
          { cmd: "/plot forsale <prezzo>", desc: "Mette in vendita il lotto." },
          { cmd: "/plot notforsale", desc: "Ritira il lotto dalla vendita." },
          { cmd: "/plot claim", desc: "Il cittadino compra il lotto in vendita in cui si trova." },
          { cmd: "/plot set <shop|embassy|arena>", desc: "Cambia il tipo di lotto." },
          { cmd: "/plot set reset", desc: "Riporta il lotto a lotto normale." },
        ],
      },
      {
        title: "Comunicazioni e passaggio di consegne",
        cmds: [
          { cmd: "/t set board <messaggio>", desc: "Messaggio che i cittadini vedono all'accesso." },
          { cmd: "/t set name <nome>", desc: "Rinomina la città." },
          { cmd: "/t set mayor <giocatore>", desc: "Cede la carica di sindaco a un cittadino." },
        ],
        tips: [
          "Prima di lasciare il server a lungo, cedi la carica o assicurati che la banca copra il mantenimento.",
          "Alleanze e guerre sono cose da nazione. Per chiedere una guerra usa la sezione Diplomazia del forum.",
        ],
      },
    ],
  },
  {
    key: "governatore",
    label: "Manuale del governatore",
    short: "Guidare una nazione: città membri, capitale, tasse, alleati e nemici.",
    lead: "Come fondare una nazione e guidarla, dalle città membri alle alleanze.",
    sections: [
      {
        title: "Fondare la nazione",
        text: "Per fondare una nazione devi essere sindaco: la tua città diventa la capitale e tu il governatore. La fondazione ha un costo.",
        cmds: [
          { cmd: "/n new <nome>", desc: "Fonda una nazione con la tua città come capitale." },
          { cmd: "/n", desc: "Mostra la scheda della nazione: banca, città, alleati, nemici." },
          { cmd: "/n list", desc: "Elenca le nazioni del server." },
        ],
      },
      {
        title: "Città membri",
        text: "Le città entrano nella nazione su invito, e il sindaco della città invitata deve accettare.",
        cmds: [
          { cmd: "/n add <città>", desc: "Invita una città nella nazione." },
          { cmd: "/n kick <città>", desc: "Allontana una città dalla nazione." },
          { cmd: "/n set capital <città>", desc: "Sposta la capitale. Il sindaco della nuova capitale diventa governatore." },
        ],
      },
      {
        title: "Banca e tasse",
        text: "Anche la nazione paga un mantenimento giornaliero dalla propria banca. Le tasse della nazione vengono pagate dalle città membri.",
        cmds: [
          { cmd: "/n deposit <importo>", desc: "Versa denaro nella banca della nazione." },
          { cmd: "/n withdraw <importo>", desc: "Preleva dalla banca della nazione." },
          { cmd: "/n set taxes <importo>", desc: "Tassa giornaliera per ogni città membro." },
        ],
      },
      {
        title: "Alleati e nemici",
        text: "Un'alleanza richiede il consenso di entrambe le nazioni. Segnare una nazione come nemica in gioco non equivale a dichiararle guerra.",
        cmds: [
          { cmd: "/n ally add <nazione>", desc: "Propone un'alleanza a un'altra nazione." },
          { cmd: "/n ally remove <nazione>", desc: "Rompe un'alleanza." },
          { cmd: "/n enemy add <nazione>", desc: "Segna una nazione come nemica." },
          { cmd: "/n enemy remove <nazione>", desc: "Toglie una nazione dai nemici." },
        ],
        tips: [
          "Le guerre si chiedono sul forum, nella sezione Diplomazia. Se lo staff approva la richiesta, è lo staff ad avviare la guerra in gioco.",
          "Trattati, paci e accordi importanti conviene registrarli in Diplomazia, così restano agli atti.",
        ],
      },
      {
        title: "Ranghi e governo",
        cmds: [
          { cmd: "/n ranklist", desc: "Elenca i ranghi della nazione disponibili sul server." },
          { cmd: "/n rank add <giocatore> <rango>", desc: "Assegna un rango della nazione." },
          { cmd: "/n rank remove <giocatore> <rango>", desc: "Toglie un rango." },
        ],
      },
      {
        title: "Comunicazioni e passaggio di consegne",
        cmds: [
          { cmd: "/n set board <messaggio>", desc: "Messaggio per i cittadini della nazione." },
          { cmd: "/n set name <nome>", desc: "Rinomina la nazione." },
          { cmd: "/n set king <giocatore>", desc: "Cede la guida della nazione (in Towny il comando usa \"king\")." },
        ],
        tips: ["Prima di assentarti a lungo, cedi la guida o assicurati che la banca della nazione copra il mantenimento."],
      },
    ],
  },
];

export function getManual(key: string): Manual | undefined {
  return MANUALS.find((m) => m.key === key);
}
