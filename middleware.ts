import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Middleware: Supabase session + BayviewHub → Gallery deep link unification.
 * - Browse-intent visits from parent site to gallery root → /archive
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/" && request.method === "GET") {
    const referer = request.headers.get("referer") ?? "";
    const isFromBayviewHub =
      referer.includes("bayviewhub.me") && !referer.includes("gallery.bayviewhub");

    if (isFromBayviewHub) {
      return NextResponse.redirect(new URL("/archive", request.url), 307);
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
