import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMarkup, parseInline, plainText, safeHref } from "../../lib/news/markup.ts";
import { slugify } from "../../lib/news/config.ts";

test("paragrafi, titoletti ed elenchi", () => {
  const b = parseMarkup("Ciao a tutti\nseconda riga\n\n## Novità\n- uno\n- **due**\n\nFine");
  assert.deepEqual(b.map((x) => x.t), ["p", "h", "ul", "p"]);
  assert.deepEqual(b[0], { t: "p", c: [{ t: "text", v: "Ciao a tutti seconda riga" }] });
  assert.equal((b[2] as { items: unknown[] }).items.length, 2);
});

test("grassetto, corsivo e link sicuri", () => {
  assert.deepEqual(parseInline("a **b** *c*"), [
    { t: "text", v: "a " },
    { t: "b", c: [{ t: "text", v: "b" }] },
    { t: "text", v: " " },
    { t: "i", c: [{ t: "text", v: "c" }] },
  ]);
  assert.deepEqual(parseInline("[sito](https://tiberiusmc.it)"), [{ t: "a", href: "https://tiberiusmc.it/", c: [{ t: "text", v: "sito" }] }]);
  // i link pericolosi restano testo
  assert.deepEqual(parseInline("[x](javascript:alert(1))"), [{ t: "text", v: "[x](javascript:alert(1))" }]);
  assert.equal(safeHref("//evil.com"), null);
  assert.equal(safeHref("/regole"), "/regole");
});

test("asterischi senza chiusura restano testo", () => {
  assert.deepEqual(parseInline("2 * 3 = 6"), [{ t: "text", v: "2 * 3 = 6" }]);
  assert.deepEqual(parseInline("**aperto"), [{ t: "text", v: "**aperto" }]);
});

test("slug degli indirizzi", () => {
  assert.equal(slugify("Evento: la Guerra di Città!"), "evento-la-guerra-di-citta");
  assert.equal(slugify("   "), "news");
  assert.ok(slugify("a".repeat(200)).length <= 70);
});

test("immagini: solo https o del sito, su una riga da sola", () => {
  assert.deepEqual(parseMarkup("![Il mercato](https://x.supabase.co/a.webp)"), [{ t: "img", alt: "Il mercato", src: "https://x.supabase.co/a.webp" }]);
  assert.deepEqual(parseMarkup("![](/images/a.webp)"), [{ t: "img", alt: "", src: "/images/a.webp" }]);
  assert.equal(parseMarkup("![x](javascript:alert(1))")[0].t, "p");
  assert.equal(parseMarkup("![x](http://a.it/b.png)")[0].t, "p");
  assert.equal(parseMarkup("testo ![x](https://a.it/b.png)")[0].t, "p");
});

test("immagini a lato del testo", () => {
  assert.deepEqual(parseMarkup("!<[La cuccia](https://a.it/c.webp)"), [{ t: "img", alt: "La cuccia", src: "https://a.it/c.webp", side: "left" }]);
  assert.deepEqual(parseMarkup("!>[](https://a.it/c.webp)"), [{ t: "img", alt: "", src: "https://a.it/c.webp", side: "right" }]);
});

test("evidenziato, codice, pillole, riquadri e firma", () => {
  assert.deepEqual(parseInline("il ==Pass== con `/pass`"), [
    { t: "text", v: "il " },
    { t: "hl", c: [{ t: "text", v: "Pass" }] },
    { t: "text", v: " con " },
    { t: "code", v: "/pass" },
  ]);
  const b = parseMarkup("@ uno | due\n\n::: Ricompense\n[[Normale]]\n- a\n|||\n[[Premium]]\n- b\n:::\n\n~ Ti aspettiamo!");
  assert.deepEqual(b.map((x) => x.t), ["pills", "box", "sign"]);
  const box = b[1] as Extract<(typeof b)[number], { t: "box" }>;
  assert.equal(box.cols.length, 2);
  assert.deepEqual(box.cols[0].map((x) => x.t), ["label", "ul"]);
  assert.equal(plainText("Arrivano i ==pet== su Tiberius"), "Arrivano i pet su Tiberius");
});
