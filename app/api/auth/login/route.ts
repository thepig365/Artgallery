import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { safeRedirect } from "@/lib/auth/redirect";
import { authDebug } from "@/lib/auth/debug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const redirectTo = safeRedirect(
      typeof body?.redirect === "string" ? body.redirect : null
    );

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const response = NextResponse.json(
      { ok: true, redirectTo },
      { headers: { "Cache-Control": "no-store" } }
    );

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
              });
              response.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
              });
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      authDebug("login_api", {
        decision: "deny",
        reason: "sign_in_failed",
        redirectTo,
      });
      return NextResponse.json(
        { error: error.message },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    authDebug("login_api", {
      decision: "allow",
      reason: "sign_in_success",
      redirectTo,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
}
