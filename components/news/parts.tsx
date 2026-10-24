import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { categoryLabel, categoryTone, formatEventDate, formatNewsDate, NEWS_DEFAULT_COVER } from "@/lib/news/config";
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
    if (n.t === "b") return <strong key={i}><Inl nodes={n.c} /></strong>;
    if (n.t === "i") return <em key={i}><Inl nodes={n.c} /></em>;
    const external = !n.href.startsWith("/");
    return (
      <a key={i} href={n.href} className="link" {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}>
        <Inl nodes={n.c} />
      </a>
    );
  });
}

/** Testo della news con la formattazione semplice (titoletti, elenchi, grassetto, link). */
export function NewsBody({ text }: { text: string }) {
  return (
    <div className="grid gap-5 text-lg leading-relaxed text-white/85">
      {parseMarkup(text).map((b, i) =>
        b.t === "h" ? (
          <h2 key={i} className="mt-4 text-2xl text-white">
            <Inl nodes={b.c} />
          </h2>
        ) : b.t === "ul" ? (
          <ul key={i} className="grid list-disc gap-2 pl-6 marker:text-accent">
            {b.items.map((it, j) => (
              <li key={j}>
                <Inl nodes={it} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            <Inl nodes={b.c} />
          </p>
        ),
      )}
    </div>
  );
}
