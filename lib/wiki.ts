/**
 * Pagine della wiki. Comandi standard di Towny: costi, limiti e ranghi
 * dipendono dalla configurazione del server. I manuali di sindaco e
 * governatore sono gli stessi del forum (lib/forum/manuali.ts).
 */
import { MANUALS, type ManualSection } from "./forum/manuali";

export type WikiLink = { href: string; label: string };
export type WikiPage = {
  key: string;
  group: string;
  label: string;
  icon: "start" | "resident" | "plot" | "town" | "nation" | "war";
  lead: string;
  sections: (ManualSection & { links?: WikiLink[] })[];
};

const manual = (k: "sindaco" | "governatore") => MANUALS.find((m) => m.key === k)!;

export const WIKI: WikiPage[] = [
  {
    key: "primi-passi",
    group: "Per iniziare",
    label: "Primi passi",
    icon: "start",
    lead: "Cosa fare appena entri: trovare una città, sistemarti e collegare l'account al sito.",
    sections: [
      {
        title: "Entrare nel server",
        text: "Serve Minecraft Java Edition con un account valido. Dal menu Multiplayer aggiungi il server con l'indirizzo play.tiberiusmc.it.",
        links: [{ href: "/entra", label: "Come entrare, passo per passo" }],
      },
      {
        title: "Trovare una città",
        text: "Da soli si sopravvive, ma in città si cresce. Guarda quali città esistono, visita quelle aperte e chiedi al sindaco di entrare.",
        cmds: [
          { cmd: "/t list", desc: "Elenca le città del server." },
          { cmd: "/t <città>", desc: "Mostra la scheda di una città: sindaco, cittadini, se è aperta." },
          { cmd: "/t spawn <città>", desc: "Ti porta allo spawn di una città pubblica." },
          { cmd: "/t join <città>", desc: "Entra in una città aperta, senza invito." },
          { cmd: "/accept <città>", desc: "Accetta l'invito di una città." },
          { cmd: "/deny <città>", desc: "Rifiuta l'invito di una città." },
        ],
        tips: ["Puoi anche fondare la tua città: trovi tutto nel Manuale del sindaco."],
      },
      {
        title: "Orientarsi",
        cmds: [
          { cmd: "/towny map", desc: "Mappa in chat dei chunk intorno a te, con le città vicine." },
          { cmd: "/t here", desc: "Dice a quale città appartiene il punto in cui ti trovi." },
        ],
        links: [{ href: "/mappa", label: "Mappa del mondo" }],
      },
      {
        title: "Collegare l'account al sito",
        text: "Collegando il tuo account Minecraft al sito il forum mostra il tuo nick e la tua skin, e il gestionale può mostrarti i tuoi dati di gioco. Il codice si ottiene in gioco e si inserisce nella pagina Account del forum.",
        links: [
          { href: "/forum/account", label: "Pagina Account" },
          { href: "/portale", label: "Gestionale" },
        ],
      },
    ],
  },
  {
    key: "cittadino",
    group: "Per iniziare",
    label: "Il cittadino",
    icon: "resident",
    lead: "La vita in città: il tuo profilo, gli amici, le tasse e come lasciare una città.",
    sections: [
      {
        title: "Il tuo profilo",
        cmds: [
          { cmd: "/res", desc: "Mostra il tuo profilo: città, nazione, saldo, lotti, amici." },
          { cmd: "/res <giocatore>", desc: "Mostra il profilo di un altro giocatore." },
          { cmd: "/t online", desc: "Elenca i cittadini della tua città in gioco." },
        ],
      },
      {
        title: "Amici",
        text: "Gli amici possono avere permessi speciali nei tuoi lotti, per esempio costruire con te.",
        cmds: [
          { cmd: "/res friend add <giocatore>", desc: "Aggiunge un amico." },
          { cmd: "/res friend remove <giocatore>", desc: "Toglie un amico." },
          { cmd: "/res friend list", desc: "Elenca i tuoi amici." },
        ],
      },
      {
        title: "Tasse e banca della città",
        text: "Ogni giorno la città può prendere una tassa dal tuo saldo e una per ogni lotto che possiedi. Controlla con /t quanto costa vivere nella tua città.",
        cmds: [
          { cmd: "/t", desc: "Scheda della tua città, con tasse e banca." },
          { cmd: "/t deposit <importo>", desc: "Versa denaro nella banca della città per aiutarla a pagare il mantenimento." },
        ],
        tips: ["Se il saldo non basta per le tasse, a seconda delle impostazioni della città puoi perdere i lotti o essere allontanato."],
      },
      {
        title: "Spostarsi e lasciare la città",
        cmds: [
          { cmd: "/t spawn", desc: "Ti porta allo spawn della tua città." },
          { cmd: "/t leave", desc: "Lasci la città. I tuoi lotti tornano alla città." },
        ],
      },
    ],
  },
  {
    key: "lotti",
    group: "Per iniziare",
    label: "Lotti",
    icon: "plot",
    lead: "Comprare un lotto in città, proteggerlo e decidere chi può costruirci.",
    sections: [
      {
        title: "Comprare e lasciare un lotto",
        text: "I comandi valgono per il chunk in cui ti trovi. Usa /towny map per vedere i lotti in vendita intorno a te.",
        cmds: [
          { cmd: "/plot claim", desc: "Compra il lotto in vendita in cui ti trovi." },
          { cmd: "/plot unclaim", desc: "Rinunci al lotto, che torna alla città." },
          { cmd: "/plot forsale <prezzo>", desc: "Rimetti in vendita il tuo lotto." },
          { cmd: "/plot notforsale", desc: "Ritiri il lotto dalla vendita." },
        ],
      },
      {
        title: "Permessi del lotto",
        text: "Nel tuo lotto decidi tu chi può costruire, rompere, usare porte e leve o usare oggetti.",
        cmds: [
          { cmd: "/plot perm", desc: "Mostra i permessi del lotto in cui ti trovi." },
          { cmd: "/plot set perm <friend|resident|ally|outsider> <build|destroy|switch|itemuse> <on|off>", desc: "Cambia un permesso per amici, cittadini, alleati o esterni." },
          { cmd: "/plot toggle pvp", desc: "Attiva o disattiva il PvP nel lotto, se la città lo consente." },
        ],
        tips: ["Per costruire insieme a qualcuno aggiungilo agli amici e dai il permesso build a friend."],
      },
    ],
  },
  {
    key: "sindaco",
    group: "Governare",
    label: manual("sindaco").label,
    icon: "town",
    lead: manual("sindaco").short,
    sections: manual("sindaco").sections,
  },
  {
    key: "governatore",
    group: "Governare",
    label: manual("governatore").label,
    icon: "nation",
    lead: manual("governatore").short,
    sections: manual("governatore").sections,
  },
  {
    key: "guerre",
    group: "Diplomazia",
    label: "Guerre e alleanze",
    icon: "war",
    lead: "Come si chiede una guerra, come si fa un'alleanza e dove restano gli accordi.",
    sections: [
      {
        title: "Chiedere una guerra",
        text: "Le guerre non partono da sole: il governatore apre una richiesta nella sezione Diplomazia del forum, spiegando chi è coinvolto e perché. Se lo staff la approva, è lo staff ad avviarla in gioco.",
        links: [{ href: "/forum/sezione?s=diplomazia", label: "Diplomazia nel forum" }],
      },
      {
        title: "Alleanze",
        text: "Un'alleanza vale quando entrambe le nazioni la accettano in gioco. I comandi sono nel Manuale del governatore.",
        cmds: [
          { cmd: "/n ally add <nazione>", desc: "Propone un'alleanza." },
          { cmd: "/n enemy add <nazione>", desc: "Segna una nazione come nemica. Non è una dichiarazione di guerra." },
        ],
      },
      {
        title: "Regole da conoscere",
        text: "Durante le guerre valgono le regole di Towny e del PvP del regolamento: niente exploit, niente account secondari per aggirare le condizioni, rispetto degli accordi approvati.",
        links: [{ href: "/regole", label: "Regolamento" }],
      },
    ],
  },
];
