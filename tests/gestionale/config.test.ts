import { test } from "node:test";
import assert from "node:assert/strict";
import { can, isManager, projectProgress, townSlug, validTownName } from "../../lib/gestionale/config.ts";

test("permessi dei ruoli", () => {
  assert.ok(can("sindaco", "modifica_citta"));
  assert.ok(!can("assistente", "modifica_citta"));
  assert.ok(can("assistente", "candidature"));
  assert.ok(!can("cittadino", "candidature"));
  assert.ok(can("cittadino", "scrivi"));
  assert.ok(!can("sindaco", "lascia"), "il sindaco non lascia la città da solo");
  assert.ok(!can(null, "scrivi"));
  assert.ok(isManager("assistente") && !isManager("cittadino"));
});

test("nomi e indirizzi delle città", () => {
  assert.equal(townSlug("Città d'Oro"), "citta-d-oro");
  assert.ok(validTownName("Nova Roma"));
  assert.ok(validTownName("Sant'Angelo"));
  assert.ok(!validTownName("ab"));
  assert.ok(!validTownName("<script>"));
});

test("avanzamento dei cantieri", () => {
  assert.equal(projectProgress([]), 0);
  assert.equal(projectProgress([{ needed: 100, done: 50 }, { needed: 100, done: 150 }]), 75);
});
