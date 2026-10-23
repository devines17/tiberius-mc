import type { Metadata } from "next";
import { ForumHero } from "@/components/forum/ForumHero";
import { Soon, DiscordBand } from "@/components/ui/Blocks";
import { Words } from "@/components/ui/Words";
import { SkinFigure } from "@/components/staff/SkinFigure";
import { STAFF } from "@/lib/staff";
import { getSkin } from "@/lib/skins";

export const metadata: Metadata = { title: "Staff", description: "Lo staff di Tiberius MC." };

export default async function Page() {
  const roles = STAFF.filter((r) => r.membri.length > 0);
  const skins = new Map((await Promise.all(roles.flatMap((r) => r.membri).map(async (m) => [m.nick, await getSkin(m.nick)] as const))));
  let i = 0;

  return (
    <>
      <ForumHero art="staff" full kicker="tiberiusmc · staff" title="Staff" lead="Le persone che tengono in piedi l'impero." />
      {roles.length === 0 ? (
        <Soon title="elenco staff" text="L'elenco ufficiale dello staff sarà pubblicato qui, con i ruoli reali." />
      ) : (
        roles.map((r) => (
          <section key={r.ruolo} className="wrap section" aria-labelledby={`ruolo-${r.ruolo}`}>
            <h2 id={`ruolo-${r.ruolo}`} className="mb-8 text-[length:var(--step-head)]">
              <Words text={r.ruolo} />
            </h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-stagger="0.08">
              {r.membri.map((m) => {
                const skin = skins.get(m.nick)!;
                return (
                  <li key={m.nick} className="group panel flex flex-col items-center overflow-hidden text-center">
                    <div className="relative grid w-full place-items-center bg-[radial-gradient(ellipse_at_50%_85%,rgba(226,55,43,.28),transparent_65%)] pt-4">
                      <SkinFigure skin={skin} pose={m.posa ?? i++} />
                      <span className="absolute bottom-3 h-3 w-24 rounded-[50%] bg-black/45 blur-[6px]" aria-hidden />
                    </div>
                    <div className="grid w-full gap-1.5 border-t border-white/10 px-5 py-5">
                      <p className="text-lg font-semibold">{skin.name}</p>
                      <p className="mx-auto w-fit rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#ff8a80] ring-1 ring-accent/30">{r.ruolo}</p>
                      {m.descrizione && <p className="mt-1 text-sm text-white/65">{m.descrizione}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
      <DiscordBand />
    </>
  );
}
