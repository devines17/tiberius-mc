/**
 * Sessioni del sito.
 *
 * Il login avviene con Discord; il sito crea un proprio token di sessione
 * casuale (32 byte), lo mette in un cookie HttpOnly/Secure/SameSite=Lax e
 * nel database ne salva solo l'hash SHA-256. Chi leggesse il database non
 * potrebbe quindi impersonare nessuno.
 */

import { cookies } from "next/headers";
import { cache } from "react";
import { createHash, randomBytes } from "node:crypto";
import { db, dbConfigured } from "./db";
import type { Profile } from "./types";
import type { PermissionKey } from "@/lib/forum/config";
import type { Viewer } from "@/lib/forum/rules";

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-tib_session" : "tib_session";
const SESSION_DAYS = 30;

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function createSession(profileId: string): Promise<{ token: string; maxAge: number }> {
  const token = randomToken();
  const maxAge = SESSION_DAYS * 24 * 3600;
  await db.insert("sessions", { token_hash: sha256(token), profile_id: profileId, expires_at: new Date(Date.now() + maxAge * 1000).toISOString() }, { returning: false });
  return { token, maxAge };
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  await db.remove("sessions", { token_hash: `eq.${sha256(token)}` });
}

/** Discord ID dei proprietari: ricevono "Amministrazione generale" anche prima che esista uno staff. */
function ownerIds(): Set<string> {
  return new Set((process.env.FORUM_OWNER_DISCORD_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean));
}

export type Session = { profile: Profile; viewer: Viewer };

/** Utente della richiesta corrente (una sola lettura per richiesta grazie a cache()). */
export const getSession = cache(async (): Promise<Session | null> => {
  if (!dbConfigured()) return null;
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const row = await db.one<{ profile_id: string; expires_at: string; profiles: Profile }>("sessions", "profile_id,expires_at,profiles(*)", {
    token_hash: `eq.${sha256(token)}`,
    expires_at: `gt.${new Date().toISOString()}`,
  });
  if (!row?.profiles) return null;
  const perms = await db.select<{ permission: PermissionKey }>("staff_permissions", "permission", { profile_id: `eq.${row.profile_id}` });
  const set = new Set<PermissionKey>(perms.map((p) => p.permission));
  if (ownerIds().has(row.profiles.discord_id)) set.add("admin");
  return { profile: row.profiles, viewer: { profileId: row.profile_id, permissions: set } };
});

/** Nome da mostrare: il nickname Minecraft verificato, altrimenti il nome Discord. */
export function displayName(p: Pick<Profile, "mc_name" | "discord_username">): string {
  return p.mc_name ?? p.discord_username;
}
