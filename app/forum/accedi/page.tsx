import type { Metadata } from "next";
import { Suspense } from "react";
import { ForumHero } from "@/components/forum/ForumHero";
import { Notice } from "@/components/forum/bits";
import { LoginRequired } from "@/components/forum/states";

export const metadata: Metadata = { title: "Accedi", robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  configurazione: "Il login non è ancora configurato. Riprova più tardi.",
  annullato: "Hai annullato l'accesso su Discord.",
  sessione: "La richiesta di accesso è scaduta. Riprova.",
  discord: "Discord non ha risposto correttamente. Riprova tra poco.",
  errore: "Si è verificato un errore durante l'accesso. Riprova.",
};

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <>
      <ForumHero kicker="forum" title={"accedi\nal forum."} lead="Si entra con l'account Discord, quindi non ti serve una nuova password." />
      <div className="grid gap-6 pb-20 pt-10">
        <Suspense fallback={null}>
          <ErrorNotice searchParams={searchParams} />
        </Suspense>
        <LoginRequired next="/forum" text="Il sito riceve solo il tuo nome e il tuo ID Discord. Non può leggere i tuoi messaggi né vedere i tuoi server." />
      </div>
    </>
  );
}

async function ErrorNotice({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const msg = typeof sp.errore === "string" ? ERRORS[sp.errore] : undefined;
  if (!msg) return null;
  return (
    <div className="wrap">
      <Notice tone="error">{msg}</Notice>
    </div>
  );
}
