import type { Metadata } from "next";
import { ForumHero } from "@/components/forum/ForumHero";
import { Soon, DiscordBand } from "@/components/ui/Blocks";
import { Words } from "@/components/ui/Words";
import { SkinFigure } from "@/components/staff/SkinFigure";
import { PauseOffscreen } from "@/components/staff/PauseOffscreen";
import { STAFF } from "@/lib/staff";
import { getSkin } from "@/lib/skins";

export const metadata: Metadata = { title: "Staff", description: "Lo staff di TiberiusMC." };

export default async function Page() {
  const roles = STAFF.filter((r) => r.membri.length > 0);
  const skins = new Map((await Promise.all(roles.flatMap((r) => r.membri).map(async (m) => [m.nick, await getSkin(m.nick)] as const))));
  let i = 0;

  return (
    <>
      <ForumHero art="staff" kicker="tiberiusmc · staff" title="Staff" lead="Chi gestisce TiberiusMC e risponde alle vostre richieste, in game, sul forum e su Discord." />
      {roles.length === 0 ? (
        <Soon title="elenco staff" text="L'elenco ufficiale dello staff sarà pubblicato qui, con i ruoli reali." />
      ) : (
        roles.map((r, ri) => (
          <section key={r.ruolo} className={`wrap ${ri === 0 ? "pt-12 md:pt-16" : "pt-4"} pb-10`} aria-labelledby={`ruolo-${r.ruolo}`}>
            <h2 id={`ruolo-${r.ruolo}`} className="mb-8 text-center text-[length:var(--step-head)]">
              <Words text={r.ruolo} />
            </h2>
            <ul className="flex flex-wrap justify-center gap-5" data-stagger="0.08">
              {r.membri.map((m) => {
                const base = skins.get(m.nick)!;
                const skin = m.slim === undefined ? base : { ...base, slim: m.slim };
                return (
                  <li key={m.nick} className="group panel flex w-full flex-col items-center overflow-hidden text-center sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-3.75rem)/4)]">
                    <div className="relative grid w-full place-items-center bg-[radial-gradient(ellipse_at_50%_85%,rgba(226,55,43,.28),transparent_65%)] pt-4">
                      <SkinFigure skin={skin} pose={m.posa ?? i++} />
                      <span className="absolute bottom-2 h-5 w-28 rounded-[50%] bg-[radial-gradient(closest-side,rgb(0_0_0/0.5),transparent)]" aria-hidden />
                    </div>
                    <div className="grid w-full gap-1.5 border-t border-white/10 px-5 py-5">
                      <p className="text-lg font-semibold">{skin.name}</p>
                      <p className="font-badge mx-auto w-fit rounded-full bg-accent/15 px-3 py-1 text-xs uppercase tracking-wider text-[#ff8a80] ring-1 ring-accent/30">{r.ruolo}</p>
                      {m.descrizione && <p className="mt-1 text-sm text-white/65">{m.descrizione}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
      <PauseOffscreen />
      <DiscordBand />
    </>
  );
}
