import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CalendarDays, Flag } from "lucide-react";
import { categoryLabel, categoryTone, formatEventDate, formatNewsDate, formatNewsDateLong, NEWS_DEFAULT_COVER } from "@/lib/news/config";
import { parseMarkup, type Inline } from "@/lib/news/markup";
import type { NewsItem } from "@/lib/server/news";

/** Indirizzo della pagina di una news. */
export const newsHref = (slug: string) => `/news/leggi?s=${encodeURIComponent(slug)}`;

export function CategoryBadge({ category }: { category: string }) {
  const tone = categoryTone(category);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-xs font-bold backdrop-blur-sm" style={{ color: tone, boxShadow: `inset 0 0 0 1px ${tone}55` }}>
      <span aria-hidden className="size-1.5 rounded-full" style={{ background: tone }} />
      {categoryLabel(category)}
    </span>
  );
}

/** Etichetta piena, appoggiata sulla copertina (come nei forum dei server). */
export function CategoryTag({ category, className = "" }: { category: string; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold leading-none text-[#16110d] shadow-[0_2px_10px_rgb(0_0_0/0.35)] ${className}`} style={{ background: categoryTone(category) }}>
      {categoryLabel(category)}
    </span>
  );
}

/** Riga dell'elenco news: copertina a sinistra, titolo, data, riassunto e "Leggi la news". */
export function NewsRow({ item }: { item: NewsItem }) {
  return (
    <article className="group relative grid gap-5 rounded-2xl bg-white/[0.035] p-3 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.06] sm:grid-cols-[19rem_minmax(0,1fr)] sm:p-3.5">
      <div className="relative overflow-hidden rounded-xl">
        <NewsCover src={item.cover} className="aspect-[16/9] transition-transform duration-500 group-hover:scale-[1.04]" />
        <CategoryTag category={item.category} className="absolute left-2.5 top-2.5" />
      </div>
      <div className="flex min-w-0 flex-col px-2 pb-2 sm:px-1 sm:py-2 sm:pr-3">
        <h2 className="text-[1.45rem] font-extrabold leading-tight">
          <Link href={newsHref(item.slug)} className="after:absolute after:inset-0 group-hover:text-[#ff8a80]">
            {item.title}
          </Link>
        </h2>
        <p className="mt-1 text-sm text-white/50">
          {formatNewsDateLong(item.published_at ?? item.created_at)}
          {item.author && <> · {item.author}</>}
        </p>
        {item.event_at && (
          <div className="mt-2">
            <EventDate iso={item.event_at} />
          </div>
        )}
        <p className="mt-2.5 line-clamp-3 leading-relaxed text-white/75">{item.summary}</p>
        <span className="mt-auto flex items-center justify-end gap-1.5 pt-3 text-sm font-extrabold text-[#ff8a80]">
          Leggi la news <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </article>
  );
}

/** Scheda compatta per la home: copertina, titolo e data. */
export function NewsTile({ item }: { item: NewsItem }) {
  return (
    <Link href={newsHref(item.slug)} className="group flex flex-col overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-white/10 transition-[background-color,transform] duration-300 hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="relative overflow-hidden">
        <NewsCover src={item.cover} className="aspect-[16/9] transition-transform duration-500 group-hover:scale-[1.04]" />
        <CategoryTag category={item.category} className="absolute left-3 top-3" />
      </div>
      <div className="px-4 py-4 text-center">
        <h3 className="text-lg font-extrabold leading-snug transition-colors group-hover:text-[#ff8a80]">{item.title}</h3>
        <p className="mt-1 text-xs text-white/50">{formatNewsDateLong(item.published_at ?? item.created_at)}</p>
      </div>
    </Link>
  );
}

/**
 * Copertina: l'immagine caricata, oppure il banditore su fondo rosso
 * (è verticale, quindi non va ritagliato come una foto).
 */
export function NewsCover({ src, className = "", priority = false }: { src: string; className?: string; priority?: boolean }) {
  if (src === NEWS_DEFAULT_COVER) {
    return (
      <div className={`relative overflow-hidden bg-[radial-gradient(60%_80%_at_70%_100%,rgb(255_190_80/0.35),transparent_70%),linear-gradient(160deg,#3a0907,#a3231a)] ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" loading={priority ? "eager" : "lazy"} className="absolute bottom-0 right-[8%] h-[92%] w-auto drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]" />
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden bg-black/40 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading={priority ? "eager" : "lazy"} className="absolute inset-0 size-full object-cover" />
    </div>
  );
}

export function NewsMeta({ item }: { item: Pick<NewsItem, "published_at" | "created_at" | "author"> }) {
  return (
    <p className="text-sm text-white/55">
      {formatNewsDate(item.published_at ?? item.created_at)}
      {item.author && <> · {item.author}</>}
    </p>
  );
}

export function EventDate({ iso }: { iso: string }) {
  return (
    <p className="inline-flex items-center gap-2 text-sm font-bold text-[#ffc94d]">
      <CalendarDays className="size-4" aria-hidden /> {formatEventDate(iso)}
    </p>
  );
}

/** Scheda di una news nella griglia. */
export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link href={newsHref(item.slug)} className="group flex flex-col overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-white/10 transition-[background-color,transform] duration-300 hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="relative">
        <NewsCover src={item.cover} className="aspect-[16/9] transition-transform duration-500 group-hover:scale-[1.03]" />
        <span className="absolute left-3 top-3">
          <CategoryBadge category={item.category} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {item.event_at && <EventDate iso={item.event_at} />}
        <h3 className="text-xl leading-snug transition-colors group-hover:text-[#ff8a80]">{item.title}</h3>
        <p className="line-clamp-3 text-white/70">{item.summary}</p>
        <div className="mt-auto pt-2">
          <NewsMeta item={item} />
        </div>
      </div>
    </Link>
  );
}

function Inl({ nodes }: { nodes: Inline[] }): ReactNode {
  return nodes.map((n, i) => {
    if (n.t === "text") return n.v;
    if (n.t === "b") return <strong key={i} className="font-bold text-white"><Inl nodes={n.c} /></strong>;
    if (n.t === "i") return <em key={i}><Inl nodes={n.c} /></em>;
    const external = !n.href.startsWith("/");
    return (
      <a key={i} href={n.href} className="link" {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}>
        <Inl nodes={n.c} />
      </a>
    );
  });
}

/** Testo della news: titoletti con l'icona, elenchi, immagini, grassetto e link. */
export function NewsBody({ text }: { text: string }) {
  return (
    <div className="grid gap-5 text-[1.08rem] leading-[1.8] text-white/80">
      {parseMarkup(text).map((b, i) =>
        b.t === "h" ? (
          <h2 key={i} className="mt-6 flex items-center gap-3 border-b border-white/10 pb-3 text-[1.6rem] font-extrabold text-white first:mt-0">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/15 text-[#ff8a80] ring-1 ring-inset ring-accent/30" aria-hidden>
              <Flag className="size-4" />
            </span>
            <span>
              <Inl nodes={b.c} />
            </span>
          </h2>
        ) : b.t === "ul" ? (
          <ul key={i} className="grid gap-2">
            {b.items.map((it, j) => (
              <li key={j} className="flex gap-3">
                <span className="mt-[0.7em] size-1.5 shrink-0 rotate-45 bg-accent" aria-hidden />
                <span>
                  <Inl nodes={it} />
                </span>
              </li>
            ))}
          </ul>
        ) : b.t === "img" ? (
          <figure key={i} className="my-2 overflow-hidden rounded-2xl bg-black/30 ring-1 ring-inset ring-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.src} alt={b.alt} loading="lazy" className="block w-full" />
            {b.alt && <figcaption className="px-4 py-2.5 text-sm text-white/55">{b.alt}</figcaption>}
          </figure>
        ) : (
          <p key={i}>
            <Inl nodes={b.c} />
          </p>
        ),
      )}
    </div>
  );
}
