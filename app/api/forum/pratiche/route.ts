import { assertSameOrigin, handle, HttpError, json, requireSession } from "@/lib/server/http";
import { createTicket } from "@/lib/server/tickets";

/** Nuova pratica (multipart: sub, title, body, fields JSON, draft, file). */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    const session = await requireSession();
    const form = await req.formData().catch(() => null);
    if (!form) throw new HttpError(400, "Richiesta non valida.");
    let fields: unknown = {};
    try {
      fields = JSON.parse(String(form.get("fields") ?? "{}"));
    } catch {
      throw new HttpError(400, "Richiesta non valida.");
    }
    const ticket = await createTicket(
      session,
      String(form.get("sub") ?? ""),
      { title: form.get("title"), body: form.get("body"), fields, draft: form.get("draft") === "1" },
      form.getAll("file").filter((f): f is File => f instanceof File),
    );
    return json({ number: ticket.number }, 201);
  });
}
