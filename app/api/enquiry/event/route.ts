import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";

const eventSchema = z.object({
  eventType: z.enum(["CLICK"]),
  ctaType: z.enum(["enquire", "viewing", "price"]),
  artworkId: z.string().uuid().nullable().optional(),
  artworkSlug: z.string().trim().max(200).nullable().optional(),
  sourceUrl: z.string().trim().url().max(1000).nullable().optional(),
});

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 422 });
  }

  try {
    await prisma.ctaEvent.create({
      data: {
        eventType: parsed.data.eventType,
        ctaType: parsed.data.ctaType,
        artworkId: parsed.data.artworkId || null,
        artworkSlug: parsed.data.artworkSlug || null,
        sourceUrl: parsed.data.sourceUrl || null,
        userAgent: request.headers.get("user-agent") || null,
        ip: getClientIp(request),
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/enquiry/event] Unexpected error:", err);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
