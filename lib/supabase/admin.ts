import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using service role key.
 * Bypasses RLS — use only in API routes for trusted server operations
 * (e.g. storage uploads on behalf of authenticated users).
 *
 * NEVER import this in client code.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
