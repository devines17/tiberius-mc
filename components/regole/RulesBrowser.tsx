"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Info, Link2, MessagesSquare, Castle, Search, X, type LucideIcon } from "lucide-react";
import type { RuleGroup, RuleSection } from "@/lib/regole";
import { DiscordIcon } from "@/components/ui/DiscordIcon";

type Article = RuleSection["articles"][number];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const anchor = (code: string) => `art-${code.replace(".", "-")}`;
const ICON: Record<string, LucideIcon> = { G: BookOpen, T: Castle, F: MessagesSquare };

function articleText(a: Article): string {
  return norm([a.code, a.title, ...a.blocks.flatMap((b) => (b.t === "p" ? [b.text] : b.items))].join(" "));
}

/**
 * Regolamento in tre parti (Generale, Towny, Forum). A sinistra l'indice: la parte aperta mostra le sue sezioni.
 * A destra la parte scelta, con ogni regola in un riquadro. Link diretti: /regole#art-G2-2
 * (valgono anche i vecchi link, es. #art-F2).
 */
export function RulesBrowser({ groups, intro, version, discord }: { groups: RuleGroup[]; intro: string[]; version: string; discord: string }) {
  const [active, setActive] = useState(groups[0]?.letter ?? "");
  const [current, setCurrent] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [info, setInfo] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const nav = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const n = nav.current;
    const btn = n?.querySelector<HTMLElement>(`[data-ch="${active}"]`);
    if (n && btn && n.scrollWidth > n.clientWidth) n.scrollTo({ left: btn.offsetLeft - 12, behavior: "smooth" });
  }, [active]);

  const all = useMemo(() => groups.flatMap((g) => g.sections.flatMap((s) => s.articles.map((a) => ({ g: g.letter, a })))), [groups]);
  const index = useMemo(() => all.map(({ a }) => [a.code, articleText(a)] as const), [all]);
  const query = norm(q.trim());
  // Un codice come "g2.2", "G2 2" o "g22" porta dritto all'articolo
  const codeQuery = query.replace(/\s+/g, "").replace(/^([a-z])(\d)\.?(\d+)$/, "$1$2.$3");
  const matches = useMemo(() => {
    if (!query) return null;
    return new Set(index.filter(([code, text]) => norm(code) === codeQuery || text.includes(query)).map(([code]) => code));
  }, [index, query, codeQuery]);

  const group = groups.find((g) => g.letter === active) ?? groups[0];

  const scrollToId = useCallback((id: string, smooth = true) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      const box = scroller.current;
      if (!el) return;
      const inner = box && box.scrollHeight > box.clientHeight + 4;
      if (inner && box) box.scrollTo({ top: el.offsetTop - 16, behavior: smooth ? "smooth" : "auto" });
      else el.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
    });
  }, []);

  // Link diretto, anche con i codici di prima (#art-F2)
  useEffect(() => {
    const go = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const hit = all.find(({ a }) => anchor(a.code) === id || `art-${a.old.replace(".", "")}` === id);
      if (!hit) return;
      setQ("");
      setActive(hit.g);
      setCurrent(hit.a.code);
      setTimeout(() => scrollToId(anchor(hit.a.code), false), 50);
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [all, scrollToId]);

  // Evidenzia nell'indice la sezione che si sta leggendo
  useEffect(() => {
    const box = scroller.current;
    if (!box || matches) return;
    const onScroll = () => {
      const top = box.getBoundingClientRect().top + 60;
      let key: string | null = null;
      for (const s of group.sections) {
        const el = document.getElementById(`sez-${s.key}`);
        if (el && el.getBoundingClientRect().top <= top) key = s.key;
      }
      setCurrent(key ?? group.sections[0]?.key ?? null);
    };
    onScroll();
    box.addEventListener("scroll", onScroll, { passive: true });
    return () => box.removeEventListener("scroll", onScroll);
  }, [group, matches]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [query]);

  function openGroup(letter: string) {
    setQ("");
    setActive(letter);
    setCurrent(null);
    scroller.current?.scrollTo({ top: 0 });
    history.replaceState(null, "", location.pathname);
    const box = scroller.current;
    const p = panel.current;
    if (box && p && box.scrollHeight <= box.clientHeight + 4) {
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
      const row = nav.current?.closest("aside")?.getBoundingClientRect().height ?? 0;
      window.scrollTo({ top: p.getBoundingClientRect().top + window.scrollY - header - row - 12 });
    }
  }

  function goSection(key: string) {
    setCurrent(key);
    scrollToId(`sez-${key}`);
  }

  function copyLink(code: string) {
    const url = `${location.origin}/regole#${anchor(code)}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 1600);
    });
  }

  // Con la ricerca: tutte le parti, solo le regole trovate
  const shown: RuleGroup[] = matches
    ? groups
        .map((g) => ({ ...g, sections: g.sections.map((s) => ({ ...s, articles: s.articles.filter((a) => matches.has(a.code)) })).filter((s) => s.articles.length) }))
        .filter((g) => g.sections.length)
    : [group];

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-6">
      {/* Indice */}
      <aside className="sticky top-[var(--header-h)] z-30 -mx-[var(--gutter)] min-w-0 border-b border-white/10 bg-[#141416]/95 px-[var(--gutter)] py-2 backdrop-blur lg:top-[calc(var(--header-h)+1rem)] lg:mx-0 lg:flex lg:max-h-[calc(100svh-var(--header-h)-2rem)] lg:flex-col lg:rounded-2xl lg:border-0 lg:bg-[#141416] lg:p-4 lg:ring-1 lg:ring-inset lg:ring-white/10">
        <p className="hidden px-2 pb-3 pt-1 text-xl font-extrabold text-accent lg:block">Indice</p>
        <nav ref={nav} aria-label="Parti del regolamento" className="relative -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:block lg:flex-1 lg:overflow-y-auto lg:overflow-x-visible lg:[scrollbar-width:thin] thin-scroll">
          {groups.map((g) => {
            const on = !matches && g.letter === active;
            const Icon = ICON[g.letter] ?? BookOpen;
            return (
              <div key={g.letter} data-ch={g.letter} className="shrink-0 lg:mb-1.5">
                <button
                  type="button"
                  onClick={() => openGroup(g.letter)}
                  aria-current={on ? "true" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-bold transition-colors ${on ? "bg-accent text-white shadow-[0_8px_20px_-8px_rgb(226_53_43/0.8)]" : "text-white/70 hover:bg-white/[0.06] hover:text-white"}`}
                >
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${on ? "bg-black/20" : "bg-white/[0.06] text-white/55"}`}>
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="whitespace-nowrap">{g.title}</span>
                </button>
                {on && (
                  <ul className="mt-1 hidden gap-0.5 pb-2 pl-5 lg:grid">
                    {g.sections.map((s) => (
                      <li key={s.key}>
                        <button
                          type="button"
                          onClick={() => goSection(s.key)}
                          className={`flex w-full gap-2 rounded-lg px-3 py-1.5 text-left text-[0.82rem] leading-snug transition-colors ${current === s.key ? "bg-white/[0.07] text-white" : "text-white/55 hover:text-white"}`}
                        >
                          <span className="w-6 shrink-0 font-bold text-gold">{s.key}</span>
                          <span>{s.title}</span>
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
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca una regola (es. G2.2)" className="field !border-transparent !bg-white/[0.04] !pl-9" />
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

        <div ref={scroller} className="relative px-4 pb-10 pt-6 md:px-7 lg:h-[calc(100svh-var(--header-h)-6.5rem)] lg:overflow-y-auto thin-scroll">
          {shown.map((g) => (
            <div key={g.letter} className="mb-12 last:mb-0">
              <header className="mb-8">
                <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] leading-tight">{g.title}</h2>
                <p className="mt-1 text-white/55">{g.description}</p>
              </header>
              <div className="grid gap-10">
                {g.sections.map((s) => (
                  <section key={s.key} id={`sez-${s.key}`} className="scroll-mt-[calc(var(--header-h)+5.5rem)] lg:scroll-mt-24" aria-labelledby={`sez-t-${s.key}`}>
                    <h3 id={`sez-t-${s.key}`} className="mb-4 flex items-center gap-3 text-[1.35rem] font-extrabold text-gold">
                      <span className="rounded-md bg-gold/15 px-2 py-0.5 text-sm text-gold ring-1 ring-inset ring-gold/30">{s.key}</span>
                      {s.title}
                    </h3>
                    <div className="grid gap-3">
                      {s.articles.map((a) => (
                        <article
                          key={a.code}
                          id={anchor(a.code)}
                          className="group/art scroll-mt-[calc(var(--header-h)+5.5rem)] rounded-r-xl border-l-[3px] border-white/20 bg-white/[0.045] px-5 py-5 transition-colors hover:border-accent hover:bg-white/[0.065] md:px-6 lg:scroll-mt-24"
                        >
                          <h4 className="flex flex-wrap items-center gap-3">
                            <span className="rounded-md bg-accent px-2 py-1 text-xs font-extrabold leading-none text-white">{a.code}</span>
                            <span className="text-[1.15rem] font-extrabold text-white">{a.title}</span>
                            <button
                              type="button"
                              onClick={() => copyLink(a.code)}
                              className="ml-auto hidden items-center gap-1 text-xs font-semibold text-white/35 opacity-0 transition-opacity hover:text-white focus:opacity-100 group-hover/art:opacity-100 lg:inline-flex"
                            >
                              <Link2 className="size-3.5" aria-hidden />
                              {copied === a.code ? "copiato" : "link"}
                            </button>
                          </h4>
                          <div className="mt-3 grid gap-2.5 leading-relaxed text-white/75">
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
              </div>
            </div>
          ))}
          {matches && matches.size === 0 && <p className="py-16 text-center text-white/60">Nessuna regola trovata.</p>}
        </div>
      </div>
    </div>
  );
}
