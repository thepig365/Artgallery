import { prisma } from "@/lib/db/client";

// Unambiguous charset — excludes 0/O and 1/I to avoid confusion when read aloud.
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return result;
}

/**
 * Generate a unique, concurrency-safe display Passport ID.
 *
 * Format: PP-YYYYMMDD-XXXXXX  (6-char random alphanumeric suffix)
 *
 * Uniqueness strategy: random code + DB lookup + retry loop.
 * This avoids sequential counters (which are not concurrency-safe without
 * a DB sequence or advisory lock). The @unique constraint on passportId
 * is the final safety net — a race-condition collision at DB write time
 * will surface as a Prisma unique constraint error, which the caller
 * should handle by retrying.
 */
export async function generatePassportId(): Promise<string> {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `PP-${date}-${randomCode(6)}`;
    const existing = await prisma.hostPassport.findUnique({
      where: { passportId: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }

  // Extremely unlikely fallback: extend to 10 chars if all 5 attempts collide.
  return `PP-${date}-${randomCode(10)}`;
}
