import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { uploadPassportImage, buildStoragePath } from "@/lib/passport/storage";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/tiff",
] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ── Rate limiting: 5 uploads per 5 minutes per IP ──────────────────
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ipLog = new Map<string, number[]>();

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const prev = ipLog.get(ip) ?? [];
  const fresh = prev.filter((ts) => ts > cutoff);
  if (fresh.length >= RATE_LIMIT_MAX) {
    ipLog.set(ip, fresh);
    return true;
  }
  fresh.push(now);
  ipLog.set(ip, fresh);
  return false;
}

function extFromMime(mime: AllowedMimeType): string {
  const map: Record<AllowedMimeType, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/tiff": "tiff",
  };
  return map[mime];
}

const VALID_SLOTS = ["main", "detail", "in_room", "back"] as const;
type Slot = (typeof VALID_SLOTS)[number];

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Rate limit ──────────────────────────────────────────────────
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  // ── Parse multipart form ────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  const rawSlot = (formData.get("slot") ?? "main") as string;
  const slot: Slot = VALID_SLOTS.includes(rawSlot as Slot)
    ? (rawSlot as Slot)
    : "main";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // ── Server-side MIME validation ─────────────────────────────────
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json(
      {
        error: `Unsupported file type: ${file.type}. Accepted: JPEG, PNG, WebP, TIFF.`,
      },
      { status: 400 }
    );
  }

  // ── Server-side size validation ─────────────────────────────────
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File exceeds the 10 MB limit." },
      { status: 400 }
    );
  }

  // ── Upload to private Supabase Storage bucket ───────────────────
  const uploadId = randomUUID();
  const ext = extFromMime(file.type as AllowedMimeType);
  const storagePath = buildStoragePath(uploadId, slot, ext);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadPassportImage(storagePath, buffer, file.type);

    return NextResponse.json(
      { ok: true, path: storagePath, uploadId },
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST /api/passport/upload]", err);
    const raw = err instanceof Error ? err.message : "Upload failed.";
    // Mask internal Supabase configuration details from the client.
    const safe = raw.includes("service role") || raw.includes("SUPABASE")
      ? "Storage is not configured. Please contact support."
      : raw;
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
