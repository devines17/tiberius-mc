import { cacheLife } from "next/cache";

/** Skin di un giocatore, risolta tramite le API pubbliche di Mojang. */
export type Skin = {
  name: string;
  url: string;
  /** Modello "Alex" (braccia da 3 pixel). */
  slim: boolean;
  /** Vecchio formato 64x32: arti sinistri specchiati da quelli destri, niente strati esterni sul corpo. */
  legacy: boolean;
};

const NICK_RE = /^[A-Za-z0-9_]{3,16}$/;

/** Altezza di un PNG letta dall'intestazione (byte 20-23), senza librerie. */
function pngHeight(buf: ArrayBuffer): number | null {
  const b = new Uint8Array(buf);
  if (b.length < 24 || b[0] !== 0x89 || b[1] !== 0x50) return null;
  return ((b[20] << 24) | (b[21] << 16) | (b[22] << 8) | b[23]) >>> 0;
}

/**
 * Nickname → skin. Il risultato resta in cache per un giorno: una skin cambiata
 * compare entro 24 ore. Se Mojang non risponde si usa un servizio di riserva.
 */
export async function getSkin(name: string): Promise<Skin> {
  "use cache";
  cacheLife("days");
  const fallback: Skin = { name, url: `https://mc-heads.net/skin/${encodeURIComponent(name)}`, slim: false, legacy: false };
  if (!NICK_RE.test(name)) return fallback;
  try {
    const p = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`);
    if (!p.ok) return fallback;
    const { id, name: realName } = (await p.json()) as { id: string; name: string };
    const s = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${id}`);
    if (!s.ok) return { ...fallback, name: realName };
    const profile = (await s.json()) as { properties?: { name: string; value: string }[] };
    const raw = profile.properties?.find((x) => x.name === "textures")?.value;
    if (!raw) return { ...fallback, name: realName };
    const tex = JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as { textures?: { SKIN?: { url: string; metadata?: { model?: string } } } };
    const skin = tex.textures?.SKIN;
    if (!skin?.url) return { ...fallback, name: realName };
    const url = skin.url.replace(/^http:\/\//, "https://");
    const png = await fetch(url);
    const height = png.ok ? pngHeight(await png.arrayBuffer()) : null;
    return { name: realName, url, slim: skin.metadata?.model === "slim", legacy: height === 32 };
  } catch {
    return fallback;
  }
}
