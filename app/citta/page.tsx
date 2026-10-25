import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHead } from "@/components/ui/PageHead";
import { DiscordBand } from "@/components/ui/Blocks";
import { TownEmblem } from "@/components/gestionale/parts";
import { activeTowns } from "@/lib/server/towns";

export const metadata: Metadata = { title: "Città e nazioni", description: "Le città di TiberiusMC: chi le guida, a che nazione appartengono e quali cercano nuovi cittadini." };

export default function Page() {
  return (
    <>
      <PageHead kicker="città e nazioni" title="Città e nazioni" lead="Le città del server. Apri la scheda di una città per conoscerla e chiedere di entrare." art="/images/art/town.png" />
      <section className="wrap section">
        <Suspense fallback={<div className="min-h-40" />}>
          <List />
        </Suspense>
      </section>
      <DiscordBand />
    </>
  );
}

async function List() {
  const towns = await activeTowns();
  if (!towns.length) {
    return (
      <div className="panel grid gap-3 p-8 text-center">
        <p className="text-xl font-bold">Ancora nessuna città registrata</p>
        <p className="text-white/60">
          Sei sindaco di una città sul server? Registrala dal{" "}
          <Link href="/portale" className="link">
            gestionale
          </Link>
          .
        </p>
      </div>
    );
  }
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-white/60">
          {towns.length} {towns.length === 1 ? "città" : "città"} · {towns.filter((t) => t.recruiting).length} cercano cittadini
        </p>
        <Link href="/portale" className="btn !h-10 !text-xs">
          registra la tua città
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {towns.map((t) => (
          <li key={t.id}>
            <Link href={`/citta/vedi?c=${t.slug}`} className="panel flex h-full gap-4 p-5 transition-colors hover:bg-white/[0.03]">
              <TownEmblem town={t} size={60} />
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">{t.name}</p>
                {t.motto && <p className="truncate text-sm italic text-white/55">{t.motto}</p>}
                <p className="mt-2 text-sm text-white/60">
                  {t.members} {t.members === 1 ? "cittadino" : "cittadini"}
                  {t.nation && <> · {t.nation}</>}
                </p>
                <p className="text-sm text-white/45">Sindaco: {t.mayor ?? "—"}</p>
                {t.recruiting && <span className="mt-2 inline-block rounded bg-emerald-400/15 px-2 py-0.5 text-xs font-bold text-emerald-300">Cerca cittadini</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
