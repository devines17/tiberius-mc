import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DiscordBand } from "@/components/ui/Blocks";
import { ActionForm } from "@/components/gestionale/ActionForm";
import { RoleBadge, TownEmblem } from "@/components/gestionale/parts";
import { Head } from "@/components/forum/zero";
import { getSession } from "@/lib/server/auth";
import { imageUrl, myApplications, myMembership, townBySlug, townMembers } from "@/lib/server/towns";
import { formatDate } from "@/lib/forum/format";
import { LIMITS } from "@/lib/gestionale/config";

export const metadata: Metadata = { title: "Città" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <Suspense fallback={<div className="wrap min-h-[50vh] py-16" />}>
        <Body searchParams={searchParams} />
      </Suspense>
      <DiscordBand />
    </>
  );
}

/** Scheda pubblica di una città: la vede chiunque, senza dati privati. */
async function Body({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const t = await townBySlug(typeof sp.c === "string" ? sp.c : "");
  if (!t || t.status !== "attiva") notFound();
  const [members, session] = await Promise.all([townMembers(t.id), getSession().catch(() => null)]);
  const mine = session ? await myMembership(session) : null;
  const pending = session && !mine ? (await myApplications(session)).find((a) => a.status === "in_attesa" && a.towns.slug === t.slug) : null;
  const mayor = members.find((m) => m.role === "sindaco");

  return (
    <article className="wrap grid gap-8 pb-10 pt-10 md:pt-14">
      <Link href="/citta" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/60 hover:text-white">
        <ArrowLeft className="size-4" aria-hidden /> tutte le città
      </Link>

      <header className="flex flex-wrap items-center gap-5">
        <TownEmblem town={t} size={88} />
        <div className="min-w-0 flex-1">
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-tight">{t.name}</h1>
          {t.motto && <p className="mt-1 text-lg italic text-white/60">{t.motto}</p>}
          <p className="mt-2 text-sm text-white/55">
            Sindaco: <strong className="text-white/85">{mayor?.name ?? "—"}</strong> · {members.length} {members.length === 1 ? "cittadino" : "cittadini"}
            {t.nation && (
              <>
                {" "}
                · Nazione: <strong className="text-white/85">{t.nation}</strong>
              </>
            )}{" "}
            · sul sito dal {formatDate(t.reviewed_at ?? t.created_at)}
          </p>
        </div>
        {t.recruiting && <span className="rounded bg-emerald-400/15 px-2.5 py-1 text-sm font-bold text-emerald-300">Cerca cittadini</span>}
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="grid gap-8">
          <section className="panel p-6 md:p-8">
            <h2 className="mb-3 text-xl font-bold">La città</h2>
            <p className="whitespace-pre-line leading-relaxed text-white/80">{t.description}</p>
          </section>

          {t.photos.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold">Foto</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {t.photos.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p} src={imageUrl(p) ?? ""} alt={`Una costruzione di ${t.name}`} loading="lazy" className="aspect-video w-full rounded-xl object-cover ring-1 ring-white/10" />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="grid gap-4">
          <section className="panel p-5">
            <h2 className="mb-3 font-bold">Entra in {t.name}</h2>
            {mine ? (
              <p className="text-sm text-white/60">{mine.town.id === t.id ? "Fai già parte di questa città." : `Fai già parte di ${mine.town.name}.`}</p>
            ) : !t.recruiting ? (
              <p className="text-sm text-white/60">Al momento la città non cerca nuovi cittadini.</p>
            ) : !session ? (
              <a href={`/api/auth/discord/login?next=${encodeURIComponent(`/citta/vedi?c=${t.slug}`)}`} className="btn btn-discord !h-10 w-full !text-xs">
                accedi per candidarti
              </a>
            ) : pending ? (
              <p className="text-sm text-white/60">Hai già chiesto di entrare: il sindaco ti risponderà presto. Riceverai una notifica.</p>
            ) : (
              <ActionForm azione="candidati" className="grid gap-3" ok="Richiesta inviata al sindaco.">
                <input type="hidden" name="town" value={t.id} />
                <label className="grid gap-1.5 text-sm">
                  Presentati in poche righe
                  <textarea name="message" maxLength={LIMITS.message} className="field min-h-24" placeholder="Chi sei, da quanto giochi, cosa ti piace costruire…" />
                </label>
                <button type="submit" className="btn btn-accent !h-10 !text-xs">
                  chiedi di entrare
                </button>
              </ActionForm>
            )}
          </section>

          <section className="panel p-5">
            <h2 className="mb-3 font-bold">Cittadini</h2>
            <ul className="grid gap-2.5">
              {members.map((m) => (
                <li key={m.profile_id} className="flex items-center gap-2.5">
                  <Head name={m.mc} size={28} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{m.name}</span>
                  {m.role !== "cittadino" && <RoleBadge role={m.role} />}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </article>
  );
}
