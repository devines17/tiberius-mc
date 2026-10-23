import { getSession, type Session } from "@/lib/server/auth";
import { db, dbConfigured } from "@/lib/server/db";

/** Sessione + notifiche non lette, per le pagine del forum. */
export async function forumContext(): Promise<{ configured: boolean; session: Session | null; unread: number }> {
  if (!dbConfigured()) return { configured: false, session: null, unread: 0 };
  const session = await getSession();
  const unread = session ? await db.count("notifications", { profile_id: `eq.${session.profile.id}`, read_at: "is.null" }) : 0;
  return { configured: true, session, unread };
}
