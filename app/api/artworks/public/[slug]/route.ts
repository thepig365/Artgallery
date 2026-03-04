import { NextResponse } from "next/server";
import { getPublicArtworkBySlug } from "@/lib/services/public-artworks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const artwork = await getPublicArtworkBySlug(slug);
    if (!artwork) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(artwork, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(`[GET /api/artworks/public/${slug}] Error`, error);
    return NextResponse.json(
      { error: "DB connection/query failed" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
