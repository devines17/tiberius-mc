import { NextResponse } from "next/server";
import { randomToken } from "@/lib/server/auth";
import { safeNext } from "@/lib/forum/rules";

/** Avvia il login con Discord: genera lo "state" anti-CSRF e reindirizza a Discord. */
export async function GET(req: Request) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const url = new URL(req.url);
  if (!clientId) return NextResponse.redirect(new URL("/forum?errore=configurazione", url), 303);

  const next = safeNext(url.searchParams.get("next"));
  const state = randomToken(24);
  const redirectUri = process.env.DISCORD_REDIRECT_URI ?? `${url.origin}/api/auth/discord/callback`;

  const authorize = new URL("https://discord.com/oauth2/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", "identify");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("prompt", "none");

  const res = NextResponse.redirect(authorize, 303);
  res.cookies.set("tib_oauth", JSON.stringify({ state, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/discord",
    maxAge: 600,
  });
  return res;
}
