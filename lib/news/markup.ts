/**
 * Formattazione semplice del testo delle news, senza HTML:
 *   ## Titoletto        riga che inizia con "## "
 *   - voce di elenco    righe che iniziano con "- "
 *   **grassetto**  *corsivo*  [testo](https://link)
 *   ![didascalia](https://immagine)   immagine a tutta larghezza, su una riga da sola
 *   !<[didascalia](https://immagine)  immagine a sinistra del testo che segue (!> a destra)
 *   ==parola==           parola evidenziata nel colore del sito
 *   `/comando`           comando o testo tecnico
 *   @ uno | due | tre    fila di "pillole" (di solito sotto il titolo)
 *   ::: Titolo           riquadro colorato con titolo, chiuso da una riga ":::"
 *     [[Etichetta]]      dentro il riquadro: etichetta piccola
 *     |||                dentro il riquadro: passa alla colonna successiva
 *   ~ Firma              riga finale in corsivo, separata da una linea
 * Una riga vuota separa i paragrafi. Tutto il resto è testo normale.
 * Il risultato è una struttura dati: la pagina la trasforma in elementi React,
 * quindi nessun testo scritto può diventare codice nella pagina.
 */

export type Inline =
  | { t: "text"; v: string }
  | { t: "b"; c: Inline[] }
  | { t: "i"; c: Inline[] }
  | { t: "a"; href: string; c: Inline[] }
  | { t: "hl"; c: Inline[] }
  | { t: "code"; v: string };

export type Block = { t: "h"; c: Inline[] } | { t: "p"; c: Inline[] } | { t: "ul"; items: Inline[][] } | { t: "img"; src: string; alt: string; side?: "left" | "right" }
  | { t: "pills"; items: Inline[][] }
  | { t: "label"; v: string }
  | { t: "box"; title: Inline[]; cols: Block[][] }
  | { t: "sign"; c: Inline[] };

/** Immagini solo https (o del sito): niente data:, javascript: e simili. */
export function safeImage(src: string): string | null {
  const h = safeHref(src);
  return h && (h.startsWith("/") || h.startsWith("https://")) ? h : null;
}

/** Solo link http(s) o interni al sito: niente javascript: e simili. */
export function safeHref(href: string): string | null {
  const h = href.trim();
  if (/^\/(?!\/)/.test(h)) return h;
  try {
    const u = new URL(h);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  const flush = () => {
    if (buf) out.push({ t: "text", v: buf });
    buf = "";
  };
  let i = 0;
  while (i < src.length) {
    if (src.startsWith("==", i)) {
      const end = src.indexOf("==", i + 2);
      if (end > i + 2) {
        flush();
        out.push({ t: "hl", c: parseInline(src.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }
    if (src[i] === "`") {
      const end = src.indexOf("`", i + 1);
      if (end > i + 1) {
        flush();
        out.push({ t: "code", v: src.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    if (src.startsWith("**", i)) {
      const end = src.indexOf("**", i + 2);
      if (end > i + 2) {
        flush();
        out.push({ t: "b", c: parseInline(src.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }
    if (src[i] === "*" && src[i + 1] !== "*") {
      const end = src.indexOf("*", i + 1);
      if (end > i + 1 && src[end + 1] !== "*") {
        flush();
        out.push({ t: "i", c: parseInline(src.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }
    if (src[i] === "[") {
      const m = /^\[([^\]\n]+)\]\(([^)\s]+)\)/.exec(src.slice(i));
      const href = m ? safeHref(m[2]) : null;
      if (m && href) {
        flush();
        out.push({ t: "a", href, c: parseInline(m[1]) });
        i += m[0].length;
        continue;
      }
    }
    buf += src[i];
    i++;
  }
  flush();
  return out;
}

export function parseMarkup(text: string): Block[] {
  return parseLines(text.replace(/\r\n?/g, "\n").split("\n"), true);
}

/** Toglie i segni di evidenziazione (per titoli in elenchi, schede e metadati). */
export function plainText(s: string): string {
  return s.replace(/==([^=]+)==/g, "$1");
}

function parseLines(lines: string[], top: boolean): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] = [];
  const endPara = () => {
    if (para.length) blocks.push({ t: "p", c: parseInline(para.join(" ")) });
    para = [];
  };
  const endList = () => {
    if (list.length) blocks.push({ t: "ul", items: list.map(parseInline) });
    list = [];
  };
  const end = () => {
    endPara();
    endList();
  };
  for (let k = 0; k < lines.length; k++) {
    const line = lines[k].trim();
    if (!line) {
      end();
    } else if (top && /^:::\s*\S/.test(line)) {
      // Riquadro: fino alla prossima riga ":::" (o alla fine del testo)
      end();
      const inner: string[] = [];
      let j = k + 1;
      while (j < lines.length && lines[j].trim() !== ":::") inner.push(lines[j++]);
      k = j;
      const cols: string[][] = [[]];
      for (const l of inner) if (l.trim() === "|||") cols.push([]);
      else cols[cols.length - 1].push(l);
      blocks.push({ t: "box", title: parseInline(line.replace(/^:::\s*/, "")), cols: cols.map((c) => parseLines(c, false)).filter((c) => c.length) });
    } else if (!top && /^\[\[[^\]]{1,40}\]\]$/.test(line)) {
      end();
      blocks.push({ t: "label", v: line.slice(2, -2).trim() });
    } else if (/^@ /.test(line)) {
      end();
      blocks.push({ t: "pills", items: line.slice(2).split("|").map((x) => x.trim()).filter(Boolean).slice(0, 8).map(parseInline) });
    } else if (/^~ /.test(line)) {
      end();
      blocks.push({ t: "sign", c: parseInline(line.slice(2).trim()) });
    } else if (line.startsWith("## ")) {
      end();
      blocks.push({ t: "h", c: parseInline(line.slice(3).trim()) });
    } else if (/^![<>]?\[[^\]\n]*\]\([^)\s]+\)$/.test(line) && safeImage(line.slice(line.indexOf("](") + 2, -1))) {
      end();
      const side = line[1] === "<" ? "left" : line[1] === ">" ? "right" : undefined;
      const img: Block = { t: "img", alt: line.slice(line.indexOf("[") + 1, line.indexOf("](")).trim(), src: safeImage(line.slice(line.indexOf("](") + 2, -1))! };
      blocks.push(side ? { ...img, side } : img);
    } else if (/^[-•] /.test(line)) {
      endPara();
      list.push(line.slice(2).trim());
    } else {
      endList();
      para.push(line);
    }
  }
  end();
  return blocks;
}
