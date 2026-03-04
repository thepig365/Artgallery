import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-diag-secret");
  const envSecret = process.env.DIAG_SECRET;

  if (!envSecret || secret !== envSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get database identity
    const dbIdentity = await prisma.$queryRaw<
      { db: string; user: string; host: string; port: number; ts: Date }[]
    >`
      SELECT 
        current_database() as db,
        current_user as user,
        inet_server_addr()::text as host,
        inet_server_port() as port,
        now() as ts
    `;

    // Get row counts
    const artworksCount = await prisma.artwork.count();
    const visibleArtworksCount = await prisma.artwork.count({
      where: { isVisible: true },
    });
    const artistsCount = await prisma.artist.count();

    // Get latest 10 artworks
    const latestArtworks = await prisma.artwork.findMany({
      select: {
        slug: true,
        title: true,
        isVisible: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Check masterpieces table
    let masterpiecesCount = 0;
    try {
      masterpiecesCount = await prisma.masterpiece.count();
    } catch {
      masterpiecesCount = -1; // Table doesn't exist
    }

    return NextResponse.json({
      dbIdentity: dbIdentity[0] || null,
      counts: {
        artworks: artworksCount,
        visibleArtworks: visibleArtworksCount,
        artists: artistsCount,
        masterpieces: masterpiecesCount,
      },
      latestArtworks,
      env: {
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        DIRECT_URL_SET: !!process.env.DIRECT_URL,
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Database query failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
