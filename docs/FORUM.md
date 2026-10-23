# Forum ufficiale di TiberiusMC

Sistema di pratiche (ticket) con tre categorie: **Assistenza**, **Towny**, **Candidature staff**.
In Towny ci sono anche il *Manuale del sindaco* e il *Manuale del governatore* (`lib/forum/manuali.ts`, pagine `/forum/manuale/...`).
Ogni richiesta è privata: la vedono solo chi l'ha aperta e lo staff con il permesso di quella sezione.

## Architettura

| Parte | Dove |
| --- | --- |
| Pagine | `app/forum/**` (Next.js, rendering sul server) |
| API | `app/api/forum/**`, `app/api/auth/**`, `app/api/mc/**` |
| Regole e permessi | `lib/forum/rules.ts`, configurazione moduli in `lib/forum/config.ts` |
| Accesso ai dati | `lib/server/*` (solo lato server, chiave `service_role`) |
| Database | Supabase/Postgres, schema in `supabase/migrations/` |
| Allegati | Supabase Storage, bucket privato `forum-allegati`, link firmati da 60 s |
| Plugin Minecraft | `plugin/` (Paper, comando `/collega`) |

Sicurezza in breve:
- Il browser non parla mai con Supabase: tutte le letture passano dalle API, che controllano i permessi
  sul server. Nel database RLS è attiva senza policy e i ruoli `anon`/`authenticated` sono revocati.
- Le note interne e gli allegati interni non vengono mai inviati al browser di un giocatore.
- Una pratica che non puoi vedere risponde "non trovata" (non si rivela che esiste).
- Sessione in cookie `HttpOnly`, `Secure`, `SameSite=Lax`; nel database c'è solo l'hash del token.
- Ogni richiesta che modifica dati verifica l'origine (CSRF) ed è limitata nel numero (rate limit).
- Allegati: max 4 file / 4 MB, tipo verificato dai byte (PNG, JPEG, GIF, WebP, PDF, testo).
- Registro attività (`audit_log`) per permessi, decisioni, collegamenti e conservazione.
- Lo store non chiede mai password o numeri di carta completi (vengono rifiutati) e nessuna pratica
  modifica Goldoni, ban, ruoli Towny o ruoli staff: lo staff esegue a mano, il sito registra.

## Messa in funzione

### 1. Supabase
1. Crea un progetto su supabase.com (regione EU).
2. *SQL Editor* → esegui, in ordine, ogni file di `supabase/migrations/` (incolla tutto il contenuto → *Run*).
3. *Project Settings → API*: copia `Project URL` e la chiave `service_role` (segreta).

### 2. App Discord
1. discord.com/developers → *New Application* → *OAuth2*.
2. Redirect: `https://www.tiberiusmc.it/api/auth/discord/callback`
   (per le anteprime Vercel aggiungi anche il loro indirizzo, se vuoi provarle).
3. Copia *Client ID* e *Client Secret*. Scope usato: solo `identify`.

### 3. Variabili su Vercel
*Settings → Environment Variables* (Production e Preview):

| Nome | Valore |
| --- | --- |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | chiave service_role |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | dall'app Discord |
| `MC_LINK_SECRET` | stringa casuale di almeno 32 caratteri (es. `openssl rand -hex 32`) |
| `FORUM_OWNER_DISCORD_IDS` | il tuo ID Discord (modalità sviluppatore → tasto destro → Copia ID) |

Poi *Redeploy*. Al primo accesso il proprietario è amministratore: da **Pannello staff →
Amministrazione** assegna i permessi per sezione (anche a sé stesso: l'amministrazione da sola non
mostra le pratiche).

### 4. Plugin `/collega`
Serve un server Paper/Spigot 1.20+ con Java 17+. **Aternos non permette plugin caricati a mano**:
per provarlo usa un Paper in locale o la VPS. Nel frattempo lo staff può collegare gli account a mano
da *Amministrazione → Collegamento Minecraft manuale*.

1. Compila: `cd plugin && mvn package` (oppure `./build-offline.sh` senza Maven).
2. Copia il jar in `plugins/`, avvia una volta, poi in `plugins/TiberiusCollega/config.yml`
   imposta `segreto:` uguale a `MC_LINK_SECRET` e riavvia.
3. In gioco: `/collega` → codice di 6 caratteri valido 10 minuti → sul sito *Account → Collega*.

Il plugin fa una sola cosa: chiede il codice al sito con una richiesta firmata (HMAC-SHA256, valida
2 minuti). Non esegue comandi e non salva dati.

## Moduli e stati

| Sezione | Permesso | Stati (in grassetto i finali) |
| --- | --- | --- |
| Assistenza generale | `assistenza` | aperta, in lavorazione, informazioni richieste, **risolta**, **chiusa** |
| Segnalazione bug | `bug` | inviata, in verifica, informazioni richieste, bug confermato, **risolto**, **non riproducibile**, **chiusa** |
| Richieste unban | `unban` | inviata, in revisione, informazioni richieste, **accolta**, **respinta**, **chiusa** |
| Segnalazioni giocatori (riservata) | `segnalazioni` | inviata, in revisione, informazioni richieste, **provvedimento preso**, **non fondata**, **chiusa** |
| Cambio nickname | `cambio_nick` | inviata, in revisione, informazioni richieste, approvata, **respinta**, **completata** |
| Store (riservata) | `store` | inviata, in revisione, informazioni richieste, **risolta**, **respinta**, **chiusa** |
| Diplomazia e guerra | `towny_diplomazia` | bozza, inviata, in revisione, in attesa di informazioni, approvata, **respinta**, **annullata**, **completata** |
| Candidature staff (riservata) | `candidature` | inviata, in revisione, colloquio, **accettata**, **respinta**, **ritirata**, **chiusa** |
| Candidature media (riservata) | `candidature_media` | inviata, in revisione, colloquio, **accettata**, **respinta**, **ritirata**, **chiusa** |

Le decisioni finali richiedono una motivazione, visibile al giocatore. Una pratica chiusa non si
modifica: il giocatore può chiederne la riapertura, lo staff decide. "Approvata" in diplomazia non
esegue nulla in gioco.

## Test

```bash
npm test                                   # regole e permessi (node --test)
psql "$DATABASE_URL" -f tests/sql/forum.test.sql   # schema, funzioni e permessi SQL (in una transazione annullata)
```
