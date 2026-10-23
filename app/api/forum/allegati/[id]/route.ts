import { NextResponse } from "next/server";
import { handle, requireSession } from "@/lib/server/http";
import { attachmentForDownload } from "@/lib/server/tickets";
import { signedUrl } from "@/lib/server/storage";

/** Scarica un allegato: controlla i permessi, poi reindirizza a un link firmato valido 60 secondi. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const session = await requireSession();
    const { id } = await ctx.params;
    const a = await attachmentForDownload(session, id);
    const url = await signedUrl(a.storage_path);
    return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  });
}
