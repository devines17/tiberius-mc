/**
 * Regolamento ufficiale di TiberiusMC (testo fornito dalla gestione).
 *
 * Codici degli articoli: lettera del capitolo + numero dell'articolo nel capitolo.
 * Es. F.2 = capitolo Fair play, secondo articolo. Il numero originale resta in `n`.
 * Per modificare una regola basta cambiare il testo qui: codici e indice si aggiornano da soli.
 */

export type RuleBlock = { t: "p"; text: string } | { t: "list"; items: string[] };
export type RuleArticle = { code: string; n: number; title: string; blocks: RuleBlock[] };
export type RuleChapter = { letter: string; roman: string; title: string; articles: RuleArticle[] };

export const REGOLE_VERSIONE = "Versione 1.0";

export const REGOLE_INTRO: string[] = [
  "Il presente regolamento disciplina l'accesso e la permanenza nel server TiberiusMC, le attività di gioco, la gestione delle città e delle nazioni, l'economia, il PvP, le guerre e i rapporti con lo staff.",
  "Entrando e giocando su TiberiusMC, ogni giocatore è tenuto a conoscere e rispettare queste regole. La mancata conoscenza del regolamento non costituisce una giustificazione per le violazioni.",
  "Il regolamento si applica al server Minecraft, al sito ufficiale, al forum, allo store e agli altri canali ufficiali della community, limitatamente alle attività connesse a TiberiusMC."
];

export const REGOLE: RuleChapter[] = [
  {
    "letter": "G",
    "roman": "I",
    "title": "Regole generali",
    "articles": [
      {
        "code": "G.1",
        "n": 1,
        "title": "Rispetto della community",
        "blocks": [
          {
            "t": "p",
            "text": "Ogni giocatore deve mantenere un comportamento rispettoso nei confronti degli altri utenti e dello staff."
          },
          {
            "t": "p",
            "text": "Sono vietati insulti gravi, minacce, molestie, persecuzioni, discriminazioni e comportamenti mirati a intimidire o umiliare altri giocatori."
          },
          {
            "t": "p",
            "text": "Non sono consentiti contenuti razzisti, discriminatori o che promuovano odio e violenza contro persone o gruppi."
          },
          {
            "t": "p",
            "text": "Le provocazioni legate al gameplay, alle rivalità tra città e alle guerre sono ammesse entro limiti ragionevoli, purché non si trasformino in molestie personali."
          },
          {
            "t": "p",
            "text": "Non è consentito utilizzare la chat per perseguitare ripetutamente un giocatore che abbia chiesto di essere lasciato in pace."
          },
          {
            "t": "p",
            "text": "Lo staff può intervenire quando un comportamento compromette seriamente la sicurezza, la fruibilità o il corretto svolgimento del gioco."
          }
        ]
      },
      {
        "code": "G.2",
        "n": 2,
        "title": "Account e responsabilità",
        "blocks": [
          {
            "t": "p",
            "text": "Ogni giocatore è responsabile delle attività svolte tramite il proprio account."
          },
          {
            "t": "p",
            "text": "È vietato impersonare altri giocatori, membri dello staff o rappresentanti ufficiali del server."
          },
          {
            "t": "p",
            "text": "È vietato falsificare prove, screenshot, messaggi o informazioni allo scopo di ottenere vantaggi o danneggiare altri utenti."
          },
          {
            "t": "p",
            "text": "Non è consentito condividere credenziali di accesso o tentare di accedere agli account altrui."
          },
          {
            "t": "p",
            "text": "La condivisione degli account, ove tecnicamente possibile, non esonera il titolare dalle responsabilità previste dal regolamento."
          },
          {
            "t": "p",
            "text": "Eventuali compromissioni dell'account devono essere comunicate tempestivamente allo staff."
          }
        ]
      },
      {
        "code": "G.3",
        "n": 3,
        "title": "Rispetto delle decisioni dello staff",
        "blocks": [
          {
            "t": "p",
            "text": "I giocatori devono rispettare le indicazioni dello staff relative alla sicurezza, all'applicazione del regolamento e alla gestione delle situazioni di gioco."
          },
          {
            "t": "p",
            "text": "Le decisioni possono essere contestate attraverso gli strumenti ufficiali previsti, senza ricorrere a molestie, minacce o campagne di disturbo."
          },
          {
            "t": "p",
            "text": "È vietato fingersi membri dello staff o dichiarare falsamente di avere autorizzazioni speciali."
          },
          {
            "t": "p",
            "text": "Lo staff deve applicare il regolamento con ragionevolezza e coerenza, tenendo conto della gravità, delle prove e delle circostanze."
          },
          {
            "t": "p",
            "text": "Una richiesta di revisione non garantisce l'annullamento di una sanzione."
          }
        ]
      }
    ]
  },
  {
    "letter": "F",
    "roman": "II",
    "title": "Fair play e client",
    "articles": [
      {
        "code": "F.1",
        "n": 4,
        "title": "Cheat e vantaggi illeciti",
        "blocks": [
          {
            "t": "p",
            "text": "È vietato utilizzare strumenti o modifiche che forniscano vantaggi non consentiti dal server."
          },
          {
            "t": "p",
            "text": "Sono vietati, a titolo esemplificativo:"
          },
          {
            "t": "list",
            "items": [
              "Aimbot e sistemi di mira automatica.",
              "KillAura e sistemi di attacco automatico non consentiti.",
              "X-ray e strumenti per individuare risorse nascoste in modo illecito.",
              "Fly, speed e altre modifiche che consentano movimenti vietati.",
              "Reach e modifiche illegittime alla distanza di attacco.",
              "Automatismi di combattimento non autorizzati.",
              "Client modificati che alterino il PvP o altre meccaniche in modo illecito.",
              "Script o macro utilizzati per automatizzare attività vietate.",
              "Modifiche che eludano i controlli anticheat."
            ]
          },
          {
            "t": "p",
            "text": "L'elenco non è esaustivo. La liceità di una modifica dipende dalle sue funzioni e dalle regole tecniche pubblicate dal server."
          },
          {
            "t": "p",
            "text": "Le mod puramente estetiche o di accessibilità possono essere ammesse purché non offrano vantaggi vietati. In caso di dubbio, il giocatore deve chiedere conferma allo staff prima di utilizzarle."
          }
        ]
      },
      {
        "code": "F.2",
        "n": 5,
        "title": "Exploit e bug",
        "blocks": [
          {
            "t": "p",
            "text": "È vietato sfruttare intenzionalmente bug per ottenere denaro, Goldoni, oggetti, claim o altri vantaggi non previsti."
          },
          {
            "t": "p",
            "text": "È vietato duplicare oggetti o valuta sfruttando errori del server."
          },
          {
            "t": "p",
            "text": "È vietato aggirare i limiti dei plugin o abusare di meccaniche che il server non intende consentire."
          },
          {
            "t": "p",
            "text": "I bug devono essere segnalati tramite la scheda Segnalazione bug del forum."
          },
          {
            "t": "p",
            "text": "Il giocatore non deve continuare a sfruttare un bug dopo averne riconosciuto la natura anomala."
          },
          {
            "t": "p",
            "text": "Gli oggetti o i benefici ottenuti illecitamente possono essere rimossi."
          },
          {
            "t": "p",
            "text": "La segnalazione tempestiva e la collaborazione possono essere considerate nella valutazione della sanzione."
          }
        ]
      },
      {
        "code": "F.3",
        "n": 6,
        "title": "Automazione e AFK",
        "blocks": [
          {
            "t": "p",
            "text": "È vietato utilizzare bot o sistemi automatizzati per ottenere vantaggi in violazione delle regole."
          },
          {
            "t": "p",
            "text": "L'uso di autoclicker, macro, account automatizzati o sistemi equivalenti deve essere disciplinato dalla lista ufficiale delle modifiche consentite."
          },
          {
            "t": "p",
            "text": "È vietato eludere i sistemi AFK per accumulare ricompense o risorse in modo non autorizzato."
          },
          {
            "t": "p",
            "text": "Le farm automatiche sono consentite soltanto nei limiti previsti dai plugin, dalle regole sulle prestazioni e dalle disposizioni tecniche del server."
          },
          {
            "t": "p",
            "text": "Lo staff può intervenire sulle costruzioni che causano lag significativo o compromettono la stabilità del server."
          }
        ]
      },
      {
        "code": "F.4",
        "n": 7,
        "title": "Abuso dei sistemi di gioco",
        "blocks": [
          {
            "t": "p",
            "text": "È vietato:"
          },
          {
            "t": "list",
            "items": [
              "Aggirare i cooldown delle meccaniche.",
              "Manipolare i sistemi di ricompensa.",
              "Alterare deliberatamente il funzionamento dei plugin.",
              "Utilizzare account secondari per aggirare limiti individuali.",
              "Provocare intenzionalmente lag attraverso entità, oggetti, circuiti o costruzioni eccessive.",
              "Sfruttare configurazioni errate dei permessi per ottenere vantaggi."
            ]
          }
        ]
      },
      {
        "code": "F.5",
        "n": 8,
        "title": "Omertà e complicità",
        "blocks": [
          {
            "t": "p",
            "text": "È vietato coprire consapevolmente chi commette violazioni gravi del regolamento, tra cui:"
          },
          {
            "t": "list",
            "items": [
              "Uso di cheat, client o modifiche vietate.",
              "Sfruttamento di bug, duplicazioni o exploit.",
              "Utilizzo di account secondari per aggirare ban, sanzioni o limiti.",
              "Compravendita con denaro reale al di fuori dello store ufficiale."
            ]
          },
          {
            "t": "p",
            "text": "Chi è a conoscenza diretta di una di queste violazioni deve segnalarla allo staff tramite la scheda Segnalazione giocatori del forum, o Segnalazione bug nel caso di un bug."
          },
          {
            "t": "p",
            "text": "Chi tace pur sapendo, oppure ne trae vantaggio (ad esempio giocando nella stessa città, ricevendo oggetti o combattendo insieme), può essere sanzionato come complice, fino al ban."
          },
          {
            "t": "p",
            "text": "La sanzione tiene conto di quanto la persona sapeva, del vantaggio ottenuto e della durata della violazione. Chi collabora o segnala spontaneamente può ricevere una sanzione ridotta o nessuna sanzione."
          },
          {
            "t": "p",
            "text": "Non è sanzionabile chi non poteva ragionevolmente essere a conoscenza della violazione. Le segnalazioni false o in malafede restano vietate secondo l'articolo A.3."
          }
        ]
      }
    ]
  },
  {
    "letter": "C",
    "roman": "III",
    "title": "Survival e costruzioni",
    "articles": [
      {
        "code": "C.1",
        "n": 9,
        "title": "Costruzioni e utilizzo del territorio",
        "blocks": [
          {
            "t": "p",
            "text": "I giocatori possono costruire nelle aree consentite dal sistema territoriale e dalle regole del server."
          },
          {
            "t": "p",
            "text": "Le costruzioni devono rispettare i limiti tecnici e le eventuali restrizioni pubblicate."
          },
          {
            "t": "p",
            "text": "È vietato costruire deliberatamente per provocare lag o compromettere il funzionamento del server."
          },
          {
            "t": "p",
            "text": "Non è consentito utilizzare costruzioni o meccaniche per aggirare protezioni territoriali."
          },
          {
            "t": "p",
            "text": "Le costruzioni offensive possono essere rimosse quando violano il regolamento della community o le disposizioni sui contenuti."
          },
          {
            "t": "p",
            "text": "Le aree protette, le zone di spawn e le eventuali aree speciali sono soggette alle regole specifiche comunicate dal server."
          }
        ]
      },
      {
        "code": "C.2",
        "n": 10,
        "title": "Griefing e distruzione",
        "blocks": [
          {
            "t": "p",
            "text": "La distruzione o modifica non autorizzata di costruzioni altrui è vietata quando viola le protezioni o le regole applicabili."
          },
          {
            "t": "p",
            "text": "È vietato danneggiare deliberatamente proprietà protette, strutture di altri giocatori o aree comunitarie."
          },
          {
            "t": "p",
            "text": "Le autorizzazioni concesse da una città o da un proprietario devono essere utilizzate entro i limiti accordati."
          },
          {
            "t": "p",
            "text": "L'accesso legittimo a un territorio non costituisce automaticamente autorizzazione a distruggere qualsiasi costruzione."
          },
          {
            "t": "p",
            "text": "Le controversie su accessi, permessi e danni devono essere documentate e sottoposte allo staff attraverso l'assistenza o la categoria Towny appropriata."
          }
        ]
      },
      {
        "code": "C.3",
        "n": 11,
        "title": "Furti e proprietà",
        "blocks": [
          {
            "t": "p",
            "text": "È vietato sottrarre oggetti da contenitori protetti o utilizzare bug per accedere a inventari altrui."
          },
          {
            "t": "p",
            "text": "L'uso improprio di permessi di città, nazione o proprietà può comportare sanzioni."
          },
          {
            "t": "p",
            "text": "Gli scambi e le consegne concordate devono essere documentati quando possibile."
          },
          {
            "t": "p",
            "text": "Le truffe intenzionali possono essere sanzionate quando le prove dimostrano un comportamento fraudolento."
          },
          {
            "t": "p",
            "text": "Le perdite dovute a normali meccaniche Survival non garantiscono automaticamente un rimborso."
          },
          {
            "t": "p",
            "text": "Lo staff valuta eventuali recuperi sulla base delle prove, dei log disponibili e delle regole del server."
          }
        ]
      }
    ]
  },
  {
    "letter": "T",
    "roman": "IV",
    "title": "Towny: città e nazioni",
    "articles": [
      {
        "code": "T.1",
        "n": 12,
        "title": "Regole generali Towny",
        "blocks": [
          {
            "t": "p",
            "text": "Le città e le nazioni devono rispettare le meccaniche e i limiti dei plugin installati."
          },
          {
            "t": "p",
            "text": "I giocatori devono verificare i permessi prima di costruire, modificare o utilizzare territori altrui."
          },
          {
            "t": "p",
            "text": "La fondazione e la gestione di città e nazioni devono rispettare i requisiti economici e tecnici configurati sul server."
          },
          {
            "t": "p",
            "text": "È vietato utilizzare città, nazioni o claim come strumenti per aggirare sanzioni o limitazioni."
          },
          {
            "t": "p",
            "text": "Non è consentito manipolare intenzionalmente le meccaniche territoriali per impedire il normale svolgimento del gioco."
          },
          {
            "t": "p",
            "text": "Le regole sulle distanze, sui claim, sui permessi, sulle espulsioni e sui trasferimenti devono essere quelle effettivamente configurate e pubblicate dal server."
          }
        ]
      },
      {
        "code": "T.2",
        "n": 13,
        "title": "Sindaci e rappresentanti",
        "blocks": [
          {
            "t": "p",
            "text": "Il Sindaco è responsabile della gestione della propria città nell'ambito delle meccaniche Towny."
          },
          {
            "t": "p",
            "text": "I rappresentanti delle nazioni devono utilizzare i poteri disponibili nel rispetto del regolamento."
          },
          {
            "t": "p",
            "text": "Le autorizzazioni concesse agli assistenti e agli altri membri devono essere assegnate consapevolmente."
          },
          {
            "t": "p",
            "text": "Il Sindaco o il rappresentante autorizzato deve verificare i permessi prima di consentire operazioni rilevanti."
          },
          {
            "t": "p",
            "text": "Le controversie interne alla città devono essere risolte, per quanto possibile, attraverso gli strumenti di gestione disponibili."
          },
          {
            "t": "p",
            "text": "Lo staff può intervenire in presenza di violazioni documentate, abusi dei plugin o situazioni che richiedano una decisione amministrativa."
          }
        ]
      },
      {
        "code": "T.3",
        "n": 14,
        "title": "Claim e territori",
        "blocks": [
          {
            "t": "p",
            "text": "I claim devono essere effettuati nel rispetto delle regole e dei limiti Towny."
          },
          {
            "t": "p",
            "text": "È vietato sfruttare bug o configurazioni errate per acquisire territori in modo illecito."
          },
          {
            "t": "p",
            "text": "È vietato utilizzare account secondari o città fittizie per aggirare i limiti di acquisizione dei territori."
          },
          {
            "t": "p",
            "text": "Le contestazioni relative a claim e confini devono includere, quando possibile, le coordinate e le prove."
          },
          {
            "t": "p",
            "text": "Lo staff non è tenuto a trasferire territori o annullare operazioni legittime soltanto perché una parte è insoddisfatta del risultato."
          }
        ]
      },
      {
        "code": "T.4",
        "n": 15,
        "title": "Abusi e controversie Towny",
        "blocks": [
          {
            "t": "p",
            "text": "Le seguenti condotte possono essere sanzionate:"
          },
          {
            "t": "list",
            "items": [
              "Abuso dei permessi territoriali.",
              "Utilizzo di exploit per modificare claim o proprietà.",
              "Manipolazione delle meccaniche per danneggiare altre città.",
              "Falsificazione di prove nelle controversie.",
              "Elusione deliberata delle regole relative a città e nazioni."
            ]
          },
          {
            "t": "p",
            "text": "Le richieste devono essere presentate attraverso la sezione Towny del forum, nella scheda Diplomazia."
          },
          {
            "t": "p",
            "text": "Le decisioni devono essere motivate e registrate quando riguardano interventi amministrativi rilevanti."
          }
        ]
      }
    ]
  },
  {
    "letter": "E",
    "roman": "V",
    "title": "Economia, moneta e Goldoni",
    "articles": [
      {
        "code": "E.1",
        "n": 16,
        "title": "Economia di gioco",
        "blocks": [
          {
            "t": "p",
            "text": "La valuta ordinaria e le altre risorse economiche devono essere ottenute e utilizzate attraverso i sistemi consentiti."
          },
          {
            "t": "p",
            "text": "È vietato duplicare, falsificare o manipolare valuta sfruttando bug."
          },
          {
            "t": "p",
            "text": "È vietato alterare il mercato attraverso strumenti illeciti o transazioni tecniche non autorizzate."
          },
          {
            "t": "p",
            "text": "Le transazioni devono rispettare i limiti e le condizioni dei plugin economici."
          },
          {
            "t": "p",
            "text": "Lo staff può verificare le transazioni sospette nei limiti delle proprie autorizzazioni."
          },
          {
            "t": "p",
            "text": "I trasferimenti sospetti possono essere temporaneamente esaminati quando esistono motivi concreti per sospettare un abuso."
          }
        ]
      },
      {
        "code": "E.2",
        "n": 17,
        "title": "Goldoni",
        "blocks": [
          {
            "t": "p",
            "text": "I Goldoni sono una valuta di gioco acquistabile attraverso lo store ufficiale, secondo le condizioni pubblicate dal server."
          },
          {
            "t": "p",
            "text": "I Goldoni devono essere acquistati o ottenuti esclusivamente tramite i sistemi autorizzati."
          },
          {
            "t": "p",
            "text": "È vietato sfruttare bug per generare o duplicare Goldoni."
          },
          {
            "t": "p",
            "text": "È vietato falsificare ricevute o dichiarare acquisti mai effettuati."
          },
          {
            "t": "p",
            "text": "Gli accrediti e le rettifiche devono essere registrati dal sistema autorizzato."
          },
          {
            "t": "p",
            "text": "In caso di acquisto non ricevuto o saldo errato, il giocatore deve aprire una richiesta nella categoria Assistenza del forum."
          },
          {
            "t": "p",
            "text": "Il giocatore non deve comunicare password o dati completi di pagamento allo staff."
          },
          {
            "t": "p",
            "text": "Le condizioni di acquisto, utilizzo, eventuale trasferibilità e rimborso devono essere pubblicate nello store."
          }
        ]
      }
    ]
  },
  {
    "letter": "P",
    "roman": "VI",
    "title": "PvP, guerre e combattimento",
    "articles": [
      {
        "code": "P.1",
        "n": 18,
        "title": "Regole generali PvP",
        "blocks": [
          {
            "t": "p",
            "text": "Il PvP è consentito nelle aree e nelle modalità in cui il server lo permette."
          },
          {
            "t": "p",
            "text": "I giocatori devono rispettare le protezioni territoriali e le regole specifiche delle zone sicure."
          },
          {
            "t": "p",
            "text": "È vietato utilizzare cheat, exploit o modifiche non consentite per ottenere vantaggi in combattimento."
          },
          {
            "t": "p",
            "text": "È vietato aggirare deliberatamente le protezioni del server per attaccare giocatori in aree non consentite."
          },
          {
            "t": "p",
            "text": "Le eventuali regole su combat logging, teleport, trappole, spawn killing e meccaniche di combattimento devono essere pubblicate in modo esplicito, in coerenza con i plugin effettivamente installati."
          },
          {
            "t": "p",
            "text": "Il normale combattimento consentito dal gameplay non costituisce automaticamente una violazione."
          }
        ]
      },
      {
        "code": "P.2",
        "n": 19,
        "title": "Guerre tra città e nazioni",
        "blocks": [
          {
            "t": "p",
            "text": "Le guerre devono rispettare le meccaniche Towny e le eventuali procedure di autorizzazione previste dal server."
          },
          {
            "t": "p",
            "text": "Quando è richiesta l'approvazione dello staff, la guerra non può essere avviata prima dell'approvazione."
          },
          {
            "t": "p",
            "text": "Le richieste devono indicare le parti coinvolte e le informazioni necessarie alla verifica."
          },
          {
            "t": "p",
            "text": "È vietato aggirare le regole sulle guerre attraverso account secondari, città fittizie o accordi utilizzati per simulare situazioni non consentite."
          },
          {
            "t": "p",
            "text": "Le parti devono rispettare le condizioni e le limitazioni effettivamente applicabili alla guerra."
          },
          {
            "t": "p",
            "text": "È vietato utilizzare exploit o cheat per alterare l'esito di una guerra."
          },
          {
            "t": "p",
            "text": "Eventuali controversie devono essere sottoposte allo staff attraverso il forum."
          },
          {
            "t": "p",
            "text": "L'approvazione sul forum non equivale all'attivazione automatica della guerra nel server, salvo una futura integrazione tecnica ufficiale."
          }
        ]
      },
      {
        "code": "P.3",
        "n": 20,
        "title": "Abusi durante le guerre",
        "blocks": [
          {
            "t": "p",
            "text": "Possono essere sanzionati:"
          },
          {
            "t": "list",
            "items": [
              "Utilizzo di cheat durante il combattimento.",
              "Sfruttamento intenzionale di bug.",
              "Violazione delle limitazioni specifiche della guerra.",
              "Falsificazione di prove relative al conflitto.",
              "Aggiramento delle autorizzazioni richieste.",
              "Utilizzo di account secondari per eludere sanzioni o restrizioni."
            ]
          },
          {
            "t": "p",
            "text": "Le sanzioni devono tenere conto della gravità, dei vantaggi ottenuti e dell'impatto sul gioco."
          }
        ]
      }
    ]
  },
  {
    "letter": "M",
    "roman": "VII",
    "title": "Chat e comunicazione",
    "articles": [
      {
        "code": "M.1",
        "n": 21,
        "title": "Utilizzo della chat",
        "blocks": [
          {
            "t": "p",
            "text": "La chat deve essere utilizzata nel rispetto degli altri giocatori."
          },
          {
            "t": "p",
            "text": "È vietato inviare spam, messaggi ripetitivi o pubblicità non autorizzata."
          },
          {
            "t": "p",
            "text": "È vietato impersonare altri utenti o membri dello staff."
          },
          {
            "t": "p",
            "text": "È vietato pubblicare dati personali altrui senza autorizzazione."
          },
          {
            "t": "p",
            "text": "È vietato utilizzare la chat per organizzare attacchi informatici, furti di account o altre attività illecite."
          },
          {
            "t": "p",
            "text": "Le rivalità tra città e nazioni sono ammesse finché restano legate al gioco e non diventano molestie personali."
          },
          {
            "t": "p",
            "text": "Lo staff può applicare limitazioni temporanee alla chat in caso di abusi."
          }
        ]
      },
      {
        "code": "M.2",
        "n": 22,
        "title": "Pubblicità e collegamenti esterni",
        "blocks": [
          {
            "t": "p",
            "text": "La pubblicità di altri server può essere limitata o vietata secondo le disposizioni pubblicate dal server."
          },
          {
            "t": "p",
            "text": "È vietato diffondere link per phishing, furto di credenziali, malware o altre attività dannose."
          },
          {
            "t": "p",
            "text": "I collegamenti esterni devono rispettare le regole della piattaforma e della community."
          },
          {
            "t": "p",
            "text": "Lo staff può rimuovere messaggi pericolosi o ingannevoli."
          }
        ]
      }
    ]
  },
  {
    "letter": "A",
    "roman": "VIII",
    "title": "Sito, forum e assistenza",
    "articles": [
      {
        "code": "A.1",
        "n": 23,
        "title": "Utilizzo del forum",
        "blocks": [
          {
            "t": "p",
            "text": "Il forum ufficiale è lo strumento per gestire richieste e pratiche relative al server."
          },
          {
            "t": "p",
            "text": "Le categorie principali previste sono:"
          },
          {
            "t": "list",
            "items": [
              "Assistenza",
              "Assistenza generale.",
              "Richieste unban.",
              "Segnalazione giocatori.",
              "Segnalazione bug.",
              "Richieste cambio nickname.",
              "Store.",
              "Towny",
              "Manuale del governatore.",
              "Manuale del sindaco.",
              "Diplomazia.",
              "Candidature",
              "Candidature Staff: presentazione delle candidature per i ruoli disponibili nello staff.",
              "Candidature Media: presentazione delle candidature per creator e contenuti multimediali."
            ]
          }
        ]
      },
      {
        "code": "A.2",
        "n": 24,
        "title": "Richieste di assistenza",
        "blocks": [
          {
            "t": "p",
            "text": "Le richieste devono essere presentate nella categoria appropriata."
          },
          {
            "t": "p",
            "text": "Il giocatore deve fornire informazioni accurate e pertinenti."
          },
          {
            "t": "p",
            "text": "È vietato aprire ripetutamente la stessa pratica per accelerare la risposta."
          },
          {
            "t": "p",
            "text": "Le richieste devono essere aggiornate nella pratica originale quando possibile."
          },
          {
            "t": "p",
            "text": "È vietato utilizzare l'assistenza per insultare, minacciare o molestare lo staff."
          },
          {
            "t": "p",
            "text": "Le pratiche possono essere chiuse dopo la risoluzione o in caso di inattività, secondo le procedure comunicate."
          },
          {
            "t": "p",
            "text": "Le richieste unban non garantiscono la revoca della sanzione."
          }
        ]
      },
      {
        "code": "A.3",
        "n": 25,
        "title": "Segnalazioni di giocatori",
        "blocks": [
          {
            "t": "p",
            "text": "Le segnalazioni devono essere effettuate in buona fede."
          },
          {
            "t": "p",
            "text": "Le prove devono essere autentiche e non manipolate."
          },
          {
            "t": "p",
            "text": "È vietato utilizzare segnalazioni false per danneggiare un altro giocatore."
          },
          {
            "t": "p",
            "text": "Le segnalazioni sono riservate e non devono essere diffuse pubblicamente per organizzare molestie."
          },
          {
            "t": "p",
            "text": "Lo staff valuta le prove e può richiedere ulteriori informazioni."
          },
          {
            "t": "p",
            "text": "La segnalazione non comporta automaticamente una sanzione per la persona segnalata."
          }
        ]
      },
      {
        "code": "A.4",
        "n": 26,
        "title": "Candidature Staff e Media",
        "blocks": [
          {
            "t": "p",
            "text": "I candidati devono fornire informazioni veritiere."
          },
          {
            "t": "p",
            "text": "La candidatura non garantisce l'ingresso nello staff."
          },
          {
            "t": "p",
            "text": "È vietato falsificare esperienze, qualifiche o informazioni rilevanti."
          },
          {
            "t": "p",
            "text": "Le candidature sono riservate agli utenti autorizzati e allo staff competente."
          },
          {
            "t": "p",
            "text": "Le decisioni di selezione sono comunicate attraverso i canali previsti."
          },
          {
            "t": "p",
            "text": "L'accettazione di una candidatura non deve comportare automaticamente privilegi tecnici senza la relativa autorizzazione."
          },
          {
            "t": "p",
            "text": "Le stesse regole valgono per le Candidature Media: l'accettazione non garantisce ruoli, vantaggi o ricompense in gioco senza la relativa autorizzazione dello staff."
          }
        ]
      },
      {
        "code": "A.5",
        "n": 27,
        "title": "Ricerca e archivio",
        "blocks": [
          {
            "t": "p",
            "text": "La ricerca e l'archivio devono essere utilizzati nel rispetto della privacy e dei permessi."
          },
          {
            "t": "p",
            "text": "I giocatori possono consultare le proprie pratiche e gli eventuali contenuti pubblici."
          },
          {
            "t": "p",
            "text": "Le pratiche riservate non devono essere accessibili agli utenti non autorizzati."
          },
          {
            "t": "p",
            "text": "È vietato tentare di aggirare i permessi del sito o del forum."
          },
          {
            "t": "p",
            "text": "Lo staff deve trattare le informazioni delle pratiche in modo appropriato e riservato."
          }
        ]
      }
    ]
  },
  {
    "letter": "N",
    "roman": "IX",
    "title": "Store e acquisti",
    "articles": [
      {
        "code": "N.1",
        "n": 28,
        "title": "Acquisti ufficiali",
        "blocks": [
          {
            "t": "p",
            "text": "Gli acquisti devono essere effettuati attraverso lo store ufficiale."
          },
          {
            "t": "p",
            "text": "Il giocatore deve verificare le condizioni del prodotto prima dell'acquisto."
          },
          {
            "t": "p",
            "text": "È vietato sfruttare errori dello store per ottenere prodotti, valuta o benefici non dovuti."
          },
          {
            "t": "p",
            "text": "I problemi di consegna devono essere segnalati attraverso l'assistenza."
          },
          {
            "t": "p",
            "text": "Non è consentito richiedere allo staff di effettuare accrediti non verificati."
          },
          {
            "t": "p",
            "text": "Le condizioni di pagamento, consegna, rimborso e assistenza devono essere rese disponibili prima dell'acquisto."
          }
        ]
      },
      {
        "code": "N.2",
        "n": 29,
        "title": "Pagamenti e rimborsi",
        "blocks": [
          {
            "t": "p",
            "text": "Le richieste relative ai pagamenti sono esaminate sulla base delle informazioni verificabili."
          },
          {
            "t": "p",
            "text": "Le condizioni di rimborso sono quelle pubblicate nello store e quelle applicabili secondo la normativa vigente."
          },
          {
            "t": "p",
            "text": "Il giocatore non deve fornire password o credenziali di pagamento."
          },
          {
            "t": "p",
            "text": "Eventuali contestazioni devono essere gestite tramite i canali appropriati."
          },
          {
            "t": "p",
            "text": "Le sanzioni per abusi economici devono essere distinte dalle normali richieste di assistenza sui pagamenti."
          }
        ]
      }
    ]
  },
  {
    "letter": "I",
    "roman": "X",
    "title": "Privacy e sicurezza",
    "articles": [
      {
        "code": "I.1",
        "n": 30,
        "title": "Dati personali",
        "blocks": [
          {
            "t": "p",
            "text": "I giocatori non devono pubblicare dati personali propri o altrui senza una ragione legittima e appropriata."
          },
          {
            "t": "p",
            "text": "È vietato divulgare indirizzi, credenziali, informazioni private o dati che possano mettere a rischio la sicurezza di una persona."
          },
          {
            "t": "p",
            "text": "Le informazioni raccolte dal sito e dal forum devono essere trattate secondo le informative e le regole applicabili."
          },
          {
            "t": "p",
            "text": "Le candidature, le segnalazioni e le pratiche economiche devono essere accessibili soltanto alle persone autorizzate."
          },
          {
            "t": "p",
            "text": "I dati non devono essere utilizzati per scopi estranei alla gestione del servizio."
          }
        ]
      },
      {
        "code": "I.2",
        "n": 31,
        "title": "Sicurezza informatica",
        "blocks": [
          {
            "t": "p",
            "text": "È vietato:"
          },
          {
            "t": "list",
            "items": [
              "Tentare di compromettere il sito, il server o gli account.",
              "Effettuare accessi non autorizzati.",
              "Sfruttare vulnerabilità per ottenere informazioni o privilegi.",
              "Interferire intenzionalmente con i servizi.",
              "Diffondere malware o strumenti per sottrarre credenziali.",
              "Tentare di accedere alle pratiche private di altri giocatori."
            ]
          },
          {
            "t": "p",
            "text": "Le vulnerabilità devono essere comunicate privatamente allo staff attraverso i canali appropriati."
          }
        ]
      }
    ]
  },
  {
    "letter": "S",
    "roman": "XI",
    "title": "Sanzioni",
    "articles": [
      {
        "code": "S.1",
        "n": 32,
        "title": "Principi di applicazione",
        "blocks": [
          {
            "t": "p",
            "text": "Le sanzioni sono applicate in base alla gravità della violazione, alla presenza di prove, all'eventuale recidiva e all'impatto sul server."
          },
          {
            "t": "p",
            "text": "Le misure possibili comprendono:"
          },
          {
            "t": "list",
            "items": [
              "Richiamo informale.",
              "Avvertimento ufficiale.",
              "Limitazione temporanea della chat.",
              "Rimozione di contenuti o oggetti ottenuti illecitamente, ove tecnicamente possibile.",
              "Limitazione temporanea di specifiche funzionalità.",
              "Sospensione temporanea dal server.",
              "Ban temporaneo.",
              "Ban permanente nei casi gravi o ripetuti."
            ]
          },
          {
            "t": "p",
            "text": "Non tutte le violazioni devono seguire necessariamente questa sequenza. Le condotte gravi possono giustificare una sanzione più severa."
          }
        ]
      },
      {
        "code": "S.2",
        "n": 33,
        "title": "Circostanze aggravanti",
        "blocks": [
          {
            "t": "p",
            "text": "Possono comportare una sanzione più severa:"
          },
          {
            "t": "list",
            "items": [
              "Recidiva.",
              "Uso intenzionale di cheat.",
              "Abuso sistematico di exploit.",
              "Tentativi di occultare o falsificare le prove.",
              "Collaborazione organizzata per aggirare le regole.",
              "Abusi di privilegi da parte di membri dello staff.",
              "Tentativi di compromettere account o servizi.",
              "Danni significativi all'economia o all'esperienza degli altri giocatori."
            ]
          }
        ]
      },
      {
        "code": "S.3",
        "n": 34,
        "title": "Circostanze attenuanti",
        "blocks": [
          {
            "t": "p",
            "text": "Possono essere considerate:"
          },
          {
            "t": "list",
            "items": [
              "Segnalazione spontanea di un bug.",
              "Collaborazione durante la verifica.",
              "Assenza di precedenti rilevanti.",
              "Interruzione tempestiva della condotta vietata.",
              "Restituzione volontaria di benefici ottenuti illecitamente, ove possibile."
            ]
          },
          {
            "t": "p",
            "text": "Le circostanze attenuanti non garantiscono l'annullamento della sanzione."
          }
        ]
      },
      {
        "code": "S.4",
        "n": 35,
        "title": "Ban e richieste di unban",
        "blocks": [
          {
            "t": "p",
            "text": "Le sanzioni devono essere registrate secondo le procedure interne."
          },
          {
            "t": "p",
            "text": "Il giocatore può presentare una richiesta di unban tramite il forum, se il servizio è disponibile."
          },
          {
            "t": "p",
            "text": "La richiesta deve contenere una spiegazione pertinente e informazioni utili alla revisione."
          },
          {
            "t": "p",
            "text": "Le richieste abusive, ripetitive o contenenti minacce possono essere limitate secondo le procedure pubblicate."
          },
          {
            "t": "p",
            "text": "Lo staff può confermare, ridurre o revocare una sanzione dopo aver esaminato il caso."
          },
          {
            "t": "p",
            "text": "L'apertura di una richiesta non sospende automaticamente il ban."
          }
        ]
      }
    ]
  },
  {
    "letter": "D",
    "roman": "XII",
    "title": "Regole per lo staff",
    "articles": [
      {
        "code": "D.1",
        "n": 36,
        "title": "Condotta dello staff",
        "blocks": [
          {
            "t": "p",
            "text": "I membri dello staff devono rispettare il regolamento come tutti gli altri giocatori."
          },
          {
            "t": "p",
            "text": "I privilegi amministrativi devono essere utilizzati esclusivamente per finalità legittime di gestione e moderazione."
          },
          {
            "t": "p",
            "text": "È vietato utilizzare i privilegi per ottenere vantaggi personali o favorire ingiustamente amici, città o nazioni."
          },
          {
            "t": "p",
            "text": "Le informazioni riservate devono essere protette."
          },
          {
            "t": "p",
            "text": "Le azioni amministrative rilevanti devono essere registrate quando il sistema lo consente."
          },
          {
            "t": "p",
            "text": "I conflitti di interesse devono essere gestiti con imparzialità."
          },
          {
            "t": "p",
            "text": "Le candidature e le richieste private non devono essere divulgate senza autorizzazione."
          }
        ]
      },
      {
        "code": "D.2",
        "n": 37,
        "title": "Permessi e responsabilità",
        "blocks": [
          {
            "t": "p",
            "text": "I permessi devono essere assegnati in base al ruolo effettivo."
          },
          {
            "t": "p",
            "text": "Un moderatore non deve accedere automaticamente a informazioni finanziarie o candidature se non autorizzato."
          },
          {
            "t": "p",
            "text": "Le operazioni sul server devono rispettare le procedure di sicurezza."
          },
          {
            "t": "p",
            "text": "Gli abusi di potere possono comportare la rimozione dei privilegi e ulteriori sanzioni."
          },
          {
            "t": "p",
            "text": "Le decisioni importanti devono essere verificabili attraverso lo storico delle operazioni, ove previsto."
          }
        ]
      }
    ]
  },
  {
    "letter": "R",
    "roman": "XIII",
    "title": "Ricorsi e interpretazione",
    "articles": [
      {
        "code": "R.1",
        "n": 38,
        "title": "Richiesta di revisione",
        "blocks": [
          {
            "t": "p",
            "text": "Le contestazioni relative alle sanzioni devono essere presentate attraverso il canale ufficiale previsto."
          },
          {
            "t": "p",
            "text": "Il ricorso deve spiegare in modo chiaro il motivo della contestazione."
          },
          {
            "t": "p",
            "text": "Il giocatore deve evitare spam, minacce e richieste duplicate."
          },
          {
            "t": "p",
            "text": "La revisione può richiedere l'esame dei log o delle prove disponibili."
          },
          {
            "t": "p",
            "text": "La decisione viene comunicata al richiedente attraverso il canale previsto."
          }
        ]
      },
      {
        "code": "R.2",
        "n": 39,
        "title": "Interpretazione delle regole",
        "blocks": [
          {
            "t": "p",
            "text": "Il regolamento deve essere interpretato in modo coerente con il suo scopo e con le meccaniche effettive del server."
          },
          {
            "t": "p",
            "text": "In caso di dubbio, lo staff deve considerare le circostanze, le prove e l'impatto sul gioco."
          },
          {
            "t": "p",
            "text": "Le regole specifiche dei singoli eventi o modalità possono integrare il regolamento generale, purché siano comunicate chiaramente."
          },
          {
            "t": "p",
            "text": "Le modifiche al regolamento devono essere pubblicate sui canali ufficiali."
          },
          {
            "t": "p",
            "text": "Nessuna regola deve essere applicata retroattivamente in modo arbitrario a comportamenti precedentemente consentiti, salvo interventi necessari per correggere abusi o problemi di sicurezza, da motivare adeguatamente."
          }
        ]
      }
    ]
  },
  {
    "letter": "V",
    "roman": "XIV",
    "title": "Compravendita e scambi",
    "articles": [
      {
        "code": "V.1",
        "n": 40,
        "title": "Scambi tra giocatori",
        "blocks": [
          {
            "t": "p",
            "text": "Gli scambi e le vendite tra giocatori sono liberi, purché avvengano con valuta di gioco, Goldoni ottenuti in modo autorizzato o oggetti di gioco."
          },
          {
            "t": "p",
            "text": "Prima di concludere uno scambio le parti devono chiarire cosa viene scambiato, in che quantità, a che prezzo e con quali tempi di consegna."
          },
          {
            "t": "p",
            "text": "Un affare svantaggioso non costituisce di per sé una violazione: lo staff interviene solo in presenza di inganno, bug o altre violazioni del regolamento."
          },
          {
            "t": "p",
            "text": "È consigliato conservare screenshot o messaggi degli accordi più importanti, da presentare in caso di controversia."
          }
        ]
      },
      {
        "code": "V.2",
        "n": 41,
        "title": "Truffe",
        "blocks": [
          {
            "t": "p",
            "text": "È vietato ingannare deliberatamente altri giocatori in transazioni concordate."
          },
          {
            "t": "p",
            "text": "È vietato falsificare oggetti, quantità, ricevute o condizioni di uno scambio."
          },
          {
            "t": "p",
            "text": "È vietato utilizzare bug per ottenere una transazione non prevista."
          },
          {
            "t": "p",
            "text": "Le segnalazioni devono contenere informazioni verificabili, come messaggi, riferimenti alle transazioni o altre prove disponibili."
          },
          {
            "t": "p",
            "text": "Lo staff valuta i casi individualmente. Non tutte le transazioni andate male costituiscono automaticamente una violazione."
          }
        ]
      },
      {
        "code": "V.3",
        "n": 42,
        "title": "Negozi e mercato",
        "blocks": [
          {
            "t": "p",
            "text": "I negozi, le aste e gli altri sistemi di mercato presenti sul server devono essere utilizzati secondo le loro regole di funzionamento."
          },
          {
            "t": "p",
            "text": "I prezzi sono liberi, ma è vietato presentare in modo ingannevole il contenuto, la quantità o le caratteristiche di ciò che si vende."
          },
          {
            "t": "p",
            "text": "È vietato manipolare il mercato con account secondari, accordi fittizi, bug o automatismi non consentiti."
          },
          {
            "t": "p",
            "text": "Lo staff può rimuovere negozi o annunci ingannevoli e annullare transazioni ottenute in modo illecito, ove tecnicamente possibile."
          }
        ]
      },
      {
        "code": "V.4",
        "n": 43,
        "title": "Vendita di lotti, città e territori",
        "blocks": [
          {
            "t": "p",
            "text": "Possono vendere o cedere lotti, città e territori soltanto i giocatori che ne hanno effettivamente il controllo, come il proprietario del lotto o il Sindaco."
          },
          {
            "t": "p",
            "text": "Il trasferimento deve avvenire tramite le meccaniche Towny del server: un accordo solo verbale non obbliga lo staff a trasferire proprietà o cariche."
          },
          {
            "t": "p",
            "text": "Chi acquista deve verificare prima del pagamento di ricevere effettivamente il lotto, la carica o i permessi concordati."
          },
          {
            "t": "p",
            "text": "Le controversie sulle cessioni vanno presentate allo staff tramite il forum, con le prove dell'accordo."
          }
        ]
      },
      {
        "code": "V.5",
        "n": 44,
        "title": "Pagamenti a rate e prestiti",
        "blocks": [
          {
            "t": "p",
            "text": "I pagamenti a rate, i prestiti e gli accordi a credito tra giocatori sono consentiti, ma avvengono a rischio delle parti coinvolte."
          },
          {
            "t": "p",
            "text": "Lo staff non è tenuto a recuperare prestiti o rate non pagate, salvo nei casi di truffa dimostrata secondo l'articolo V.2."
          },
          {
            "t": "p",
            "text": "È vietato usare prestiti o accordi a credito come strumento per ingannare deliberatamente altri giocatori."
          }
        ]
      },
      {
        "code": "V.6",
        "n": 45,
        "title": "Compravendita con denaro reale",
        "blocks": [
          {
            "t": "p",
            "text": "È vietato vendere, comprare o scambiare con denaro reale, o con altri beni esterni al server, valuta di gioco, Goldoni, oggetti, servizi, territori, città o account di TiberiusMC."
          },
          {
            "t": "p",
            "text": "L'unico canale autorizzato per acquisti con denaro reale è lo store ufficiale."
          },
          {
            "t": "p",
            "text": "Sono vietati anche gli annunci, le offerte e le trattative per questo tipo di vendita, nel server e sui canali ufficiali della community."
          },
          {
            "t": "p",
            "text": "Lo staff può rimuovere gli oggetti, la valuta o i territori ottenuti in questo modo e sanzionare tutti i giocatori coinvolti, sia chi vende sia chi compra."
          },
          {
            "t": "p",
            "text": "Lo staff non interviene per recuperare denaro reale perso in questi scambi."
          }
        ]
      }
    ]
  },
  {
    "letter": "Z",
    "roman": "XV",
    "title": "Disposizioni finali",
    "articles": [
      {
        "code": "Z.1",
        "n": 46,
        "title": "Aggiornamenti",
        "blocks": [
          {
            "t": "p",
            "text": "TiberiusMC può aggiornare il regolamento in seguito a modifiche dei plugin, dell'economia, delle meccaniche Towny o delle esigenze della community."
          },
          {
            "t": "p",
            "text": "Le modifiche sostanziali devono essere comunicate attraverso gli annunci ufficiali."
          }
        ]
      },
      {
        "code": "Z.2",
        "n": 47,
        "title": "Accettazione",
        "blocks": [
          {
            "t": "p",
            "text": "L'accesso e l'utilizzo dei servizi di TiberiusMC comportano l'obbligo di rispettare il regolamento applicabile."
          },
          {
            "t": "p",
            "text": "I giocatori sono invitati a consultare periodicamente la versione ufficiale per conoscere eventuali aggiornamenti."
          }
        ]
      },
      {
        "code": "Z.3",
        "n": 48,
        "title": "Entrata in vigore",
        "blocks": [
          {
            "t": "p",
            "text": "Il presente regolamento è approvato dalla gestione di TiberiusMC ed entra in vigore dalla data della sua pubblicazione sui canali ufficiali."
          }
        ]
      }
    ]
  }
];
