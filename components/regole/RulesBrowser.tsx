"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Link2, Search } from "lucide-react";
import type { RuleArticle, RuleChapter } from "@/lib/regole";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const anchor = (code: string) => `art-${code.replace(".", "")}`;

function articleText(a: RuleArticle): string {
  return norm([a.code, a.title, ...a.blocks.flatMap((b) => (b.t === "p" ? [b.text] : b.items))].join(" "));
}

/** Regolamento a tendina: capitoli con lettera, articoli con codice (es. F.2), ricerca e link diretti. */
export function RulesBrowser({ chapters }: { chapters: RuleChapter[] }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  const index = useMemo(() => chapters.flatMap((c) => c.articles.map((a) => [a.code, articleText(a)] as const)), [chapters]);
  const query = norm(q.trim());
  // Un codice come "f2" o "F.2" porta dritto all'articolo
  const codeQuery = query.replace(/\s+/g, "").replace(/^([a-z])\.?(\d+)$/, "$1.$2");
  const matches = useMemo(() => {
    if (!query) return null;
    return new Set(index.filter(([code, text]) => norm(code) === codeQuery || text.includes(query)).map(([code]) => code));
  }, [index, query, codeQuery]);

  // Link diretto (es. /regole#art-F2): apre l'articolo e ci scorre sopra
  useEffect(() => {
    const go = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const art = chapters.flatMap((c) => c.articles).find((a) => anchor(a.code) === id);
      if (!art) return;
      setOpen((prev) => new Set(prev).add(art.code));
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [chapters]);

  const toggle = (code: string, value: boolean) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (value) next.add(code);
      else next.delete(code);
      return next;
    });

  const all = chapters.flatMap((c) => c.articles.map((a) => a.code));
  const total = matches ? matches.size : all.length;

  return (
    <div className="grid gap-10">
      {/* Indice dei capitoli */}
      <nav aria-label="Capitoli" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((c) => (
          <a key={c.letter} href={`#cap-${c.letter}`} className="panel flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.05]">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-lg font-bold text-white">{c.letter}</span>
            <span className="min-w-0">
              <span className="block truncate font-semibold">{c.title}</span>
              <span className="text-xs text-white/50">
                {c.letter}.1 – {c.letter}.{c.articles.length}
              </span>
            </span>
          </a>
        ))}
      </nav>

      {/* Ricerca */}
      <div className="sticky top-[calc(var(--header-h)+0.5rem)] z-20 grid gap-3 rounded-2xl border border-white/10 bg-[#0b0a0c]/90 p-3 backdrop-blur md:flex md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Cerca nel regolamento</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca una parola o un codice (es. F.2, griefing, Goldoni)"
            className="field !pl-9"
          />
        </label>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/50" aria-live="polite">
            {total} {total === 1 ? "articolo" : "articoli"}
          </span>
          <button type="button" className="btn !h-10 !px-4 !text-xs" onClick={() => setOpen(new Set(all))}>
            apri tutto
          </button>
          <button type="button" className="btn !h-10 !px-4 !text-xs" onClick={() => setOpen(new Set())}>
            chiudi tutto
          </button>
        </div>
      </div>

      {chapters.map((c) => {
        const arts = c.articles.filter((a) => !matches || matches.has(a.code));
        if (!arts.length) return null;
        return (
          <section key={c.letter} id={`cap-${c.letter}`} className="grid scroll-mt-[calc(var(--header-h)+6rem)] gap-4">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent text-2xl font-bold text-white">{c.letter}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Capitolo {c.roman}</p>
                <h2 className="text-[length:var(--step-head)] leading-tight">{c.title}</h2>
              </div>
            </div>
            <div className="grid gap-2">
              {arts.map((a) => {
                const isOpen = Boolean(matches) || open.has(a.code);
                return (
                  <details
                    key={a.code}
                    id={anchor(a.code)}
                    open={isOpen}
                    onToggle={(e) => {
                      if (!matches) toggle(a.code, (e.currentTarget as HTMLDetailsElement).open);
                    }}
                    className="panel group/art scroll-mt-[calc(var(--header-h)+6rem)] overflow-hidden"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.04] md:px-6 [&::-webkit-details-marker]:hidden">
                      <span className="w-12 shrink-0 font-mono text-sm font-bold text-[#ff8a80]">{a.code}</span>
                      <span className="flex-1 font-semibold">{a.title}</span>
                      <ChevronDown className="size-5 shrink-0 text-white/50 transition-transform duration-300 group-open/art:rotate-180" aria-hidden />
                    </summary>
                    <div className="grid gap-3 border-t border-white/10 px-5 py-5 leading-relaxed text-white/80 md:px-6 md:pl-[5.5rem]">
                      {a.blocks.map((b, i) =>
                        b.t === "p" ? (
                          <p key={i}>{b.text}</p>
                        ) : (
                          <ul key={i} className="grid gap-1.5 pl-1">
                            {b.items.map((it) =>
                              it.endsWith(".") ? (
                                <li key={it} className="flex gap-3">
                                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                                  <span>{it}</span>
                                </li>
                              ) : (
                                <li key={it} className="mt-2 font-semibold text-white">
                                  {it}
                                </li>
                              ),
                            )}
                          </ul>
                        ),
                      )}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 text-xs text-white/45 transition-colors hover:text-white"
                          onClick={() => {
                            const url = `${location.origin}/regole#${anchor(a.code)}`;
                            navigator.clipboard?.writeText(url).then(() => {
                              setCopied(a.code);
                              setTimeout(() => setCopied(null), 1600);
                            });
                          }}
                        >
                          <Link2 className="size-3.5" aria-hidden />
                          {copied === a.code ? "link copiato" : `copia link a ${a.code}`}
                        </button>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        );
      })}
      {matches && matches.size === 0 && <p className="panel p-8 text-center text-white/60">Nessun articolo trovato.</p>}
    </div>
  );
}
