import type { SessionUser } from "./roles";

const EMERGENCY_ADMIN_EMAIL_ALLOWLIST = new Set(
  ["thepig365@gmail.com"].map((v) => v.toLowerCase())
);

/**
 * Resolve the authenticated user from the Supabase session cookie.
 *
 * Flow:
 *   1. Create server-side Supabase client (reads auth cookie)
 *   2. Validate JWT via supabase.auth.getUser()
 *   3. Look up assessor_users by auth_uid (source of truth)
 *   4. Return SessionUser if active, otherwise null
 *
 * Fail-closed: returns null on any error (missing cookie, invalid JWT,
 * no DB row, deactivated user, env not configured, test environment).
 */
export async function resolveSessionUser(): Promise<SessionUser | null> {
  try {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const { prisma } = await import("@/lib/db/client");

    const assessor = await prisma.assessorUser.findUnique({
      where: { authUid: user.id },
    });

    if (!assessor || !assessor.isActive) {
      const normalizedEmail = (user.email ?? "").toLowerCase();
      if (EMERGENCY_ADMIN_EMAIL_ALLOWLIST.has(normalizedEmail)) {
        return {
          id: `allowlist-${user.id}`,
          authUid: user.id,
          role: "ADMIN",
          isActive: true,
        };
      }
      return null;
    }

    return {
      id: assessor.id,
      authUid: user.id,
      role: assessor.role as SessionUser["role"],
      isActive: assessor.isActive,
    };
  } catch {
    return null;
  }
}

/**
 * Lightweight auth check — returns the Supabase auth user without requiring
 * a matching assessor_users row. Used for public-facing features like
 * ownership claims where any authenticated user can participate.
 *
 * Returns { authUid, email } or null.
 */
export async function resolveAuthUser(): Promise<{
  authUid: string;
  email: string | undefined;
} | null> {
  try {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    return { authUid: user.id, email: user.email };
  } catch {
    return null;
  }
}

/**
 * Check if the auth system is configured (env vars present).
 */
export function isAuthConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
