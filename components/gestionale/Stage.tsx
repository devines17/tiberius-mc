import Link from "next/link";
import { Castle, Crown, Flag, Link2 } from "lucide-react";
import { forumContext } from "@/components/forum/session";
import { SkinFigure } from "@/components/staff/SkinFigure";
import { ServerStatus } from "@/components/ui/ServerStatus";
import { getSkin } from "@/lib/skins";
import { STAFF } from "@/lib/staff";
import { loadPlayer } from "@/lib/server/player";
import { greeting } from "@/lib/gestionale/data";
import { siteConfig } from "@/lib/site-config";
import { Parallax, Spin } from "./motion";

/** Monete che fluttuano nella testata: posizione, grandezza, ritardo, profondità. */
const COINS = [
  { x: 8, y: 22, s: 34, d: 0, z: 1 },
  { x: 22, y: 70, s: 22, d: 1.8, z: 0.5 },
  { x: 47, y: 14, s: 18, d: 0.9, z: 0.4 },
  { x: 63, y: 76, s: 28, d: 2.6, z: 0.8 },
  { x: 78, y: 20, s: 40, d: 1.2, z: 1.2 },
  { x: 90, y: 62, s: 24, d: 3.1, z: 0.6 },
  { x: 36, y: 40, s: 14, d: 2.2, z: 0.3 },
];

/** Testata del gestionale: la Roma al tramonto, il tuo personaggio in 3D sul piedistallo e il saluto. */
export async function Stage() {
  const { session } = await forumContext().catch(() => ({ session: null }));
  const player = session ? await loadPlayer(session) : null;
  // Account non ancora collegato: per chi è nell'elenco dello staff si mostra già la skin del suo nick (solo l'aspetto, nessun dato)
  const listed = !player?.mc && player ? STAFF.flatMap((r) => r.membri).find((m) => m.nick.toLowerCase() === player.name.toLowerCase()) : undefined;
  const base = await getSkin(player?.mc ?? listed?.nick ?? "MHF_Steve");
  const skin = listed?.slim === undefined ? base : { ...base, slim: listed.slim };
  const d = player?.data;
  const name = player ? (player.mc ?? player.name) : "viandante";
  const chips = [
    d?.town && { icon: Castle, text: d.town.name },
    d?.town?.role && { icon: Crown, text: d.town.role },
    d?.nation && { icon: Flag, text: d.nation.name },
  ].filter(Boolean) as { icon: typeof Castle; text: string }[];

  return (
    <Parallax className="gx-stage">
      <div className="gx-sky" aria-hidden />
      <div className="gx-sun" aria-hidden />
      <div className="gx-coins" aria-hidden>
        {COINS.map((c, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src="/images/goldone-loader.webp"
            alt=""
            width={c.s}
            height={c.s}
            className="gx-coin"
            style={{ left: `${c.x}%`, top: `${c.y}%`, width: c.s, animationDelay: `${-c.d}s`, ["--z" as string]: c.z, filter: c.z < 0.6 ? "blur(1.5px)" : undefined, opacity: c.z < 0.6 ? 0.55 : 0.95 }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto grid max-w-[72rem] items-end gap-4 px-6 pt-10 md:grid-cols-[auto_minmax(0,1fr)] md:gap-12 md:px-12 md:pt-14">
        <div className="gx-hero-figure order-2 mx-auto md:order-1">
          <Spin>
            <SkinFigure skin={skin} pose="saluta" dance={null} />
          </Spin>
          <div className="gx-pedestal" aria-hidden>
            <span className="gx-pedestal-ring" />
          </div>
        </div>

        <div className="order-1 pb-2 text-center md:order-2 md:pb-16 md:text-left">
          <p className="gx-in text-[0.8rem] font-bold uppercase tracking-[0.3em] text-white/70" style={{ ["--i" as string]: 0 }}>
            {greeting()}
          </p>
          <div className="gx-in" style={{ ["--i" as string]: 1 }}>
            <h1 className="gx-name">{name}</h1>
          </div>
          <div className="gx-in mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start" style={{ ["--i" as string]: 2 }}>
            {chips.map(({ icon: Icon, text }) => (
              <span key={text} className="gx-badge">
                <Icon className="size-3.5 text-gold" aria-hidden />
                {text}
              </span>
            ))}
            {player && !player.linked && (
              <Link href="/forum/account?next=/portale" className="gx-badge gx-badge-cta">
                <Link2 className="size-3.5" aria-hidden />
                Collega il tuo account Minecraft
              </Link>
            )}
            <ServerStatus host={siteConfig.server.ip} className="gx-badge !gap-2 !px-3 !py-1.5 !text-[0.78rem]" />
          </div>
        </div>
      </div>
      <div className="merli relative z-10 [--merli:#0b0a0c]" aria-hidden />
    </Parallax>
  );
}

export function StageSkeleton() {
  return (
    <div className="gx-stage">
      <div className="gx-sky" aria-hidden />
      <div className="h-[22rem]" />
      <div className="merli relative z-10 [--merli:#0b0a0c]" aria-hidden />
    </div>
  );
}
