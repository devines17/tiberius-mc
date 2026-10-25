import type { ElementType } from "react";

type Mode = "scroll" | "hero" | "scrub" | "none";

/**
 * Titolo o frase come testo semplice (accetta "\n" per andare a capo).
 * Le animazioni parola per parola sono state tolte: i titoli compaiono subito, come in un sito normale.
 * "mode" resta per compatibilità con le pagine che lo passano.
 */
export function Words({ text, as: Tag = "span", className = "" }: { text: string; as?: ElementType; mode?: Mode; className?: string }) {
  const lines = text.split("\n");
  return (
    <Tag className={className}>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line}
        </span>
      ))}
    </Tag>
  );
}
