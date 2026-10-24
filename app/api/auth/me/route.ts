import { getSession, displayName, isOwner } from "@/lib/server/auth";
import { dbConfigured, db } from "@/lib/server/db";
import { handle, json } from "@/lib/server/http";
import { isStaff } from "@/lib/forum/rules";
import { STAFF } from "@/lib/staff";

/** Stato del login per la barra in alto: nome, staff sì/no, notifiche non lette. */
export async function GET() {
  return handle(async () => {
    if (!dbConfigured()) return json({ user: null });
    const s = await getSession();
    if (!s) return json({ user: null });
    const unread = await db.count("notifications", { profile_id: `eq.${s.profile.id}`, read_at: "is.null" });
    return json({
      user: { name: displayName(s.profile), mcVerified: Boolean(s.profile.mc_uuid), mcUuid: s.profile.mc_uuid ?? null, headName: headFor(displayName(s.profile)), staff: isStaff(s.viewer), owner: isOwner(s.profile), unread },
    });
  });
}

/** Senza account Minecraft collegato si vede Steve, tranne per lo staff in elenco: il nick è lo stesso del gioco. */
function headFor(name: string): string | null {
  const n = name.toLowerCase();
  return STAFF.flatMap((r) => r.membri).find((m) => m.nick.toLowerCase() === n)?.nick ?? null;
}
