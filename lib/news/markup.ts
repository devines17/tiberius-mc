/**
 * Formattazione semplice del testo delle news, senza HTML:
 *   ## Titoletto        riga che inizia con "## "
 *   - voce di elenco    righe che iniziano con "- "
 *   **grassetto**  *corsivo*  [testo](https://link)
 *   ![didascalia](https://immagine)   immagine a tutta larghezza, su una riga da sola
 * Una riga vuota separa i paragrafi. Tutto il resto è testo normale.
 * Il risultato è una struttura dati: la pagina la trasforma in elementi React,
 * quindi nessun testo scritto può diventare codice nella pagina.
 */

export type Inline =
  | { t: "text"; v: string }
  | { t: "b"; c: Inline[] }
  | { t: "i"; c: Inline[] }
  | { t: "a"; href: string; c: Inline[] };

export type Block = { t: "h"; c: Inline[] } | { t: "p"; c: Inline[] } | { t: "ul"; items: Inline[][] } | { t: "img"; src: string; alt: string };

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
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      endPara();
      endList();
    } else if (line.startsWith("## ")) {
      endPara();
      endList();
      blocks.push({ t: "h", c: parseInline(line.slice(3).trim()) });
    } else if (/^!\[[^\]\n]*\]\([^)\s]+\)$/.test(line) && safeImage(line.slice(line.indexOf("](") + 2, -1))) {
      endPara();
      endList();
      blocks.push({ t: "img", alt: line.slice(2, line.indexOf("](")).trim(), src: safeImage(line.slice(line.indexOf("](") + 2, -1))! });
    } else if (/^[-•] /.test(line)) {
      endPara();
      list.push(line.slice(2).trim());
    } else {
      endList();
      para.push(line);
    }
  }
  endPara();
  endList();
  return blocks;
}
