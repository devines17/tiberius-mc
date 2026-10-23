import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession, SESSION_COOKIE } from "@/lib/server/auth";
import { assertSameOrigin, HttpError } from "@/lib/server/http";

/** Esce dal sito: cancella la sessione nel database e il cookie. */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
  } catch (e) {
    if (e instanceof HttpError) return new NextResponse(null, { status: 403 });
  }
  const jar = await cookies();
  try {
    await destroySession(jar.get(SESSION_COOKIE)?.value);
  } catch (e) {
    console.error("[auth] logout", e);
  }
  const res = NextResponse.redirect(new URL("/forum", req.url), 303);
  res.cookies.delete({ name: SESSION_COOKIE, path: "/" });
  return res;
}
