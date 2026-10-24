"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Info, Link2, Search, X } from "lucide-react";
import type { RuleArticle, RuleChapter } from "@/lib/regole";
import { DiscordIcon } from "@/components/ui/DiscordIcon";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const anchor = (code: string) => `art-${code.replace(".", "")}`;

function articleText(a: RuleArticle): string {
  return norm([a.code, a.title, ...a.blocks.flatMap((b) => (b.t === "p" ? [b.text] : b.items))].join(" "));
}

/**
 * Regolamento con indice laterale: a sinistra i capitoli (quello aperto mostra i suoi articoli),
 * a destra il capitolo scelto con tutti gli articoli già aperti, ricerca in alto e informativa.
 * Link diretti: /regole#art-F2 apre il capitolo F e scorre all'articolo.
 */
export function RulesBrowser({ chapters, intro, version, discord }: { chapters: RuleChapter[]; intro: string[]; version: string; discord: string }) {
  const [active, setActive] = useState(chapters[0]?.letter ?? "");
  const [current, setCurrent] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [info, setInfo] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const nav = useRef<HTMLElement | null>(null);

  // Su telefono la fila dei capitoli scorre in orizzontale: tiene in vista quello aperto
  useEffect(() => {
    const n = nav.current;
    const btn = n?.querySelector<HTMLElement>(`[data-ch="${active}"]`);
    if (n && btn && n.scrollWidth > n.clientWidth) n.scrollTo({ left: btn.offsetLeft - 12, behavior: "smooth" });
  }, [active]);

  const index = useMemo(() => chapters.flatMap((c) => c.articles.map((a) => [a.code, articleText(a)] as const)), [chapters]);
  const query = norm(q.trim());
  // Un codice come "f2" o "F.2" porta dritto all'articolo
  const codeQuery = query.replace(/\s+/g, "").replace(/^([a-z])\.?(\d+)$/, "$1.$2");
  const matches = useMemo(() => {
    if (!query) return null;
    return new Set(index.filter(([code, text]) => norm(code) === codeQuery || text.includes(query)).map(([code]) => code));
  }, [index, query, codeQuery]);

  const chapter = chapters.find((c) => c.letter === active) ?? chapters[0];

  /** Scorre il pannello (o la pagina, su telefono) fino all'articolo. */
  const scrollTo = useCallback((code: string, smooth = true) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(anchor(code));
      const box = scroller.current;
      if (!el) return;
      const inner = box && box.scrollHeight > box.clientHeight + 4;
      if (inner && box) box.scrollTo({ top: el.offsetTop - 16, behavior: smooth ? "smooth" : "auto" });
      else el.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
    });
  }, []);

  // Link diretto (es. /regole#art-F2)
  useEffect(() => {
    const go = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const ch = chapters.find((c) => c.articles.some((a) => anchor(a.code) === id));
      const art = ch?.articles.find((a) => anchor(a.code) === id);
      if (!ch || !art) return;
      setQ("");
      setActive(ch.letter);
      setCurrent(art.code);
      setTimeout(() => scrollTo(art.code, false), 50);
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [chapters, scrollTo]);

  // Evidenzia nell'indice l'articolo che si sta leggendo
  useEffect(() => {
    const box = scroller.current;
    if (!box || matches) return;
    const onScroll = () => {
      const top = box.getBoundingClientRect().top + 40;
      let code: string | null = null;
      for (const a of chapter.articles) {
        const el = document.getElementById(anchor(a.code));
        if (el && el.getBoundingClientRect().top <= top) code = a.code;
      }
      setCurrent(code ?? chapter.articles[0]?.code ?? null);
    };
    onScroll();
    box.addEventListener("scroll", onScroll, { passive: true });
    return () => box.removeEventListener("scroll", onScroll);
  }, [chapter, matches]);

  // Con una nuova ricerca i risultati partono dall'alto
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [query]);

  function openChapter(letter: string) {
    setQ("");
    setActive(letter);
    setCurrent(null);
    scroller.current?.scrollTo({ top: 0 });
    history.replaceState(null, "", location.pathname);
    // Su telefono il testo scorre con la pagina: si torna all'inizio del capitolo
    const box = scroller.current;
    const p = panel.current;
    if (box && p && box.scrollHeight <= box.clientHeight + 4) {
      // sotto la barra del sito e la fila dei capitoli, che resta fissa
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
      const row = nav.current?.closest("aside")?.getBoundingClientRect().height ?? 0;
      window.scrollTo({ top: p.getBoundingClientRect().top + window.scrollY - header - row - 12 });
    }
  }

  function goArticle(code: string) {
    setCurrent(code);
    history.replaceState(null, "", `#${anchor(code)}`);
    scrollTo(code);
  }

  function copyLink(code: string) {
    const url = `${location.origin}/regole#${anchor(code)}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 1600);
    });
  }

  const shown: RuleChapter[] = matches ? chapters.map((c) => ({ ...c, articles: c.articles.filter((a) => matches.has(a.code)) })).filter((c) => c.articles.length) : [chapter];

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-6">
      {/* Indice */}
      <aside className="sticky top-[var(--header-h)] z-30 -mx-[var(--gutter)] min-w-0 border-b border-white/10 bg-[#141416]/95 px-[var(--gutter)] py-2 backdrop-blur lg:top-[calc(var(--header-h)+1rem)] lg:mx-0 lg:flex lg:max-h-[calc(100svh-var(--header-h)-2rem)] lg:flex-col lg:rounded-2xl lg:border-0 lg:bg-[#141416] lg:p-4 lg:ring-1 lg:ring-inset lg:ring-white/10">
        <p className="hidden px-2 pb-3 pt-1 text-xl font-extrabold text-accent lg:block">Indice</p>
        <nav ref={nav} aria-label="Capitoli del regolamento" className="relative -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:block lg:flex-1 lg:overflow-y-auto lg:overflow-x-visible lg:[scrollbar-width:thin] thin-scroll">
          {chapters.map((c) => {
            const on = !matches && c.letter === active;
            return (
              <div key={c.letter} data-ch={c.letter} className="shrink-0 lg:mb-1">
                <button
                  type="button"
                  onClick={() => openChapter(c.letter)}
                  aria-current={on ? "true" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-colors ${on ? "bg-accent text-white shadow-[0_8px_20px_-8px_rgb(226_53_43/0.8)]" : "text-white/70 hover:bg-white/[0.06] hover:text-white"}`}
                >
                  <span className={`grid size-7 shrink-0 place-items-center rounded-md text-xs ${on ? "bg-black/20" : "bg-white/[0.06] text-white/55"}`}>{c.letter}</span>
                  <span className="whitespace-nowrap lg:whitespace-normal">{c.title}</span>
                </button>
                {on && (
                  <ul className="mt-1 hidden gap-0.5 pb-2 pl-5 lg:grid">
                    {c.articles.map((a) => (
                      <li key={a.code}>
                        <button
                          type="button"
                          onClick={() => goArticle(a.code)}
                          className={`flex w-full gap-2 rounded-lg px-3 py-1.5 text-left text-[0.8rem] leading-snug transition-colors ${current === a.code ? "bg-white/[0.07] text-white" : "text-white/55 hover:text-white"}`}
                        >
                          <span className="w-8 shrink-0 font-bold text-[#ff8a80]">{a.code}</span>
                          <span>{a.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
        <a
          href={discord}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 hidden items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-[#c9cdff] ring-1 ring-inset ring-[#8c96ff]/40 transition-colors hover:bg-[#5865f2]/15 lg:flex"
        >
          <DiscordIcon className="size-4" /> Dubbi? Chiedi su Discord
        </a>
      </aside>

      {/* Contenuto */}
      <div ref={panel} className="relative min-w-0 scroll-mt-[calc(var(--header-h)+5.5rem)] overflow-hidden rounded-2xl bg-[#141416] ring-1 ring-inset ring-white/10 lg:scroll-mt-0">
        <div className="flex items-center gap-2 border-b border-white/10 bg-black/20 p-3">
          <label className="relative flex-1">
            <span className="sr-only">Cerca nel regolamento</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" aria-hidden />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca una regola (es. F.2)" className="field !border-transparent !bg-white/[0.04] !pl-9" />
          </label>
          <button
            type="button"
            onClick={() => setInfo((v) => !v)}
            aria-expanded={info}
            aria-label="Informazioni sul regolamento"
            className={`grid size-11 shrink-0 place-items-center rounded-xl transition-colors ${info ? "bg-accent text-white" : "bg-white/[0.04] text-[#ff8a80] hover:bg-white/[0.08]"}`}
          >
            <Info className="size-5" aria-hidden />
          </button>
        </div>

        {info && (
          <div className="absolute inset-x-3 top-[4.25rem] z-20 rounded-xl bg-[#1d1d21] p-5 shadow-2xl shadow-black/60 ring-1 ring-inset ring-white/10">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-extrabold">Informativa · {version}</p>
              <button type="button" onClick={() => setInfo(false)} aria-label="Chiudi" className="text-white/50 hover:text-white">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="grid gap-2 text-sm leading-relaxed text-white/75">
              {intro.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </div>
        )}

        <div ref={scroller} className="relative px-5 pb-10 pt-6 md:px-8 lg:h-[calc(100svh-var(--header-h)-6.5rem)] lg:overflow-y-auto thin-scroll">
          {shown.map((c) => (
            <section key={c.letter} className="mb-10 last:mb-0">
              <h2 className="flex items-baseline gap-4 text-[clamp(1.8rem,3vw,2.5rem)] leading-tight">
                <span className="text-white/15">{c.roman}</span>
                {c.title}
              </h2>
              <div className="mt-6 grid gap-8">
                {c.articles.map((a) => (
                  <article key={a.code} id={anchor(a.code)} className="group/art scroll-mt-[calc(var(--header-h)+5.5rem)] lg:scroll-mt-24">
                    <h3 className="flex flex-wrap items-center gap-3 text-lg">
                      <span className="rounded-md bg-accent/90 px-2 py-0.5 text-xs font-extrabold text-white">{a.code}</span>
                      <span>{a.title}</span>
                      <button
                        type="button"
                        onClick={() => copyLink(a.code)}
                        className="hidden items-center gap-1 text-xs font-semibold text-white/35 opacity-0 lg:inline-flex transition-opacity hover:text-white focus:opacity-100 group-hover/art:opacity-100"
                      >
                        <Link2 className="size-3.5" aria-hidden />
                        {copied === a.code ? "copiato" : "link"}
                      </button>
                    </h3>
                    <div className="mt-2.5 grid gap-2.5 leading-relaxed text-white/75">
                      {a.blocks.map((b, i) =>
                        b.t === "p" ? (
                          <p key={i}>{b.text}</p>
                        ) : (
                          <ul key={i} className="grid gap-1.5">
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
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
          {matches && matches.size === 0 && <p className="py-16 text-center text-white/60">Nessuna regola trovata.</p>}
        </div>
      </div>
    </div>
  );
}
