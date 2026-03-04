import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { Prisma } from "@prisma/client";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Check which DB env vars are present (without exposing values)
function getPresentEnvKeys(): string[] {
  const keys = ["DATABASE_URL", "DIRECT_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL"];
  return keys.filter((k) => !!process.env[k]);
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-diag-secret");
  const envSecret = process.env.DIAG_SECRET;

  if (!envSecret || secret !== envSecret) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    // Get row counts
    const artworksCount = await prisma.artwork.count();
    const visibleArtworksCount = await prisma.artwork.count({
      where: { isVisible: true },
    });
    const artistsCount = await prisma.artist.count();

    // Check masterpieces table exists
    let masterpiecesTableExists = false;
    try {
      await prisma.masterpiece.count();
      masterpiecesTableExists = true;
    } catch {
      masterpiecesTableExists = false;
    }

    // Get latest 10 artwork slugs
    const latestArtworks = await prisma.artwork.findMany({
      select: { slug: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(
      {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        presentEnvKeys: getPresentEnvKeys(),
        counts: {
          artworks: artworksCount,
          visibleArtworks: visibleArtworksCount,
          artists: artistsCount,
          masterpiecesTableExists,
        },
        latestSlugs: latestArtworks.map((a) => a.slug),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    let prismaCode: string | undefined;
    let message = "Unknown error";
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaCode = error.code;
      message = `Prisma error ${error.code}`;
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      prismaCode = "INIT_ERROR";
      message = "Database connection initialization failed";
    } else if (error instanceof Error) {
      message = error.message.slice(0, 100);
    }

    return NextResponse.json(
      {
        error: "Database query failed",
        prismaCode,
        message,
        presentEnvKeys: getPresentEnvKeys(),
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
