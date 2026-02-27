import { NextRequest, NextResponse } from "next/server";
import { resolveAuthUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "artist-submissions-evidence";
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 200);
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await resolveAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "Empty file" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds ${MAX_SIZE_BYTES / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const safeName = sanitizeFileName(file.name);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const storagePath = `intake/${authUser.authUid}/${yyyy}/${mm}/${uniqueSuffix}/${safeName}`;

    const supabase = createSupabaseAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[POST /api/submissions/upload] Storage error:", uploadError);
      const msg =
        uploadError.message ||
        "Storage service error. Please check your connection and try again.";
      return NextResponse.json(
        { error: msg },
        { status: 500 }
      );
    }

    const descriptor = {
      id: uniqueSuffix,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      path: storagePath,
      uploadedAt: now.toISOString(),
    };

    return NextResponse.json({ ok: true, file: descriptor }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/submissions/upload]", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    const safeMessage =
      message.includes("SUPABASE") || message.includes("service role")
        ? "Storage is not configured. Please contact support."
        : message;
    return NextResponse.json(
      { error: safeMessage },
      { status: 500 }
    );
  }
}
