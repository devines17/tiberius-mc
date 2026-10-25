import { assertSameOrigin, handle, HttpError, json, requireSession } from "@/lib/server/http";
import {
  adminDeleteTicket,
  playerAction,
  playerReply,
  staffAssign,
  staffNote,
  staffPriority,
  staffReopen,
  staffReply,
  staffSetStatus,
  staffVerifyField,
  updateDraft,
} from "@/lib/server/tickets";

/**
 * Azioni su una pratica esistente (multipart, campo "azione").
 * Ogni azione ricontrolla i permessi lato server: il pulsante mostrato
 * nella pagina non conta, conta solo chi è la sessione.
 */
export async function POST(req: Request, ctx: { params: Promise<{ numero: string }> }) {
  return handle(async () => {
    assertSameOrigin(req);
    const session = await requireSession();
    const { numero } = await ctx.params;
    const number = Number(numero);
    if (!Number.isSafeInteger(number) || number <= 0) throw new HttpError(404, "Pratica non trovata.");

    const form = await req.formData().catch(() => null);
    if (!form) throw new HttpError(400, "Richiesta non valida.");
    const action = String(form.get("azione") ?? "");
    const files = form.getAll("file").filter((f): f is File => f instanceof File);

    switch (action) {
      case "rispondi":
        await playerReply(session, number, form.get("body"), files);
        break;
      case "ritira":
        await playerAction(session, number, "withdraw", form.get("motivo"));
        break;
      case "invia_bozza":
        await playerAction(session, number, "submit_draft", null);
        break;
      case "chiedi_riapertura":
        await playerAction(session, number, "request_reopen", form.get("motivo"));
        break;
      case "modifica_bozza": {
        let fields: unknown = {};
        try {
          fields = JSON.parse(String(form.get("fields") ?? "{}"));
        } catch {
          throw new HttpError(400, "Richiesta non valida.");
        }
        await updateDraft(session, number, { title: form.get("title"), body: form.get("body"), fields });
        break;
      }
      case "staff_rispondi":
        await staffReply(session, number, form.get("body"), form.get("stato"), files);
        break;
      case "staff_stato":
        await staffSetStatus(session, number, String(form.get("stato") ?? ""), form.get("motivo"));
        break;
      case "staff_riapri":
        await staffReopen(session, number, form.get("motivo"));
        break;
      case "staff_assegna":
        await staffAssign(session, number, form.get("assegnatario"));
        break;
      case "staff_priorita":
        await staffPriority(session, number, form.get("priorita"));
        break;
      case "staff_nota":
        await staffNote(session, number, form.get("body"), files);
        break;
      case "elimina":
        await adminDeleteTicket(session, number);
        break;
      case "staff_verifica":
        await staffVerifyField(session, number, String(form.get("campo") ?? ""));
        break;
      default:
        throw new HttpError(400, "Azione sconosciuta.");
    }
    return json({ ok: true });
  });
}
