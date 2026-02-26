// ─────────────────────────────────────────────────────────────
// Role guard helpers — Supabase-compatible role checking
// ─────────────────────────────────────────────────────────────

/**
 * Mirrors the Prisma UserRole enum.
 * Kept as a plain TS union so it can be used without Prisma client imports.
 */
export type Role = "ADMIN" | "ASSESSOR" | "ARTIST" | "VIEWER";

export interface SessionUser {
  id: string;
  authUid: string;
  role: Role;
  isActive: boolean;
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Assert that the user has one of the required roles.
 * Throws AuthorizationError if not.
 */
export function requireRole(user: SessionUser | null | undefined, ...roles: Role[]): void {
  if (!user) {
    throw new AuthorizationError("Authentication required");
  }
  if (!user.isActive) {
    throw new AuthorizationError("Account is deactivated");
  }
  if (!roles.includes(user.role)) {
    throw new AuthorizationError(
      `Insufficient permissions: requires ${roles.join(" | ")}, got ${user.role}`
    );
  }
}

/**
 * Non-throwing check — returns boolean.
 */
export function hasRole(user: SessionUser | null | undefined, ...roles: Role[]): boolean {
  if (!user || !user.isActive) return false;
  return roles.includes(user.role);
}

/**
 * Convenience: is the user an admin?
 */
export function isAdmin(user: SessionUser | null | undefined): boolean {
  return hasRole(user, "ADMIN");
}

/**
 * Convenience: can user submit scores? (ADMIN or ASSESSOR)
 */
export function canScore(user: SessionUser | null | undefined): boolean {
  return hasRole(user, "ADMIN", "ASSESSOR");
}

/**
 * Convenience: can user manage artwork visibility? (ADMIN only)
 */
export function canManageVisibility(user: SessionUser | null | undefined): boolean {
  return hasRole(user, "ADMIN");
}

// ─────────────────────────────────────────────────────────────
// Route guard helper (Next.js server action / API route pattern)
// ─────────────────────────────────────────────────────────────

/**
 * Wraps a server action with a role check.
 * Returns a new function that validates the session before proceeding.
 *
 * Usage:
 *   const protectedAction = withRoleGuard(["ADMIN"], async (user, input) => { ... });
 *
 * TODO: integrate with Supabase auth to resolve SessionUser from request
 */
export function withRoleGuard<TInput, TOutput>(
  roles: Role[],
  handler: (user: SessionUser, input: TInput) => Promise<TOutput>,
  resolveUser?: () => Promise<SessionUser | null>
) {
  return async (input: TInput): Promise<TOutput> => {
    // TODO: Replace with Supabase auth session resolution
    const user = resolveUser ? await resolveUser() : null;
    requireRole(user, ...roles);
    // At this point requireRole guarantees user is non-null
    return handler(user!, input);
  };
}
