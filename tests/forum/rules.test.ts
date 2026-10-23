// Test della logica del forum (moduli, permessi, stati).
// Si eseguono con:  node --test tests/forum/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CATEGORIES, SUBCATEGORIES, getSubcategory, formFields, type PermissionKey } from "../../lib/forum/config.ts";
import {
  canView,
  canSeeInternal,
  isStaffFor,
  playerActions,
  staffSettableStatuses,
  staffSubcategories,
  statusAfterPlayerReply,
  validateSubmission,
  notifyKindFor,
  requiresReason,
  looksLikeCardNumber,
  sniffMime,
  safeFilename,
  safeNext,
  parseTicketCode,
  ticketCode,
  withdrawStatus,
  type Viewer,
} from "../../lib/forum/rules.ts";

const viewer = (id: string, perms: PermissionKey[] = []): Viewer => ({ profileId: id, permissions: new Set(perms) });
const A = viewer("A");
const B = viewer("B");
const STORE = viewer("S1", ["store"]);
const CAND = viewer("S2", ["candidature"]);
const ADMIN_ONLY = viewer("ADM", ["admin"]);

// ---------- 1-3. Struttura ----------

test("solo le tre categorie richieste", () => {
  assert.deepEqual(CATEGORIES.map((c) => c.key), ["assistenza", "towny", "candidature"]);
});

test("solo le otto sottosezioni richieste, unban una volta sola", () => {
  assert.deepEqual(SUBCATEGORIES.map((s) => s.key), [
    "assistenza_generale", "unban", "segnalazioni", "cambio_nick", "store", "conflitti", "diplomazia", "candidature",
  ]);
  assert.equal(SUBCATEGORIES.filter((s) => s.key.includes("unban")).length, 1);
  assert.deepEqual(SUBCATEGORIES.filter((s) => s.category === "towny").map((s) => s.key), ["conflitti", "diplomazia"]);
});

test("ogni sottosezione ha il proprio modulo", () => {
  const signatures = SUBCATEGORIES.map((s) => s.fields.map((f) => f.name).join(","));
  assert.equal(new Set(signatures).size, SUBCATEGORIES.length);
});

test("configurazione e database hanno gli stessi stati", () => {
  const sql = readFileSync(new URL("../../supabase/migrations/20261023180000_forum.sql", import.meta.url), "utf8");
  for (const s of SUBCATEGORIES) {
    for (const st of s.statuses) {
      const re = new RegExp(`\\('${s.key}',\\s*'${st.key}',\\s*'[^']*',\\s*${st.final}\\s*,`);
      assert.match(sql, re, `${s.key}/${st.key} (final=${st.final}) assente o diverso nel database`);
    }
    const count = (sql.match(new RegExp(`\\('${s.key}',\\s*'[a-z_]+',\\s*'[^']*',\\s*(true|false)\\s*,`, "g")) ?? []).length;
    assert.equal(count, s.statuses.length, `${s.key}: numero di stati diverso`);
  }
});

// ---------- 4-6. Riservatezza ----------

const storeTicket = { author_id: "A", subcategory: "store", status: "inviata" };
const candTicket = { author_id: "B", subcategory: "candidature", status: "inviata" };
const reportTicket = { author_id: "A", subcategory: "segnalazioni", status: "in_revisione" };

test("un giocatore vede solo le proprie pratiche", () => {
  assert.equal(canView(A, storeTicket), true);
  assert.equal(canView(B, storeTicket), false);
  assert.equal(canView(A, candTicket), false);
});

test("lo staff vede solo le sezioni autorizzate", () => {
  assert.equal(canView(STORE, storeTicket), true);
  assert.equal(canView(STORE, candTicket), false, "lo store non vede le candidature");
  assert.equal(canView(CAND, storeTicket), false, "le candidature non vedono i dati finanziari");
  assert.equal(canView(CAND, candTicket), true);
  assert.deepEqual(staffSubcategories(STORE), ["store"]);
});

test("l'amministrazione generale non dà accesso automatico alle pratiche", () => {
  assert.equal(canView(ADMIN_ONLY, storeTicket), false);
  assert.equal(canView(ADMIN_ONLY, candTicket), false);
  assert.equal(canView(ADMIN_ONLY, reportTicket), false);
});

test("il giocatore segnalato non vede la segnalazione; le note interne restano allo staff", () => {
  const reported = viewer("REPORTED");
  assert.equal(canView(reported, reportTicket), false);
  assert.equal(canSeeInternal(A, reportTicket), false, "l'autore non vede le note interne");
  assert.equal(canSeeInternal(viewer("M", ["segnalazioni"]), reportTicket), true);
});

test("le bozze sono solo dell'autore", () => {
  const draft = { author_id: "B", subcategory: "diplomazia", status: "bozza" };
  const DIPLO = viewer("D", ["towny_diplomazia"]);
  assert.equal(canView(B, draft), true);
  assert.equal(canView(DIPLO, draft), false);
  assert.deepEqual(staffSettableStatuses(DIPLO, draft), []);
});

// ---------- Flusso degli stati ----------

test("risposta a una richiesta di informazioni rimanda la pratica allo staff", () => {
  assert.equal(statusAfterPlayerReply({ ...storeTicket, status: "info_richieste" }), "in_revisione");
  assert.equal(statusAfterPlayerReply({ author_id: "A", subcategory: "assistenza_generale", status: "info_richieste" }), "in_lavorazione");
  assert.equal(statusAfterPlayerReply(storeTicket), null);
});

test("pratiche chiuse: niente risposte libere, solo richiesta di riapertura (una volta)", () => {
  const closed = { ...storeTicket, status: "risolta" };
  assert.deepEqual(playerActions(A, closed), ["request_reopen"]);
  assert.deepEqual(playerActions(A, { ...closed, reopen_requested_at: "2026-10-23" }), []);
  assert.deepEqual(playerActions(B, closed), [], "nessuna azione su pratiche altrui");
});

test("ritiro: solo candidature e diplomazia", () => {
  assert.ok(playerActions(B, candTicket).includes("withdraw"));
  assert.equal(withdrawStatus(candTicket), "ritirata");
  assert.equal(withdrawStatus({ author_id: "B", subcategory: "diplomazia", status: "inviata" }), "annullata");
  assert.ok(!playerActions(A, storeTicket).includes("withdraw"));
});

test("lo staff non imposta la bozza e le decisioni finali richiedono una motivazione", () => {
  const DIPLO = viewer("D", ["towny_diplomazia"]);
  const t = { author_id: "B", subcategory: "diplomazia", status: "inviata" };
  assert.ok(!staffSettableStatuses(DIPLO, t).includes("bozza"));
  assert.ok(staffSettableStatuses(DIPLO, t).includes("approvata"));
  assert.equal(requiresReason(t, "approvata"), true);
  assert.equal(requiresReason(t, "respinta"), true);
  assert.equal(requiresReason(t, "in_revisione"), false);
  assert.equal(notifyKindFor(t, "approvata"), "decisione");
  assert.equal(notifyKindFor(t, "info_richieste"), "info_richieste");
  assert.equal(notifyKindFor(storeTicket, "chiusa"), "chiusura");
  assert.equal(isStaffFor(STORE, t), false);
});

// ---------- Validazione dei moduli ----------

const unban = getSubcategory("unban")!;
const store = getSubcategory("store")!;
const diplomazia = getSubcategory("diplomazia")!;
const candidature = getSubcategory("candidature")!;

test("unban: campi obbligatori e titolo automatico", () => {
  const bad = validateSubmission(unban, { body: "breve", fields: {} });
  assert.equal(bad.ok, false);
  if (!bad.ok) {
    assert.ok(bad.errors.nickname);
    assert.ok(bad.errors.spiegazione);
    assert.ok(bad.errors.body);
  }
  const good = validateSubmission(unban, { body: "Chiedo la revisione del mio ban.", fields: { nickname: "Marco_99", spiegazione: "Non stavo usando hack." } });
  assert.equal(good.ok, true);
  if (good.ok) assert.equal(good.title, "Unban Marco_99");
});

test("nickname non validi rifiutati", () => {
  const r = validateSubmission(unban, { body: "Testo abbastanza lungo.", fields: { nickname: "a b<script>", spiegazione: "x" } });
  assert.equal(r.ok, false);
});

test("campi estranei al modulo vengono scartati", () => {
  const r = validateSubmission(unban, { body: "Testo abbastanza lungo.", fields: { nickname: "Marco", spiegazione: "ok", admin: "true", status: "accolta" } });
  assert.equal(r.ok, true);
  if (r.ok) assert.deepEqual(Object.keys(r.fields).sort(), ["nickname", "spiegazione"]);
});

test("store: blocca numeri di carta e date future", () => {
  const card = validateSubmission(store, { body: "La mia carta è 4111 1111 1111 1111", fields: { tipo_problema: "altro", data_acquisto: "2026-10-01" } });
  assert.equal(card.ok, false);
  if (!card.ok) assert.ok(card.errors.body);
  assert.equal(looksLikeCardNumber("ordine 1234567890123"), false, "un numero d'ordine qualsiasi non è una carta");
  const future = validateSubmission(store, { title: "Goldoni", body: "Non ho ricevuto i Goldoni.", fields: { tipo_problema: "altro", data_acquisto: "2099-01-01" } });
  assert.equal(future.ok, false);
});

test("diplomazia: i campi cambiano col tipo di richiesta", () => {
  const guerra = validateSubmission(diplomazia, {
    title: "Guerra a Neapolis",
    body: "Richiesta di approvazione della guerra.",
    fields: { tipo: "guerra", parti: "Roma, Neapolis", ruolo: "sindaco", motivazione: "Confini", condizioni: "ignorato" },
  });
  assert.equal(guerra.ok, false, "per la guerra serve il casus belli");
  const ok = validateSubmission(diplomazia, {
    title: "Guerra a Neapolis",
    body: "Richiesta di approvazione della guerra.",
    fields: { tipo: "guerra", parti: "Roma, Neapolis", ruolo: "sindaco", motivazione: "Confini", casus_belli: "Furto di territorio", condizioni: "ignorato" },
  });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.fields.condizioni, undefined, "le condizioni non valgono per la guerra");
  const draft = validateSubmission(diplomazia, { title: "Bozza", body: "", fields: { tipo: "alleanza" } }, { draft: true });
  assert.equal(draft.ok, true, "una bozza può essere incompleta");
});

test("candidature: ruoli e domande dalle impostazioni, età minima, candidature chiuse", () => {
  const settings = { aperte: true, ruoli: ["Helper"], eta_minima: 14, domande: ["Come gestiresti una lite in chat?"] };
  assert.deepEqual(formFields(candidature, settings).find((f) => f.name === "ruolo")?.options, [{ value: "Helper", label: "Helper" }]);
  const base = { ruolo: "Helper", eta: "15", fuso_orario: "Europe/Rome", disponibilita: "sera", esperienza: "moderatore altrove", domanda_1: "Parlerei con entrambi" };
  assert.equal(validateSubmission(candidature, { body: "Voglio aiutare la community.", fields: base }, { settings }).ok, true);
  const young = validateSubmission(candidature, { body: "Voglio aiutare la community.", fields: { ...base, eta: "12" } }, { settings });
  assert.equal(young.ok, false);
  const wrongRole = validateSubmission(candidature, { body: "Voglio aiutare la community.", fields: { ...base, ruolo: "Admin" } }, { settings });
  assert.equal(wrongRole.ok, false);
  const closed = validateSubmission(candidature, { body: "Voglio aiutare la community.", fields: base }, { settings: { ...settings, aperte: false } });
  assert.equal(closed.ok, false);
  const noAnswer = validateSubmission(candidature, { body: "Voglio aiutare la community.", fields: { ...base, domanda_1: "" } }, { settings });
  assert.equal(noAnswer.ok, false);
});

// ---------- Allegati e varie ----------

test("gli allegati si riconoscono dai byte, non dal nome", () => {
  assert.equal(sniffMime(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])), "image/png");
  assert.equal(sniffMime(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])), "application/pdf");
  assert.equal(sniffMime(new TextEncoder().encode("log del client\nriga 2")), "text/plain");
  assert.equal(sniffMime(new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03])), null, "un eseguibile viene rifiutato");
  assert.equal(safeFilename("../../etc/passwd.png.exe", "image/png"), "passwdpng.png");
});

test("redirect dopo il login solo verso pagine interne", () => {
  assert.equal(safeNext("/forum/mie"), "/forum/mie");
  assert.equal(safeNext("https://evil.example"), "/forum");
  assert.equal(safeNext("//evil.example"), "/forum");
  assert.equal(safeNext("/\\evil"), "/forum");
});

test("codici pratica", () => {
  assert.equal(ticketCode(1042), "TIB-01042");
  assert.equal(parseTicketCode("TIB-01042"), 1042);
  assert.equal(parseTicketCode("#1042"), 1042);
  assert.equal(parseTicketCode("ciao"), null);
});
