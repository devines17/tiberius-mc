import type { ElementType } from "react";

type Mode = "scroll" | "hero" | "scrub" | "none";

/**
 * Titolo o frase spezzati in parole, pronti per essere animati.
 * Il DOM è di React: lo script anima solo gli stili, non lo modifica.
 * Il testo accetta "\n" per andare a capo.
 */
export function Words({
  text,
  as: Tag = "span",
  mode = "scroll",
  className = "",
}: {
  text: string;
  as?: ElementType;
  mode?: Mode;
  className?: string;
}) {
  const attr =
    mode === "scroll"
      ? { "data-words": "" }
      : mode === "hero"
        ? { "data-hero-words": "" }
        : mode === "scrub"
          ? { "data-scrub": "" }
          : {};

  const lines = text.split("\n");
  return (
    <Tag className={className} {...attr}>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line.split(" ").map((word, wi, arr) => (
            <span key={wi}>
              {mode === "scrub" ? (
                <span className="sw">{word}</span>
              ) : (
                <span className="w">
                  <span>{word}</span>
                </span>
              )}
              {wi < arr.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
