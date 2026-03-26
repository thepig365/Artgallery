import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db/client";
import { generatePassportId } from "@/lib/passport/id";

// ── Validation schema ──────────────────────────────────────────────
const schema = z.object({
  // Host
  hostName:       z.string().trim().min(2).max(120),
  hostEmail:      z.string().trim().email().max(200),
  hostMobile:     z.string().trim().min(6).max(30),
  hostRegion:     z.string().trim().min(2).max(120),
  hostType:       z.enum(["COLLECTOR", "HOMEOWNER", "STYLIST", "DESIGNER", "OTHER"]),
  visibilityPref: z.enum(["PRIVATE_ONLY", "BY_REQUEST", "BY_INTRODUCTION", "HIDDEN"]),

  // Artwork
  artworkTitle:    z.string().trim().min(1).max(200),
  artistName:      z.string().trim().min(1).max(200),
  artworkYear:     z.number().int().min(1000).max(new Date().getFullYear()).nullable().optional(),
  medium:          z.string().trim().min(1).max(200),
  dimensions:      z.string().trim().min(1).max(200),
  ownershipStatus: z.string().trim().min(1).max(200),
  artworkType:     z.enum(["ORIGINAL", "EDITION", "DIGITAL_PRINT", "REPRODUCTION"]),
  significance:    z.string().trim().min(10).max(2000),
  viewingRequested: z.boolean(),
  // Host opt-in for the Works for Private Walls programme.
  // Does NOT automatically publish — Bayview admin must still publish explicitly.
  hostPublicOptIn: z.boolean().default(false),

  // Image — required. Must be a valid storage path from /api/passport/upload.
  mainImagePath: z.string().trim().min(1),

  // Honeypot — must be absent or empty
  website: z.string().optional(),
});

// ── Rate limiting: 3 registrations per 10 minutes per IP ──────────
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Rate limit ──────────────────────────────────────────────────
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  // ── Parse body ──────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // ── Validate ────────────────────────────────────────────────────
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        issues: parsed.error.issues.map((i) => ({
          path: i.path,
          message: i.message,
        })),
      },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // ── Honeypot ────────────────────────────────────────────────────
  if (data.website && data.website.trim().length > 0) {
    // Accept silently — do not persist.
    return NextResponse.json(
      { ok: true, shareToken: randomUUID(), passportId: "PP-00000000-XXXXXX" },
      { status: 201 }
    );
  }

  // ── Hard-require main image ─────────────────────────────────────
  // mainImagePath is validated non-empty by the schema above, but we
  // also reject server-side here for clarity.
  if (!data.mainImagePath) {
    return NextResponse.json(
      {
        error:
          "A main artwork image is required to generate a Preliminary Passport.",
      },
      { status: 400 }
    );
  }

  // ── Persist ─────────────────────────────────────────────────────
  try {
    const passportId  = await generatePassportId();
    const shareToken  = randomUUID();

    await prisma.hostPassport.create({
      data: {
        passportId,
        shareToken,
        status:          "PRELIMINARY",
        hostName:        data.hostName,
        hostEmail:       data.hostEmail,
        hostMobile:      data.hostMobile,
        hostRegion:      data.hostRegion,
        hostType:        data.hostType,
        visibilityPref:  data.visibilityPref,
        artworkTitle:    data.artworkTitle,
        artistName:      data.artistName,
        artworkYear:     data.artworkYear ?? null,
        medium:          data.medium,
        dimensions:      data.dimensions,
        ownershipStatus: data.ownershipStatus,
        artworkType:     data.artworkType,
        significance:    data.significance,
        viewingRequested: data.viewingRequested,
        hostPublicOptIn: data.hostPublicOptIn,
        mainImagePath:   data.mainImagePath,
      },
    });

    return NextResponse.json({ ok: true, shareToken, passportId }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/passport/register]", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
