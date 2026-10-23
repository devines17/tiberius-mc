import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/auth";
import { db, dbConfigured } from "@/lib/server/db";
import { safeNext } from "@/lib/forum/rules";
import type { Profile } from "@/lib/server/types";

type DiscordUser = { id: string; username: string; global_name?: string | null; avatar?: string | null };

function fail(url: URL, reason: string) {
  const res = NextResponse.redirect(new URL(`/forum/accedi?errore=${reason}`, url), 303);
  res.cookies.delete({ name: "tib_oauth", path: "/api/auth/discord" });
  return res;
}

function sameState(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Ritorno da Discord: verifica lo state, ottiene l'utente, crea il profilo e la sessione. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret || !dbConfigured()) return fail(url, "configurazione");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (url.searchParams.get("error")) return fail(url, "annullato");

  let saved: { state?: string; next?: string } = {};
  try {
    saved = JSON.parse((await cookies()).get("tib_oauth")?.value ?? "{}");
  } catch {
    saved = {};
  }
  if (!code || !state || !saved.state || !sameState(state, saved.state)) return fail(url, "sessione");

  const redirectUri = process.env.DISCORD_REDIRECT_URI ?? `${url.origin}/api/auth/discord/callback`;

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", code, redirect_uri: redirectUri }),
      cache: "no-store",
    });
    if (!tokenRes.ok) return fail(url, "discord");
    const token = (await tokenRes.json()) as { access_token?: string; token_type?: string };
    if (!token.access_token) return fail(url, "discord");

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `${token.token_type ?? "Bearer"} ${token.access_token}` },
      cache: "no-store",
    });
    if (!userRes.ok) return fail(url, "discord");
    const user = (await userRes.json()) as DiscordUser;
    if (!user.id || !/^\d{5,25}$/.test(user.id)) return fail(url, "discord");

    const [profile] = await db.insert<Profile>(
      "profiles",
      {
        discord_id: user.id,
        discord_username: (user.global_name || user.username || "giocatore").slice(0, 64),
        discord_avatar: user.avatar ?? null,
        last_login_at: new Date().toISOString(),
      },
      { upsert: "discord_id" },
    );

    const session = await createSession(profile.id);
    const res = NextResponse.redirect(new URL(safeNext(saved.next), url), 303);
    res.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.maxAge));
    res.cookies.delete({ name: "tib_oauth", path: "/api/auth/discord" });
    return res;
  } catch (e) {
    console.error("[auth] callback", e);
    return fail(url, "errore");
  }
}
