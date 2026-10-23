import { getSession, displayName } from "@/lib/server/auth";
import { dbConfigured, db } from "@/lib/server/db";
import { handle, json } from "@/lib/server/http";
import { isStaff } from "@/lib/forum/rules";

/** Stato del login per la barra in alto: nome, staff sì/no, notifiche non lette. */
export async function GET() {
  return handle(async () => {
    if (!dbConfigured()) return json({ user: null });
    const s = await getSession();
    if (!s) return json({ user: null });
    const unread = await db.count("notifications", { profile_id: `eq.${s.profile.id}`, read_at: "is.null" });
    return json({
      user: { name: displayName(s.profile), mcVerified: Boolean(s.profile.mc_uuid), staff: isStaff(s.viewer), unread },
    });
  });
}
