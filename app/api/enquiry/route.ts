import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { notifyAdminNewEnquiry } from "@/lib/email/notify-admin";

const enquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(60).nullable().optional(),
  message: z.string().trim().min(5).max(4000),
  ctaType: z.enum(["enquire", "viewing", "price"]),
  artworkId: z.string().uuid().nullable().optional(),
  artworkSlug: z.string().trim().max(200).nullable().optional(),
  sourceUrl: z.string().trim().url().max(1000).nullable().optional(),
  website: z.string().optional(), // honeypot
});

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ipRequestLog = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const prev = ipRequestLog.get(ip) ?? [];
  const fresh = prev.filter((ts) => ts > cutoff);
  if (fresh.length >= RATE_LIMIT_MAX) {
    ipRequestLog.set(ip, fresh);
    return true;
  }
  fresh.push(now);
  ipRequestLog.set(ip, fresh);
  return false;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({
          path: i.path,
          message: i.message,
        })),
      },
      { status: 422 }
    );
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  // Honeypot: silently accept bot submissions but do not store.
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  try {
    const userAgent = request.headers.get("user-agent") || null;
    const enquiry = await prisma.enquiry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
        ctaType: parsed.data.ctaType,
        artworkId: parsed.data.artworkId || null,
        artworkSlug: parsed.data.artworkSlug || null,
        sourceUrl: parsed.data.sourceUrl || null,
        userAgent,
        ip,
        events: {
          create: {
            eventType: "SUBMIT_SUCCESS",
            ctaType: parsed.data.ctaType,
            artworkId: parsed.data.artworkId || null,
            artworkSlug: parsed.data.artworkSlug || null,
            sourceUrl: parsed.data.sourceUrl || null,
            userAgent,
            ip,
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        ctaType: true,
        name: true,
        email: true,
        artworkSlug: true,
        sourceUrl: true,
        artwork: { select: { title: true } },
      },
    });

    notifyAdminNewEnquiry({
      enquiryId: enquiry.id,
      ctaType: enquiry.ctaType,
      name: enquiry.name,
      email: enquiry.email,
      artworkTitle: enquiry.artwork?.title ?? null,
      artworkSlug: enquiry.artworkSlug,
      sourceUrl: enquiry.sourceUrl,
      createdAt: enquiry.createdAt.toISOString(),
    }).catch((err) => console.error("[notifyAdminNewEnquiry]", err));

    return NextResponse.json({ ok: true, enquiry }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/enquiry] Unexpected error:", err);
    return NextResponse.json(
      { error: "Service unavailable — please try again." },
      { status: 503 }
    );
  }
}
