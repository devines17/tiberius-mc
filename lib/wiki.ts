/**
 * Pagine della wiki (Towny, TownyChat, EssentialsX, Simple Voice Chat, QuickShop, Jobs, mcMMO): costi, limiti e ranghi
 * dipendono dalla configurazione del server. I manuali di sindaco e
 * governatore sono gli stessi del forum (lib/forum/manuali.ts).
 */
import { MANUALS, type ManualSection } from "./forum/manuali";

export type WikiLink = { href: string; label: string };
export type WikiPage = {
  key: string;
  group: string;
  label: string;
  icon: "start" | "resident" | "plot" | "town" | "nation" | "war" | "voice" | "chat" | "cmd" | "money" | "shop" | "jobs" | "skills" | "help" | "rules" | "link";
  lead: string;
  sections: (ManualSection & { links?: WikiLink[] })[];
};

const manual = (k: "sindaco" | "governatore") => MANUALS.find((m) => m.key === k)!;

const F = (s: string) => `/forum/sezione?s=${s}`;

export const WIKI: WikiPage[] = [
  /* ------------------------------------------------------------------ */
  {
    key: "primi-passi",
    group: "Per iniziare",
    label: "Primi passi",
    icon: "start",
    lead: "Dal primo accesso alla tua prima casa: cosa fare nei primi minuti sul server.",
    sections: [
      {
        title: "Entrare nel server",
        text: "Serve Minecraft Java Edition con un account valido. Dal menu Multiplayer premi Aggiungi server e scrivi l'indirizzo play.tiberiusmc.it.",
        links: [{ href: "/entra", label: "Come entrare, passo per passo" }],
      },
      {
        title: "I primi minuti",
        text: "Appena entri sei allo spawn, al sicuro. Prima di partire leggi le regole e dai un'occhiata alla mappa per capire dove sono le città.",
        cmds: [
          { cmd: "/spawn", desc: "Torni allo spawn del server." },
          { cmd: "/rules", desc: "Il riassunto delle regole in gioco, se disponibile. Quelle complete sono sul sito." },
        ],
        links: [
          { href: "/regole", label: "Regolamento" },
          { href: "/mappa", label: "Mappa" },
        ],
      },
      {
        title: "La prima notte",
        tips: [
          "Prima del tramonto procurati legna, un letto e un riparo: nella natura selvaggia nessuno ti protegge.",
          "Fuori dalle città le costruzioni non sono protette dal plugin: il regolamento vieta di danneggiare quelle altrui, ma solo dentro una città sei protetto davvero.",
          "Salva la posizione della tua base con /sethome, così puoi tornarci quando vuoi.",
        ],
        cmds: [
          { cmd: "/sethome <nome>", desc: "Salva una casa nel punto in cui ti trovi." },
          { cmd: "/home <nome>", desc: "Ti porta a una delle tue case." },
        ],
      },
      {
        title: "Trovare una città",
        text: "In città le tue costruzioni sono protette, paghi meno da solo e hai qualcuno con cui giocare. Guarda le città esistenti, visita quelle aperte e chiedi al sindaco di entrare.",
        cmds: [
          { cmd: "/t list", desc: "Elenca le città del server." },
          { cmd: "/t <città>", desc: "Scheda di una città: sindaco, cittadini, se è aperta." },
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
      },
      {
        title: "Cosa leggere dopo",
        links: [
          { href: "#comandi", label: "Comandi utili" },
          { href: "#chat", label: "Chat e canali" },
          { href: "#chat-vocale", label: "Chat vocale" },
          { href: "#economia", label: "Soldi ed economia" },
        ],
      },
    ],
  },
  {
    key: "account",
    group: "Per iniziare",
    label: "Collegare l'account",
    icon: "link",
    lead: "Collega il tuo account Minecraft al sito: nick e skin nel forum, dati di gioco nel gestionale.",
    sections: [
      {
        title: "Perché collegarlo",
        text: "Con l'account collegato il forum mostra il tuo nick verificato e la tua skin, lo staff sa chi sei quando apri una richiesta e il gestionale ti mostra soldi, città, nazione e statistiche.",
      },
      {
        title: "Come si fa",
        text: "Entra nel sito con Discord dal pulsante in alto a destra. In gioco scrivi /collega: ricevi un codice. Inseriscilo nella pagina Account del forum entro pochi minuti.",
        cmds: [{ cmd: "/collega", desc: "Ti dà il codice da inserire nella pagina Account del sito." }],
        links: [
          { href: "/forum/account", label: "Pagina Account" },
          { href: "/portale", label: "Gestionale" },
        ],
        tips: ["Il codice scade dopo poco: se non funziona, rifai /collega e usa quello nuovo."],
      },
    ],
  },
  {
    key: "regole",
    group: "Per iniziare",
    label: "Regole in breve",
    icon: "rules",
    lead: "Le cose da sapere subito. Il regolamento completo è quello che vale.",
    sections: [
      {
        title: "Le basi",
        tips: [
          "Niente cheat, client modificati che danno vantaggi, x-ray, auto-clicker o exploit di bug.",
          "Niente insulti, discriminazioni, minacce o spam, né in chat né sul forum.",
          "È vietato danneggiare le costruzioni altrui e rubare da contenitori protetti o con i bug.",
          "Gli account secondari non si usano per aggirare regole, ban o limiti di guerra.",
        ],
        links: [{ href: "/regole", label: "Regolamento completo" }],
      },
      {
        title: "Se qualcuno infrange le regole",
        text: "Non farti giustizia da solo: fai screenshot o video, segna le coordinate e apri una segnalazione. La vedete solo tu e lo staff.",
        links: [{ href: F("segnalazioni"), label: "Segnala un giocatore" }],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    key: "comandi",
    group: "Giocare",
    label: "Comandi utili",
    icon: "cmd",
    lead: "Case, teletrasporti, messaggi privati e altri comandi di tutti i giorni.",
    sections: [
      {
        title: "Case e spawn",
        cmds: [
          { cmd: "/spawn", desc: "Torni allo spawn del server." },
          { cmd: "/sethome <nome>", desc: "Salva una casa dove ti trovi." },
          { cmd: "/home <nome>", desc: "Ti porta a una casa." },
          { cmd: "/homes", desc: "Elenca le tue case." },
          { cmd: "/delhome <nome>", desc: "Cancella una casa." },
        ],
        tips: ["Il numero di case che puoi salvare dipende dal tuo rango."],
      },
      {
        title: "Teletrasporto verso altri giocatori",
        cmds: [
          { cmd: "/tpa <giocatore>", desc: "Chiedi di teletrasportarti da un giocatore." },
          { cmd: "/tpahere <giocatore>", desc: "Chiedi a un giocatore di venire da te." },
          { cmd: "/tpaccept", desc: "Accetti la richiesta ricevuta." },
          { cmd: "/tpdeny", desc: "Rifiuti la richiesta ricevuta." },
          { cmd: "/back", desc: "Torni al punto in cui eri prima dell'ultimo teletrasporto, se il tuo rango lo permette." },
        ],
        tips: ["Prima di accettare un /tpahere assicurati di fidarti: potresti finire in una trappola."],
      },
      {
        title: "Messaggi privati",
        cmds: [
          { cmd: "/msg <giocatore> <messaggio>", desc: "Mandi un messaggio privato." },
          { cmd: "/r <messaggio>", desc: "Rispondi all'ultimo messaggio privato." },
          { cmd: "/ignore <giocatore>", desc: "Non vedi più i messaggi di quel giocatore. Rifallo per annullare." },
          { cmd: "/mail send <giocatore> <messaggio>", desc: "Lasci un messaggio a chi non è in gioco." },
          { cmd: "/mail read", desc: "Leggi i messaggi ricevuti." },
        ],
      },
      {
        title: "Altro",
        cmds: [
          { cmd: "/afk", desc: "Ti segni come lontano dalla tastiera." },
          { cmd: "/seen <giocatore>", desc: "Quando un giocatore è stato in gioco l'ultima volta." },
          { cmd: "/list", desc: "Chi è in gioco adesso." },
          { cmd: "/help", desc: "Elenco dei comandi che puoi usare." },
        ],
      },
    ],
  },
  {
    key: "chat",
    group: "Giocare",
    label: "Chat e canali",
    icon: "chat",
    lead: "La chat è divisa in canali: generale, città, nazione e vicini.",
    sections: [
      {
        title: "I canali",
        text: "Scrivendo solo il comando del canale ci entri e da lì in poi scrivi sempre lì. Scrivendo il comando seguito da un messaggio mandi solo quel messaggio senza cambiare canale.",
        cmds: [
          { cmd: "/g", desc: "Chat generale: la leggono tutti." },
          { cmd: "/tc", desc: "Chat della tua città." },
          { cmd: "/nc", desc: "Chat della tua nazione." },
          { cmd: "/l", desc: "Chat locale: la leggono solo i giocatori vicini." },
          { cmd: "/tc <messaggio>", desc: "Un solo messaggio in chat città, poi resti nel canale in cui eri." },
        ],
        tips: ["Se non vedi i tuoi messaggi in generale probabilmente sei rimasto in /tc o /nc: scrivi /g per tornare."],
      },
      {
        title: "Buone maniere",
        tips: [
          "Niente spam, maiuscole continue o pubblicità di altri server.",
          "Le discussioni tra città si fanno in /tc e /nc o in Diplomazia sul forum, non in generale.",
        ],
      },
    ],
  },
  {
    key: "chat-vocale",
    group: "Giocare",
    label: "Chat vocale",
    icon: "voice",
    lead: "Parla con chi ti sta vicino in gioco con Simple Voice Chat: installazione, tasti e problemi comuni.",
    sections: [
      {
        title: "Come funziona",
        text: "Il server usa Simple Voice Chat. Senti i giocatori vicini a te, più forte se sono vicini e più piano se si allontanano. Puoi anche creare un gruppo per parlare con i tuoi amici ovunque siano.",
      },
      {
        title: "1. Installa un mod loader",
        text: "Simple Voice Chat è una mod: si installa sul tuo Minecraft. Ti serve Fabric (il più semplice) oppure NeoForge o Forge, nella stessa versione di Minecraft del server.",
        tips: [
          "Fabric: scarica l'installer da fabricmc.net, aprilo, scegli la versione di Minecraft del server e premi Installa. Nel launcher comparirà un nuovo profilo «fabric-loader».",
          "Con Fabric serve anche la mod Fabric API, che si scarica come le altre mod.",
        ],
      },
      {
        title: "2. Scarica la mod",
        text: "Scarica Simple Voice Chat da Modrinth o CurseForge, scegliendo la versione per il tuo loader e per la versione di Minecraft del server. Metti il file .jar nella cartella mods di Minecraft.",
        tips: [
          "Windows: premi Win+R, scrivi %appdata%\\.minecraft e apri la cartella mods (creala se non c'è).",
          "macOS: nel Finder premi Cmd+Shift+G e vai a ~/Library/Application Support/minecraft/mods.",
          "Con launcher come Prism, Modrinth App o CurseForge puoi cercare la mod direttamente dal launcher.",
        ],
      },
      {
        title: "3. Entra e prova",
        text: "Avvia Minecraft con il profilo della mod e connettiti al server. Se in basso a sinistra vedi l'icona del microfono, la chat vocale è attiva. Al primo avvio la mod ti chiede se usare il push-to-talk o l'attivazione a voce.",
      },
      {
        title: "Tasti predefiniti",
        text: "Puoi cambiarli in Opzioni, Controlli, sezione Voice Chat.",
        cmds: [
          { cmd: "V", desc: "Apre il menu della chat vocale: microfono, volume, gruppi." },
          { cmd: "Bloc Maiusc", desc: "Push-to-talk: tienilo premuto per parlare." },
          { cmd: "M", desc: "Disattiva o riattiva il microfono." },
          { cmd: "N", desc: "Disattiva o riattiva tutta la chat vocale (non senti e non parli)." },
          { cmd: "G", desc: "Menu dei gruppi." },
          { cmd: "H", desc: "Nasconde le icone della chat vocale." },
        ],
      },
      {
        title: "Gruppi",
        text: "Dal menu gruppi (G) puoi crearne uno, con o senza password, e invitare altri giocatori. Chi è nel gruppo si sente ovunque si trovi, anche lontano.",
        tips: ["I gruppi servono per giocare insieme, non per spiare: le regole sul comportamento valgono anche in vocale."],
      },
      {
        title: "Regolare il microfono",
        text: "Nel menu (V) apri le impostazioni: scegli il microfono giusto, regola il volume in uscita e, se usi l'attivazione a voce, la soglia di attivazione. Con «Test» senti come ti sentono gli altri.",
      },
      {
        title: "Problemi comuni",
        tips: [
          "Icona con una croce o «chat vocale non connessa»: la mod non riesce a collegarsi al server. Riprova a entrare; se succede sempre, apri una richiesta in Assistenza.",
          "Non ti sentono: controlla di aver scelto il microfono giusto, che non sia disattivato (M) e che il volume in uscita non sia a zero.",
          "macOS: dai a Minecraft (o al launcher) il permesso del microfono in Impostazioni di Sistema, Privacy e sicurezza, Microfono.",
          "Windows: in Impostazioni, Privacy, Microfono, consenti l'accesso alle app desktop.",
          "Versione sbagliata: la mod deve essere per la stessa versione di Minecraft del server e per il loader che usi.",
        ],
        links: [{ href: F("assistenza_generale"), label: "Chiedi aiuto in Assistenza" }],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    key: "economia",
    group: "Economia",
    label: "Soldi ed economia",
    icon: "money",
    lead: "Come si guadagna, come si paga e dove finiscono le tasse.",
    sections: [
      {
        title: "Il tuo saldo",
        cmds: [
          { cmd: "/bal", desc: "Quanti soldi hai." },
          { cmd: "/pay <giocatore> <importo>", desc: "Mandi soldi a un giocatore." },
          { cmd: "/baltop", desc: "Classifica dei giocatori più ricchi." },
        ],
        tips: ["Controlla sempre il nome prima di pagare: i soldi inviati per errore non sempre si possono recuperare."],
      },
      {
        title: "Come si guadagna",
        text: "Con un lavoro (Jobs), vendendo ad altri giocatori nei negozi, con i premi dei voti e gli eventi. Le abilità di mcMMO ti rendono più bravo a raccogliere e combattere.",
        links: [
          { href: "#lavori", label: "Lavori" },
          { href: "#negozi", label: "Negozi" },
          { href: "/vota", label: "Vota il server" },
        ],
      },
      {
        title: "Banche di città e nazione",
        text: "Città e nazioni hanno una banca propria, separata dal tuo saldo. Da lì si pagano il mantenimento giornaliero e le spese; le tasse dei cittadini finiscono lì.",
        cmds: [
          { cmd: "/t deposit <importo>", desc: "Versi nella banca della città." },
          { cmd: "/n deposit <importo>", desc: "Versi nella banca della nazione." },
        ],
      },
      {
        title: "Goldoni",
        text: "I Goldoni sono la moneta speciale di TiberiusMC, diversa dalle monete di gioco. Trovi come ottenerli e cosa puoi farci nello Store.",
        links: [{ href: "/store", label: "Store" }],
      },
    ],
  },
  {
    key: "negozi",
    group: "Economia",
    label: "Negozi",
    icon: "shop",
    lead: "Vendere e comprare con i negozi su cassa.",
    sections: [
      {
        title: "Aprire un negozio",
        text: "Metti una cassa dove vuoi il negozio (in un tuo lotto o dove la città lo permette). Tieni in mano l'oggetto da vendere, colpisci la cassa e scrivi in chat il prezzo per un pezzo. Poi riempi la cassa con la merce.",
        cmds: [
          { cmd: "/qs price <prezzo>", desc: "Cambi il prezzo del negozio che stai guardando." },
          { cmd: "/qs buy", desc: "Il negozio compra dai giocatori invece di vendere." },
          { cmd: "/qs sell", desc: "Il negozio torna a vendere." },
          { cmd: "/qs remove", desc: "Chiudi il negozio che stai guardando." },
        ],
        tips: ["Un negozio che compra paga con i tuoi soldi: tieni il saldo sufficiente."],
      },
      {
        title: "Comprare da un negozio",
        text: "Colpisci la cassa del negozio: in chat vedi oggetto, prezzo e quantità disponibile. Scrivi quanti pezzi vuoi e conferma.",
        cmds: [{ cmd: "/qs find <oggetto>", desc: "Cerca il negozio più vicino che vende un oggetto." }],
      },
      {
        title: "Negozi e lotti",
        text: "Il sindaco può creare lotti negozio, anche da affittare o vendere, così i commercianti hanno un posto in città.",
        cmds: [{ cmd: "/plot set shop", desc: "(Sindaco) Trasforma il lotto in un lotto negozio." }],
      },
    ],
  },
  {
    key: "lavori",
    group: "Economia",
    label: "Lavori",
    icon: "jobs",
    lead: "Scegli un mestiere e vieni pagato per quello che fai già: minare, coltivare, costruire, combattere.",
    sections: [
      {
        title: "Scegliere un lavoro",
        text: "Ogni lavoro paga azioni diverse: il minatore guadagna scavando, il contadino raccogliendo, il cacciatore uccidendo mostri. Più lavori più sali di livello e più guadagni.",
        cmds: [
          { cmd: "/jobs browse", desc: "Elenco dei lavori disponibili." },
          { cmd: "/jobs info <lavoro>", desc: "Cosa paga un lavoro e quanto." },
          { cmd: "/jobs join <lavoro>", desc: "Prendi un lavoro." },
          { cmd: "/jobs leave <lavoro>", desc: "Lasci un lavoro." },
        ],
        tips: ["Puoi fare più lavori insieme fino al limite del server. Lasciando un lavoro puoi perdere i livelli."],
      },
      {
        title: "Progressi",
        cmds: [
          { cmd: "/jobs stats", desc: "I tuoi lavori e i tuoi livelli." },
          { cmd: "/jobs top <lavoro>", desc: "Classifica di un lavoro." },
        ],
      },
    ],
  },
  {
    key: "abilita",
    group: "Economia",
    label: "Abilità (mcMMO)",
    icon: "skills",
    lead: "Le tue abilità crescono con l'uso e sbloccano poteri speciali.",
    sections: [
      {
        title: "Come funziona",
        text: "Ogni azione allena un'abilità: scavare allena Mining, tagliare legna Woodcutting, combattere con la spada Swords. Ai livelli più alti sblocchi effetti come raccolti doppi o colpi critici.",
        cmds: [
          { cmd: "/mcstats", desc: "I livelli di tutte le tue abilità." },
          { cmd: "/<abilità>", desc: "Dettagli di un'abilità, per esempio /mining o /swords." },
          { cmd: "/mctop", desc: "Classifica generale." },
        ],
      },
      {
        title: "Abilità attive",
        text: "Molte abilità hanno un potere attivo: tieni premuto il tasto destro con lo strumento giusto in mano (per esempio il piccone per Super Breaker) e colpisci un blocco. Poi c'è un tempo di ricarica.",
        cmds: [{ cmd: "/mcability", desc: "Attiva o disattiva l'uso dei poteri con il tasto destro." }],
      },
      {
        title: "Party",
        text: "Un party condivide l'esperienza e ha una chat propria.",
        cmds: [
          { cmd: "/party create <nome>", desc: "Crei un party." },
          { cmd: "/party invite <giocatore>", desc: "Inviti un giocatore." },
          { cmd: "/party accept", desc: "Accetti un invito." },
          { cmd: "/party leave", desc: "Lasci il party." },
          { cmd: "/p <messaggio>", desc: "Scrivi nella chat del party." },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    key: "cittadino",
    group: "Towny",
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
    group: "Towny",
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
    group: "Towny",
    label: manual("sindaco").label,
    icon: "town",
    lead: manual("sindaco").short,
    sections: manual("sindaco").sections,
  },
  {
    key: "governatore",
    group: "Towny",
    label: manual("governatore").label,
    icon: "nation",
    lead: manual("governatore").short,
    sections: manual("governatore").sections,
  },
  {
    key: "guerre",
    group: "Towny",
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
  /* ------------------------------------------------------------------ */
  {
    key: "faq",
    group: "Aiuto",
    label: "Domande frequenti",
    icon: "help",
    lead: "Le risposte alle domande che ci fate più spesso.",
    sections: [
      {
        title: "Mi hanno griefato o derubato, cosa faccio?",
        text: "Apri una segnalazione con coordinate, ora e screenshot. Dentro una città le costruzioni sono protette dal plugin: per questo conviene costruire in città.",
        links: [{ href: F("segnalazioni"), label: "Segnala un giocatore" }],
      },
      {
        title: "Ho perso oggetti per un bug",
        text: "Apri una segnalazione bug spiegando cosa stavi facendo, dove e quando. Più dettagli dai, più è facile capire cosa è successo.",
        links: [{ href: F("bug"), label: "Segnala un bug" }],
      },
      {
        title: "Sono stato bannato",
        text: "Puoi chiedere di essere sbloccato con una richiesta unban sul forum. Il forum funziona anche se sei bannato dal server.",
        links: [{ href: F("unban"), label: "Richiesta unban" }],
      },
      {
        title: "Voglio cambiare nickname",
        text: "Se hai cambiato nome su Minecraft, apri una richiesta di cambio nickname: lo staff sposta i tuoi dati sul nuovo nome.",
        links: [{ href: F("cambio_nick"), label: "Cambio nickname" }],
      },
      {
        title: "Un acquisto nello Store non è arrivato",
        text: "Aspetta qualche minuto ed entra in gioco. Se non arriva, apri una richiesta Store con il numero dell'ordine.",
        links: [{ href: F("store"), label: "Assistenza Store" }],
      },
      {
        title: "La mia città sta per cadere",
        text: "La città cade quando la banca non basta per il mantenimento giornaliero. Versate soldi con /t deposit e controllate il saldo con /t.",
      },
      {
        title: "Come entro nello staff?",
        text: "Quando le candidature sono aperte trovi il modulo nel forum.",
        links: [{ href: F("candidature"), label: "Candidature staff" }],
      },
    ],
  },
  {
    key: "assistenza",
    group: "Aiuto",
    label: "Dove chiedere aiuto",
    icon: "help",
    lead: "A chi rivolgerti per ogni problema.",
    sections: [
      {
        title: "Sul forum",
        text: "Ogni richiesta ha la sua sezione: così arriva subito alle persone giuste e resta traccia di tutto.",
        links: [
          { href: F("assistenza_generale"), label: "Assistenza generale" },
          { href: F("bug"), label: "Bug" },
          { href: F("segnalazioni"), label: "Segnalazioni" },
          { href: F("unban"), label: "Unban" },
          { href: F("store"), label: "Store" },
          { href: F("diplomazia"), label: "Diplomazia" },
        ],
      },
      {
        title: "In gioco e su Discord",
        text: "Per domande veloci puoi chiedere in chat o su Discord. Per tutto quello che riguarda sanzioni, rimborsi o guerre usa il forum.",
      },
    ],
  },
];
