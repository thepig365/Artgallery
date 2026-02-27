import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";

export async function GET(request: NextRequest) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const searchParams = request.nextUrl.searchParams;
    const ctaType = searchParams.get("ctaType");
    const status = searchParams.get("status");
    const artwork = searchParams.get("artwork");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: {
      ctaType?: string;
      status?: "NEW" | "IN_PROGRESS" | "CLOSED";
      createdAt?: { gte?: Date; lte?: Date };
      OR?: Array<{
        artworkId?: { equals: string };
        artworkSlug?: { contains: string; mode: "insensitive" };
        artwork?: { title: { contains: string; mode: "insensitive" } };
      }>;
    } = {};

    if (ctaType && ctaType !== "all") where.ctaType = ctaType;
    if (status && status !== "all" && ["NEW", "IN_PROGRESS", "CLOSED"].includes(status)) {
      where.status = status as "NEW" | "IN_PROGRESS" | "CLOSED";
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(`${to}T23:59:59.999Z`);
    }

    if (artwork && artwork.trim()) {
      const q = artwork.trim();
      where.OR = [
        { artworkId: { equals: q } },
        { artworkSlug: { contains: q, mode: "insensitive" } },
        { artwork: { title: { contains: q, mode: "insensitive" } } },
      ];
    }

    const enquiries = await prisma.enquiry.findMany({
      where,
      include: {
        artwork: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    return NextResponse.json(enquiries);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/admin/enquiries]", err);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
