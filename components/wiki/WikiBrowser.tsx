"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Castle, Check, Copy, Crown, Flag, House, Lightbulb, Search, Swords, User, X, type LucideIcon } from "lucide-react";
import type { WikiPage } from "@/lib/wiki";

const ICONS: Record<WikiPage["icon"], LucideIcon> = { start: House, resident: User, plot: Flag, town: Castle, nation: Crown, war: Swords };

function CmdRow({ cmd, desc, page, onOpen }: { cmd: string; desc: string; page?: string; onOpen?: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <li className="wiki-cmd">
      <button
        type="button"
        className="wiki-code"
        title="Copia il comando"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(cmd);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          } catch {}
        }}
      >
        <code>{cmd}</code>
        {copied ? <Check className="size-3.5 shrink-0 text-emerald-300" aria-label="copiato" /> : <Copy className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" aria-hidden />}
      </button>
      <span className="text-sm text-white/70">
        {desc}
        {page && (
          <button type="button" onClick={onOpen} className="ml-2 text-xs font-semibold text-[#ff8a80] hover:underline">
            {page}
          </button>
        )}
      </span>
    </li>
  );
}

export function WikiBrowser({ pages }: { pages: WikiPage[] }) {
  const [current, setCurrent] = useState(pages[0].key);
  const [q, setQ] = useState("");
  const page = pages.find((p) => p.key === current) ?? pages[0];
  const groups = useMemo(() => [...new Set(pages.map((p) => p.group))], [pages]);

  // Pagina dall'indirizzo (#sindaco), così i link si possono condividere
  useEffect(() => {
    const go = () => {
      const k = decodeURIComponent(location.hash.slice(1));
      if (pages.some((p) => p.key === k)) setCurrent(k);
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [pages]);

  const open = (k: string) => {
    setCurrent(k);
    setQ("");
    history.replaceState(null, "", `#${k}`);
    document.getElementById("wiki-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return null;
    return pages.flatMap((p) => p.sections.flatMap((s) => (s.cmds ?? []).filter((c) => c.cmd.toLowerCase().includes(t) || c.desc.toLowerCase().includes(t)).map((c) => ({ ...c, page: p }))));
  }, [q, pages]);

  const Icon = ICONS[page.icon];

  return (
    <div id="wiki-top" className="grid scroll-mt-[calc(var(--header-h)+1rem)] gap-5 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:items-start">
      <aside className="grid gap-4 lg:sticky lg:top-[calc(var(--header-h)+1.25rem)]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca un comando…" className="field !h-10 !pl-9 text-sm" aria-label="Cerca un comando" />
          {q && (
            <button type="button" onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/45 hover:text-white" aria-label="Cancella la ricerca">
              <X className="size-4" />
            </button>
          )}
        </label>
        <nav aria-label="Pagine della wiki" className="fbox grid gap-3 p-2">
          {groups.map((g) => (
            <div key={g}>
              <p className="px-2.5 pb-1 pt-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-white/40">{g}</p>
              <ul className="grid gap-0.5">
                {pages
                  .filter((p) => p.group === g)
                  .map((p) => {
                    const I = ICONS[p.icon];
                    const active = !results && p.key === page.key;
                    return (
                      <li key={p.key}>
                        <button type="button" onClick={() => open(p.key)} aria-current={active ? "page" : undefined} className="wiki-nav">
                          <I className="size-4" aria-hidden />
                          {p.label}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {results ? (
        <article className="fbox p-5 md:p-7">
          <h2 className="text-xl font-bold">
            {results.length} {results.length === 1 ? "comando" : "comandi"} per «{q.trim()}»
          </h2>
          {results.length ? (
            <ul className="mt-4 grid gap-1">
              {results.map((r, i) => (
                <CmdRow key={i} cmd={r.cmd} desc={r.desc} page={r.page.label} onOpen={() => open(r.page.key)} />
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-white/55">Nessun comando trovato. Prova con un'altra parola, per esempio «lotto» o «banca».</p>
          )}
        </article>
      ) : (
        <article key={page.key} className="wiki-article fbox p-5 md:p-7">
          <header className="flex items-start gap-4 border-b border-white/[0.08] pb-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-accent/15 text-[#ff8a80]">
              <Icon className="size-6" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">{page.group}</p>
              <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold leading-tight">{page.label}</h2>
              <p className="mt-1 text-white/60">{page.lead}</p>
            </div>
          </header>
          <div className="grid gap-8 pt-6">
            {page.sections.map((s) => (
              <section key={s.title}>
                <h3 className="text-lg font-bold">{s.title}</h3>
                {s.text && <p className="mt-1.5 leading-relaxed text-white/70">{s.text}</p>}
                {s.cmds && (
                  <ul className="mt-3 grid gap-1">
                    {s.cmds.map((c) => (
                      <CmdRow key={c.cmd} cmd={c.cmd} desc={c.desc} />
                    ))}
                  </ul>
                )}
                {s.tips?.map((t) => (
                  <p key={t} className="mt-3 flex gap-2 rounded-md border border-gold/25 bg-gold/[0.07] px-3 py-2 text-sm text-[#ffe3a3]">
                    <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {t}
                  </p>
                ))}
                {"links" in s && s.links && (
                  <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                    {s.links.map((l) => (
                      <Link key={l.href} href={l.href} className="inline-flex items-center gap-1 text-sm font-semibold text-[#ff8a80] hover:underline">
                        {l.label} <ArrowRight className="size-3.5" aria-hidden />
                      </Link>
                    ))}
                  </p>
                )}
              </section>
            ))}
          </div>
          <p className="mt-8 border-t border-white/[0.08] pt-4 text-xs text-white/40">Costi, limiti e ranghi dipendono dalle impostazioni del server. Clicca un comando per copiarlo.</p>
        </article>
      )}
    </div>
  );
}
