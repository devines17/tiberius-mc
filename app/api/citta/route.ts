import { assertSameOrigin, handle, HttpError, json, requireSession } from "@/lib/server/http";
import {
  addPhoto,
  applyToTown,
  createPost,
  createProject,
  decideApplication,
  deletePost,
  deleteProject,
  leaveTown,
  registerTown,
  removeMember,
  removePhoto,
  reviewTown,
  setEmblem,
  setMemberRole,
  setProjectStatus,
  togglePin,
  updateItem,
  updateTown,
  withdrawApplication,
} from "@/lib/server/towns";

const ID = /^[0-9a-f-]{36}$/i;
const id = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v : "";
  if (!ID.test(s)) throw new HttpError(400, "Richiesta non valida.");
  return s;
};

/**
 * Tutte le azioni del gestionale (multipart, campo "azione").
 * I permessi li controlla lib/server/towns.ts per ogni azione.
 */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    const session = await requireSession();
    const f = await req.formData().catch(() => null);
    if (!f) throw new HttpError(400, "Richiesta non valida.");
    const file = (name: string) => {
      const v = f.get(name);
      if (!(v instanceof File) || !v.size) throw new HttpError(400, "Scegli un'immagine.");
      return v;
    };
    let redirect: string | undefined;
    switch (String(f.get("azione") ?? "")) {
      case "registra": {
        await registerTown(session, { name: f.get("name"), motto: f.get("motto"), description: f.get("description"), nation: f.get("nation") });
        break;
      }
      case "verifica":
        await reviewTown(session, id(f.get("town")), f.get("esito") === "approva", f.get("nota"));
        break;
      case "candidati":
        await applyToTown(session, id(f.get("town")), f.get("message"));
        break;
      case "ritira_candidatura":
        await withdrawApplication(session, id(f.get("id")));
        break;
      case "decidi_candidatura":
        await decideApplication(session, id(f.get("id")), f.get("esito") === "accetta");
        break;
      case "ruolo": {
        const role = String(f.get("role"));
        if (role !== "assistente" && role !== "cittadino") throw new HttpError(400, "Ruolo non valido.");
        await setMemberRole(session, id(f.get("profile")), role);
        break;
      }
      case "rimuovi":
        await removeMember(session, id(f.get("profile")));
        break;
      case "lascia":
        await leaveTown(session);
        redirect = "/portale";
        break;
      case "impostazioni":
        await updateTown(session, { motto: f.get("motto"), description: f.get("description"), nation: f.get("nation"), recruiting: f.get("recruiting") });
        break;
      case "stemma":
        await setEmblem(session, file("file"));
        break;
      case "foto":
        await addPhoto(session, file("file"));
        break;
      case "togli_foto":
        await removePhoto(session, String(f.get("path") ?? ""));
        break;
      case "scrivi":
        await createPost(session, f.get("body"), f.get("parent") ? id(f.get("parent")) : null, f.get("annuncio") === "1");
        break;
      case "elimina_post":
        await deletePost(session, id(f.get("id")));
        break;
      case "fissa":
        await togglePin(session, id(f.get("id")));
        break;
      case "nuovo_cantiere":
        await createProject(session, { title: f.get("title"), description: f.get("description"), location: f.get("location"), lead: f.get("lead"), items: f.get("items") });
        break;
      case "stato_cantiere":
        await setProjectStatus(session, id(f.get("id")), String(f.get("status") ?? ""));
        break;
      case "elimina_cantiere":
        await deleteProject(session, id(f.get("id")));
        break;
      case "materiale":
        await updateItem(session, id(f.get("id")), f.get("done"));
        break;
      default:
        throw new HttpError(400, "Azione sconosciuta.");
    }
    return json({ ok: true, redirect });
  });
}
