/**
 * Struttura del forum: categorie, sottosezioni, moduli, stati e permessi.
 *
 * È lo specchio delle tabelle forum_categories / forum_subcategories /
 * forum_statuses della migrazione: il database impedisce valori diversi,
 * questo file descrive come si presentano e si compilano.
 *
 * Modulo puro (nessun import di Next o del database): testato in tests/forum.
 */

export type PermissionKey =
  | "assistenza"
  | "bug"
  | "unban"
  | "segnalazioni"
  | "cambio_nick"
  | "store"
  | "towny_diplomazia"
  | "candidature"
  | "candidature_media"
  | "community"
  | "citta"
  | "admin";

export const PERMISSIONS: { key: PermissionKey; label: string }[] = [
  { key: "assistenza", label: "Assistenza generale" },
  { key: "bug", label: "Segnalazioni bug" },
  { key: "unban", label: "Richieste unban" },
  { key: "segnalazioni", label: "Segnalazioni giocatori" },
  { key: "cambio_nick", label: "Cambio nickname" },
  { key: "store", label: "Store" },
  { key: "towny_diplomazia", label: "Diplomazia e richieste di guerra" },
  { key: "candidature", label: "Candidature staff" },
  { key: "candidature_media", label: "Candidature media" },
  { key: "community", label: "Moderazione community" },
  { key: "citta", label: "Registrazioni città" },
  { key: "admin", label: "Amministrazione generale" },
];

export type CategoryKey = "assistenza" | "towny" | "community" | "candidature";

export type SubcategoryKey =
  | "assistenza_generale"
  | "bug"
  | "unban"
  | "segnalazioni"
  | "cambio_nick"
  | "store"
  | "diplomazia"
  | "salotto"
  | "proposte"
  | "candidature"
  | "candidature_media";

export type FieldType = "text" | "textarea" | "select" | "date" | "datetime" | "nick" | "number" | "url-list";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  max?: number;
  /** Il campo compare solo se un altro campo ha uno di questi valori. */
  when?: { field: string; in: string[] };
};

export type Status = { key: string; label: string; final: boolean };

export type Subcategory = {
  key: SubcategoryKey;
  category: CategoryKey;
  label: string;
  short: string;
  description: string;
  permission: PermissionKey;
  /** Pubblica: le discussioni aperte da ora in poi le legge chiunque, anche senza account. */
  public?: boolean;
  /** Tutti gli utenti collegati possono rispondere (non solo autore e staff). */
  openReplies?: boolean;
  /** Riservata: mai elenchi o conteggi condivisi, nemmeno anonimi. */
  sensitive: boolean;
  /** Richiede un account Minecraft verificato per aprire la pratica. */
  requiresVerifiedMc: boolean;
  /** Si può salvare come bozza prima dell'invio. */
  allowsDraft: boolean;
  /** Stato in cui nasce la pratica una volta inviata. */
  initialStatus: string;
  statuses: Status[];
  /** Avvisi mostrati sopra il modulo. */
  notices: string[];
  fields: Field[];
  /** Etichetta del campo descrizione principale (diventa il primo messaggio). */
  bodyLabel: string;
  /** Il titolo è generato dai campi invece che scritto dal giocatore. */
  autoTitle?: (fields: Record<string, string>) => string;
};

const S = (key: string, label: string, final = false): Status => ({ key, label, final });

export const CATEGORIES: { key: CategoryKey; label: string; description: string }[] = [
  { key: "assistenza", label: "Assistenza", description: "Problemi personali e richieste rivolte allo staff." },
  { key: "towny", label: "Towny", description: "Questioni politiche e territoriali tra città e nazioni." },
  { key: "community", label: "Community", description: "Discussioni libere tra giocatori: presentazioni, chiacchiere e proposte per il server." },
  { key: "candidature", label: "Candidature", description: "Candidati per entrare nello staff o come creator di TiberiusMC." },
];

const PUBLIC_NOTICE = "Questa sezione è pubblica: chiunque potrà leggere la discussione. Non scrivere dati personali come email, password o numeri di telefono.";

const PROVE: Field = {
  name: "prove_link",
  label: "Link a prove (video, immagini)",
  type: "url-list",
  help: "Un link per riga: YouTube, Google Drive, Imgur… I file fino a 4 MB puoi allegarli sotto.",
  max: 2000,
};

export const SUBCATEGORIES: Subcategory[] = [
  {
    key: "assistenza_generale",
    category: "assistenza",
    label: "Assistenza generale",
    short: "Problemi e domande sul server.",
    description: "Per problemi e richieste generali relativi al server.",
    permission: "assistenza",
    public: true,
    sensitive: false,
    requiresVerifiedMc: false,
    allowsDraft: false,
    initialStatus: "aperta",
    statuses: [S("aperta", "Aperta"), S("in_lavorazione", "In lavorazione"), S("info_richieste", "Informazioni richieste"), S("risolta", "Risolta", true), S("chiusa", "Chiusa", true)],
    notices: [PUBLIC_NOTICE],
    bodyLabel: "Descrizione dettagliata",
    fields: [
      {
        name: "tipo_problema",
        label: "Categoria del problema",
        type: "select",
        required: true,
        options: [
          { value: "connessione", label: "Connessione al server" },
          { value: "gioco", label: "Problema in gioco" },
          { value: "account", label: "Account e collegamento" },
          { value: "sito", label: "Sito o forum" },
          { value: "altro", label: "Altro" },
        ],
      },
    ],
  },
  {
    key: "unban",
    category: "assistenza",
    label: "Richieste unban",
    short: "Chiedi la revisione di un ban.",
    description: "Per richiedere la revisione di un ban.",
    permission: "unban",
    sensitive: false,
    // Chi è bannato non può entrare in gioco per scrivere /collega: il nickname si dichiara e lo staff lo verifica.
    requiresVerifiedMc: false,
    allowsDraft: false,
    initialStatus: "inviata",
    statuses: [S("inviata", "Inviata"), S("in_revisione", "In revisione"), S("info_richieste", "Informazioni richieste"), S("accolta", "Accolta", true), S("respinta", "Respinta", true), S("chiusa", "Chiusa", true)],
    notices: [
      "Il ban resta attivo finché lo staff non valuta la richiesta. L'esito lo trovi in questa pratica.",
      "Se il tuo account non è collegato (perché sei bannato non puoi usare /collega), scrivi il tuo nickname: lo verificherà lo staff.",
    ],
    bodyLabel: "Spiega la tua richiesta",
    autoTitle: (f) => `Unban ${f.nickname || ""}`.trim(),
    fields: [
      { name: "nickname", label: "Nickname Minecraft bannato", type: "nick", required: true },
      { name: "motivo_ban", label: "Motivazione del ban, se la conosci", type: "text", max: 200 },
      { name: "data_ban", label: "Data del ban, se la conosci", type: "date" },
      { name: "spiegazione", label: "La tua versione dei fatti", type: "textarea", required: true, max: 4000 },
      { ...PROVE, label: "Prove o informazioni aggiuntive (link)" },
    ],
  },
  {
    key: "segnalazioni",
    category: "assistenza",
    label: "Segnalazione giocatori",
    short: "Cheating, griefing, comportamenti scorretti.",
    description: "Per segnalare violazioni del regolamento, cheating, exploit, griefing o altri problemi disciplinari.",
    permission: "segnalazioni",
    sensitive: true,
    requiresVerifiedMc: true,
    allowsDraft: false,
    initialStatus: "inviata",
    statuses: [S("inviata", "Inviata"), S("in_revisione", "In revisione"), S("info_richieste", "Informazioni richieste"), S("provvedimento", "Provvedimento preso", true), S("non_fondata", "Non fondata", true), S("chiusa", "Chiusa", true)],
    notices: ["La segnalazione la vedete solo tu e chi nello staff gestisce le segnalazioni. Il giocatore segnalato non può vederla."],
    bodyLabel: "Descrizione dettagliata dell'episodio",
    autoTitle: (f) => `Segnalazione: ${f.segnalato || ""}`.trim(),
    fields: [
      { name: "segnalato", label: "Nickname del giocatore segnalato", type: "nick", required: true },
      {
        name: "motivo",
        label: "Motivo",
        type: "select",
        required: true,
        options: [
          { value: "cheating", label: "Cheating / hack" },
          { value: "exploit", label: "Exploit o bug abusati" },
          { value: "griefing", label: "Griefing" },
          { value: "comportamento", label: "Comportamento scorretto in chat" },
          { value: "truffa", label: "Truffa tra giocatori" },
          { value: "altro", label: "Altra violazione del regolamento" },
        ],
      },
      { name: "data_episodio", label: "Quando è successo", type: "datetime", required: true },
      { name: "contesto", label: "Dove e in che contesto (coordinate, città, chat…)", type: "text", required: true, max: 300 },
      { name: "testimoni", label: "Testimoni, se ci sono", type: "text", max: 300 },
      PROVE,
    ],
  },
  {
    key: "bug",
    category: "assistenza",
    label: "Segnalazione bug",
    short: "Errori nel gioco, nel sito o nei bot.",
    description: "Per segnalare un errore o un malfunzionamento del server, del sito o dei bot Discord.",
    permission: "bug",
    sensitive: false,
    requiresVerifiedMc: false,
    allowsDraft: false,
    initialStatus: "inviata",
    statuses: [
      S("inviata", "Inviata"),
      S("in_revisione", "In verifica"),
      S("info_richieste", "Informazioni richieste"),
      S("confermato", "Bug confermato"),
      S("risolto", "Risolto", true),
      S("non_riproducibile", "Non riproducibile", true),
      S("chiusa", "Chiusa", true),
    ],
    notices: ["Se il bug permette di duplicare oggetti o ottenere vantaggi, non sfruttarlo e non parlarne in pubblico: segnalalo solo qui."],
    bodyLabel: "Descrizione del bug",
    fields: [
      {
        name: "dove",
        label: "Dove si verifica",
        type: "select",
        required: true,
        options: [
          { value: "server", label: "In gioco" },
          { value: "sito", label: "Sito o forum" },
          { value: "discord", label: "Discord o bot" },
        ],
      },
      {
        name: "passi",
        label: "Come riprodurlo",
        type: "textarea",
        required: true,
        max: 3000,
        help: "Elenca i passaggi che portano al bug, cosa ti aspettavi e cosa succede invece.",
      },
      { name: "coordinate", label: "Mondo e coordinate", type: "text", max: 120, when: { field: "dove", in: ["server"] } },
      PROVE,
    ],
  },
  {
    key: "cambio_nick",
    category: "assistenza",
    label: "Richieste cambio nick",
    short: "Aggiorna il nickname usato sul server.",
    description: "Per richiedere una modifica del nickname utilizzato sul server o sul sito.",
    permission: "cambio_nick",
    sensitive: false,
    requiresVerifiedMc: true,
    allowsDraft: false,
    initialStatus: "inviata",
    statuses: [S("inviata", "Inviata"), S("in_revisione", "In revisione"), S("info_richieste", "Informazioni richieste"), S("approvata", "Approvata"), S("respinta", "Respinta", true), S("completata", "Completata", true)],
    notices: [
      "Il nome del tuo account Minecraft si cambia dal sito di Minecraft (Microsoft), non da qui.",
      "Qui puoi chiedere di aggiornare il nickname con cui sei registrato sul server, ad esempio dopo averlo cambiato su Minecraft. Il tuo UUID non cambia.",
    ],
    bodyLabel: "Motivo della richiesta",
    autoTitle: (f) => `Cambio nick: ${f.nick_attuale || ""} → ${f.nick_richiesto || ""}`,
    fields: [
      { name: "nick_attuale", label: "Nickname attuale sul server", type: "nick", required: true },
      { name: "nick_richiesto", label: "Nickname richiesto", type: "nick", required: true },
      {
        name: "ambito",
        label: "Cosa vuoi cambiare",
        type: "select",
        required: true,
        options: [
          { value: "account_mc", label: "Ho già cambiato nome su Minecraft: aggiornatelo sul server" },
          { value: "server", label: "Nome visualizzato sul server (soprannome)" },
          { value: "sito", label: "Nome visualizzato sul sito" },
        ],
      },
      { name: "info", label: "Informazioni aggiuntive", type: "text", max: 300 },
    ],
  },
  {
    key: "store",
    category: "assistenza",
    label: "Store",
    short: "Acquisti non ricevuti e problemi coi Goldoni.",
    description: "Per problemi relativi agli acquisti dello store e alla valuta premium Goldoni.",
    permission: "store",
    sensitive: true,
    requiresVerifiedMc: true,
    allowsDraft: false,
    initialStatus: "inviata",
    statuses: [S("inviata", "Inviata"), S("in_revisione", "In revisione"), S("info_richieste", "Informazioni richieste"), S("risolta", "Risolta", true), S("respinta", "Respinta", true), S("chiusa", "Chiusa", true)],
    notices: [
      "Lo staff non ti chiederà mai password, numeri di carta o codici di sicurezza, quindi non scriverli qui.",
      "Gli eventuali accrediti li fa lo staff a mano, dopo aver controllato.",
    ],
    bodyLabel: "Descrivi il problema",
    fields: [
      {
        name: "tipo_problema",
        label: "Tipo di problema",
        type: "select",
        required: true,
        options: [
          { value: "acquisto_non_ricevuto", label: "Acquisto non ricevuto" },
          { value: "goldoni_non_accreditati", label: "Goldoni non accreditati" },
          { value: "ordine_in_sospeso", label: "Ordine in sospeso" },
          { value: "errore_acquisto", label: "Errore nell'acquisto" },
          { value: "discrepanza", label: "Discrepanza nella transazione" },
          { value: "altro", label: "Altro problema con lo store" },
        ],
      },
      { name: "riferimento_ordine", label: "Numero ordine o riferimento della transazione", type: "text", max: 120, help: "Lo trovi nella mail di conferma. Non inserire dati della carta." },
      { name: "data_acquisto", label: "Data dell'acquisto", type: "date", required: true },
      { ...PROVE, label: "Prove (link a screenshot della ricevuta, senza dati della carta)" },
    ],
  },
  {
    key: "diplomazia",
    category: "towny",
    label: "Diplomazia",
    short: "Trattati, alleanze e richieste di guerra.",
    description: "Per le richieste diplomatiche tra città e nazioni, comprese le richieste di approvazione delle guerre.",
    permission: "towny_diplomazia",
    public: true,
    sensitive: false,
    requiresVerifiedMc: true,
    allowsDraft: true,
    initialStatus: "inviata",
    statuses: [
      S("bozza", "Bozza"),
      S("inviata", "Inviata"),
      S("in_revisione", "In revisione"),
      S("info_richieste", "In attesa di informazioni"),
      S("approvata", "Approvata"),
      S("respinta", "Respinta", true),
      S("annullata", "Annullata", true),
      S("completata", "Completata", true),
    ],
    notices: [
      PUBLIC_NOTICE,
      "Guerre e accordi approvati qui li avvia lo staff sul server. Il forum da solo non cambia nulla in gioco.",
      "Il tuo ruolo sarà verificato dallo staff.",
    ],
    bodyLabel: "Descrizione e contesto",
    fields: [
      {
        name: "tipo",
        label: "Tipo di richiesta",
        type: "select",
        required: true,
        options: [
          { value: "guerra", label: "Approvazione di una guerra" },
          { value: "alleanza", label: "Alleanza" },
          { value: "trattato_pace", label: "Trattato di pace" },
          { value: "accordo", label: "Accordo commerciale o territoriale" },
          { value: "altro", label: "Altra richiesta diplomatica" },
        ],
      },
      { name: "parti", label: "Città o nazioni coinvolte", type: "text", required: true, max: 300 },
      {
        name: "ruolo",
        label: "Il tuo ruolo",
        type: "select",
        required: true,
        options: [
          { value: "sindaco", label: "Sindaco" },
          { value: "leader_nazione", label: "Leader di nazione" },
          { value: "rappresentante", label: "Rappresentante autorizzato" },
        ],
      },
      { name: "motivazione", label: "Motivazione", type: "textarea", required: true, max: 3000 },
      { name: "condizioni", label: "Condizioni proposte", type: "textarea", max: 3000, when: { field: "tipo", in: ["alleanza", "trattato_pace", "accordo", "altro"] } },
      { name: "casus_belli", label: "Casus belli e obiettivi della guerra", type: "textarea", required: true, max: 3000, when: { field: "tipo", in: ["guerra"] } },
      { name: "dichiarazioni", label: "Dichiarazioni delle altre parti, se già raccolte", type: "textarea", max: 3000 },
      PROVE,
    ],
  },
  {
    key: "salotto",
    category: "community",
    label: "Salotto della community",
    short: "Presentazioni e chiacchiere tra giocatori.",
    description: "Presentati, racconta le tue avventure sul server e chiacchiera con gli altri giocatori.",
    permission: "community",
    public: true,
    openReplies: true,
    sensitive: false,
    requiresVerifiedMc: false,
    allowsDraft: false,
    initialStatus: "aperta",
    statuses: [S("aperta", "Aperta"), S("chiusa", "Chiusa", true)],
    notices: [PUBLIC_NOTICE, "Rispetta il regolamento anche qui: lo staff può chiudere le discussioni fuori tema."],
    bodyLabel: "Messaggio",
    fields: [],
  },
  {
    key: "proposte",
    category: "community",
    label: "Proposte e idee",
    short: "Suggerimenti per migliorare il server.",
    description: "Proponi nuove funzioni, eventi o modifiche: la community ne discute e lo staff le valuta.",
    permission: "community",
    public: true,
    openReplies: true,
    sensitive: false,
    requiresVerifiedMc: false,
    allowsDraft: false,
    initialStatus: "aperta",
    statuses: [S("aperta", "Aperta"), S("in_valutazione", "In valutazione"), S("accolta", "Accolta", true), S("respinta", "Respinta", true), S("chiusa", "Chiusa", true)],
    notices: [PUBLIC_NOTICE, "Una proposta accolta non è una promessa di data: lo staff la aggiunge quando è pronta."],
    bodyLabel: "La tua proposta",
    fields: [
      {
        name: "ambito",
        label: "Di cosa parla",
        type: "select",
        required: true,
        options: [
          { value: "gameplay", label: "Gameplay" },
          { value: "towny", label: "Towny e città" },
          { value: "economia", label: "Economia" },
          { value: "eventi", label: "Eventi" },
          { value: "sito", label: "Sito e forum" },
          { value: "altro", label: "Altro" },
        ],
      },
    ],
  },
  {
    key: "candidature",
    category: "candidature",
    label: "Candidature Staff",
    short: "Entra nello staff di TiberiusMC.",
    description: "Per candidarti a un ruolo nello staff. Le candidature sono private.",
    permission: "candidature",
    sensitive: true,
    requiresVerifiedMc: true,
    allowsDraft: false,
    initialStatus: "inviata",
    statuses: [
      S("inviata", "Inviata"),
      S("in_revisione", "In revisione"),
      S("colloquio", "Colloquio o approfondimento"),
      S("accettata", "Accettata", true),
      S("respinta", "Respinta", true),
      S("ritirata", "Ritirata", true),
      S("chiusa", "Chiusa", true),
    ],
    notices: [
      "La candidatura la vedete solo tu e chi nello staff gestisce le candidature.",
      "Se vieni accettato, ruoli e permessi in gioco te li assegna lo staff.",
    ],
    bodyLabel: "Perché vuoi entrare nello staff?",
    autoTitle: (f) => `Candidatura ${f.ruolo || ""}`.trim(),
    fields: [
      // "ruolo" e le domande extra arrivano dalle impostazioni (forum_settings.candidature)
      { name: "ruolo", label: "Ruolo per cui ti candidi", type: "select", required: true, options: [] },
      { name: "eta", label: "Età", type: "number", required: true },
      { name: "fuso_orario", label: "Fuso orario", type: "text", required: true, max: 60 },
      { name: "disponibilita", label: "Disponibilità (giorni e orari)", type: "text", required: true, max: 300 },
      { name: "esperienza", label: "Esperienza precedente", type: "textarea", required: true, max: 3000 },
      { name: "competenze", label: "Competenze pertinenti", type: "textarea", max: 3000 },
      { name: "info", label: "Informazioni aggiuntive", type: "textarea", max: 2000 },
    ],
  },
  {
    key: "candidature_media",
    category: "candidature",
    label: "Candidature Media",
    short: "Diventa creator ufficiale di TiberiusMC.",
    description: "Per chi crea contenuti (video, live, social) sul server e vuole il ruolo media. Le candidature sono private.",
    permission: "candidature_media",
    sensitive: true,
    requiresVerifiedMc: true,
    allowsDraft: false,
    initialStatus: "inviata",
    statuses: [
      S("inviata", "Inviata"),
      S("in_revisione", "In revisione"),
      S("colloquio", "Colloquio o approfondimento"),
      S("accettata", "Accettata", true),
      S("respinta", "Respinta", true),
      S("ritirata", "Ritirata", true),
      S("chiusa", "Chiusa", true),
    ],
    notices: [
      "La candidatura la vedete solo tu e chi nello staff gestisce le candidature media.",
      "Se vieni accettato, il ruolo media e gli eventuali vantaggi te li assegna lo staff.",
    ],
    bodyLabel: "Perché vuoi creare contenuti su TiberiusMC?",
    autoTitle: (f) => `Candidatura media ${f.piattaforma ? `(${f.piattaforma})` : ""}`.trim(),
    fields: [
      {
        name: "piattaforma",
        label: "Piattaforma principale",
        type: "select",
        required: true,
        options: [
          { value: "YouTube", label: "YouTube" },
          { value: "Twitch", label: "Twitch" },
          { value: "TikTok", label: "TikTok" },
          { value: "Instagram", label: "Instagram" },
          { value: "Altro", label: "Altro" },
        ],
      },
      { name: "canali", label: "Link ai tuoi canali", type: "url-list", required: true, max: 1000, help: "Un link per riga." },
      { name: "pubblico", label: "Iscritti o follower", type: "text", required: true, max: 120 },
      { name: "contenuti", label: "Che contenuti fai e con che frequenza", type: "textarea", required: true, max: 2000 },
      { name: "esempi", label: "Link a contenuti recenti", type: "url-list", max: 1000, help: "Facoltativo: video o live che ti rappresentano, un link per riga." },
      { name: "eta", label: "Età", type: "number", required: true },
    ],
  },];

export function isPublicSub(s: Pick<Subcategory, "public">): boolean {
  return Boolean(s.public);
}

export function getSubcategory(key: string): Subcategory | undefined {
  return SUBCATEGORIES.find((s) => s.key === key);
}

export function getStatus(sub: Subcategory, key: string): Status | undefined {
  return sub.statuses.find((s) => s.key === key);
}

/** Impostazioni delle candidature modificabili dallo staff. */
export type CandidatureSettings = {
  aperte: boolean;
  ruoli: string[];
  eta_minima: number | null;
  domande: string[];
};

/** Campi effettivi del modulo, tenendo conto delle impostazioni (candidature). */
export function formFields(sub: Subcategory, settings?: CandidatureSettings): Field[] {
  if (sub.key !== "candidature" || !settings) return sub.fields;
  const fields = sub.fields.map((f) =>
    f.name === "ruolo" ? { ...f, options: settings.ruoli.map((r) => ({ value: r, label: r })) } : f.name === "eta" && settings.eta_minima == null ? { ...f, required: false } : f,
  );
  const extra: Field[] = settings.domande.map((q, i) => ({ name: `domanda_${i + 1}`, label: q, type: "textarea", required: true, max: 3000 }));
  return [...fields, ...extra];
}
