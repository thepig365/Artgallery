import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const PASSPORT_BUCKET = "passport-records";

/**
 * Signed URL TTL — 1 hour.
 * The record page is a server component that renders fresh on each request,
 * so a 1-hour window is sufficient. Signed URLs are never stored or reused.
 */
export const SIGNED_URL_TTL = 60 * 60;

/**
 * Build the Supabase Storage object path for a passport image upload.
 *
 * Path convention:  pending/{uploadId}/{slot}.{ext}
 *
 * The `pending/` prefix is intentional. Files uploaded here may become
 * orphans if the user abandons the registration form after uploading an
 * image but before completing submission. A future cleanup job can:
 *   1. List all objects under `pending/` in this bucket.
 *   2. Cross-reference each path against host_passports.main_image_path
 *      (and detail/in_room/back columns).
 *   3. Delete any paths that have no corresponding DB row AND were created
 *      more than a configured retention window ago (e.g. 48 h).
 */
export function buildStoragePath(
  uploadId: string,
  slot: "main" | "detail" | "in_room" | "back",
  ext: string
): string {
  return `pending/${uploadId}/${slot}.${ext}`;
}

/**
 * Upload a passport image buffer to the private `passport-records` bucket.
 * Uses the service-role admin client — no user auth required.
 * Throws on any upload failure; callers must propagate the error.
 */
export async function uploadPassportImage(
  storagePath: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(PASSPORT_BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: false });

  if (error) {
    throw new Error(`Passport image upload failed: ${error.message}`);
  }
}

/**
 * Generate a fresh signed URL for a passport image stored in the
 * private `passport-records` bucket. Server-side only.
 *
 * Returns null if signing fails — callers should render a placeholder.
 */
export async function getPassportImageUrl(
  storagePath: string
): Promise<string | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from(PASSPORT_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_TTL);

    if (error || !data?.signedUrl) {
      console.error("[passport/storage] Signed URL error:", error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("[passport/storage] Exception:", err);
    return null;
  }
}
