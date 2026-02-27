import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "artist-submissions-evidence";
const SIGNED_URL_EXPIRY = 3600; // 1 hour
const ENABLE_LEGACY_STORAGE_PROXY =
  process.env.ENABLE_LEGACY_STORAGE_PROXY === "true";

/**
 * GET /api/storage/<storagePath>
 *
 * Proxies private Supabase Storage files by generating a short-lived signed URL
 * and redirecting the browser to it. This keeps the service-role key server-side.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!ENABLE_LEGACY_STORAGE_PROXY) {
    return new NextResponse(
      JSON.stringify({ error: "Legacy storage proxy is disabled" }),
      {
        status: 410,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
      }
    );
  }

  const { path: segments } = await params;
  const storagePath = segments
    .map((s) => decodeURIComponent(s))
    .join("/");

  if (!storagePath || storagePath.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY);

    if (error || !data?.signedUrl) {
      console.error("[GET /api/storage] Signed URL error:", error);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.redirect(data.signedUrl, 302);
  } catch (err) {
    console.error("[GET /api/storage] Error:", err);
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }
}
