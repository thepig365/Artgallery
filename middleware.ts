import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { authDebug } from "@/lib/auth/debug";

/**
 * Middleware: Supabase session + BayviewHub → Gallery deep link unification.
 * - Browse-intent visits from parent site to gallery root → /archive
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/login") {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    if (redirectParam?.startsWith("/login")) {
      authDebug("middleware", {
        pathname,
        search,
        decision: "redirect",
        reason: "sanitize_login_redirect",
      });
      return NextResponse.redirect(new URL("/login", request.url), 307);
    }
  }

  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/")
  ) {
    authDebug("middleware", {
      pathname,
      search,
      decision: "allow",
      reason: "whitelisted_auth_route",
    });
    const response = NextResponse.next({ request });
    response.headers.set("x-pathname", pathname);
    return response;
  }

  if (pathname === "/" && request.method === "GET") {
    const referer = request.headers.get("referer") ?? "";
    const isFromBayviewHub =
      referer.includes("bayviewhub.me") && !referer.includes("gallery.bayviewhub");

    if (isFromBayviewHub) {
      authDebug("middleware", {
        pathname,
        search,
        decision: "redirect",
        reason: "referer_deeplink_to_archive",
      });
      return NextResponse.redirect(new URL("/archive", request.url), 307);
    }
  }

  authDebug("middleware", {
    pathname,
    search,
    decision: "allow",
    reason: "update_session",
  });
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
