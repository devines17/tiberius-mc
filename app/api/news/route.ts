import { revalidateTag } from "next/cache";
import { isOwner } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { assertSameOrigin, audit, handle, HttpError, json, rateLimit, requireSession } from "@/lib/server/http";
import { NEWS_TAG, type NewsRow, removeCover, uniqueSlug, uploadCover } from "@/lib/server/news";
import { isNewsCategory, NEWS_LIMITS } from "@/lib/news/config";

const ACTIONS = ["salva", "pubblica", "ritira", "elimina"] as const;
type Action = (typeof ACTIONS)[number];

function text(fd: FormData, name: string): string {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Crea, modifica, pubblica, ritira o elimina una news. Solo il Founder.
 * Dopo ogni modifica la cache delle pagine news si svuota subito.
 */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    const s = await requireSession();
    if (!isOwner(s.profile)) throw new HttpError(403, "Solo il Founder può pubblicare le news.");
    await rateLimit(`news:${s.profile.id}`, 60, 30);

    const fd = await req.formData();
    const action = text(fd, "action") as Action;
    if (!ACTIONS.includes(action)) throw new HttpError(400, "Azione non valida.");
    const id = text(fd, "id");
    if (id && !/^[0-9a-f-]{36}$/.test(id)) throw new HttpError(400, "News non valida.");
    const existing = id ? await db.one<NewsRow>("news", "*", { id: `eq.${id}` }) : null;
    if (id && !existing) throw new HttpError(404, "News non trovata.");

    const done = (row: Pick<NewsRow, "id" | "slug" | "published_at"> | null) => {
      revalidateTag(NEWS_TAG, { expire: 0 });
      return json({ ok: true, id: row?.id ?? null, slug: row?.slug ?? null, published: Boolean(row?.published_at) });
    };

    if (action === "elimina" || action === "ritira") {
      if (!existing) throw new HttpError(400, "News non valida.");
      if (action === "elimina") {
        await db.remove("news", { id: `eq.${existing.id}` });
        await removeCover(existing.cover_path);
        await audit(s.profile.id, "news_eliminata", { details: { titolo: existing.title } });
        return done(null);
      }
      const [row] = await db.update<NewsRow>("news", { id: `eq.${existing.id}` }, { published_at: null });
      await audit(s.profile.id, "news_ritirata", { details: { titolo: existing.title } });
      return done(row);
    }

    // salva / pubblica: controlla i campi
    const title = text(fd, "title");
    const summary = text(fd, "summary");
    const body = (typeof fd.get("body") === "string" ? (fd.get("body") as string) : "").replace(/\r\n?/g, "\n").trim();
    const category = text(fd, "category");
    const eventRaw = text(fd, "event_at");
    const errors: Record<string, string> = {};
    if (title.length < 3 || title.length > NEWS_LIMITS.title) errors.title = `Il titolo deve avere tra 3 e ${NEWS_LIMITS.title} caratteri.`;
    if (summary.length < 3 || summary.length > NEWS_LIMITS.summary) errors.summary = `Il riassunto deve avere tra 3 e ${NEWS_LIMITS.summary} caratteri.`;
    if (body.length > NEWS_LIMITS.body) errors.body = "Il testo è troppo lungo.";
    if (!isNewsCategory(category)) errors.category = "Scegli una categoria.";
    let eventAt: string | null = null;
    if (category === "evento" && eventRaw) {
      const d = new Date(eventRaw);
      if (Number.isNaN(d.getTime())) errors.event_at = "Data dell'evento non valida.";
      else eventAt = d.toISOString();
    }
    if (Object.keys(errors).length) throw new HttpError(400, "Controlla i campi evidenziati.", errors);

    let coverPath = existing?.cover_path ?? null;
    const cover = fd.get("cover");
    if (cover instanceof File && cover.size > 0) {
      const uploaded = await uploadCover(cover);
      await removeCover(coverPath);
      coverPath = uploaded;
    } else if (text(fd, "remove_cover") === "1") {
      await removeCover(coverPath);
      coverPath = null;
    }

    const publishedAt = action === "pubblica" ? (existing?.published_at ?? new Date().toISOString()) : (existing?.published_at ?? null);
    const fields = { title, summary, body, category, event_at: eventAt, cover_path: coverPath, published_at: publishedAt };

    let row: NewsRow;
    if (existing) {
      [row] = await db.update<NewsRow>("news", { id: `eq.${existing.id}` }, fields);
    } else {
      [row] = await db.insert<NewsRow>("news", { ...fields, slug: await uniqueSlug(title), author_id: s.profile.id });
    }
    await audit(s.profile.id, action === "pubblica" ? "news_pubblicata" : "news_salvata", { details: { titolo: title } });
    return done(row);
  });
}
