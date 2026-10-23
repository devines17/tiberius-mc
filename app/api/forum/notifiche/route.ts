import { assertSameOrigin, handle, json, readJson, requireSession } from "@/lib/server/http";
import { markNotificationsRead, notificationsFor } from "@/lib/server/tickets";

export async function GET() {
  return handle(async () => {
    const session = await requireSession();
    return json({ notifiche: await notificationsFor(session, 30) });
  });
}

/** Segna come lette: { ids: [...] } oppure { tutte: true }. */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    const session = await requireSession();
    const body = await readJson(req, 16 * 1024);
    await markNotificationsRead(session, body.tutte ? "all" : Array.isArray(body.ids) ? body.ids.map(String).slice(0, 100) : []);
    return json({ ok: true });
  });
}
