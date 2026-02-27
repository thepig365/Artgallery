import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

function normalizeImageUrl(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/")) return v;
  return `/api/storage/${v.replace(/^\/+/, "")}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const { id } = await params;

    const submission = await prisma.artistSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission.status !== "RECEIVED" && submission.status !== "UNDER_REVIEW") {
      return NextResponse.json(
        { error: `Cannot approve submission with status: ${submission.status}` },
        { status: 422 }
      );
    }

    const evidenceFiles = (submission.evidenceFiles as Array<{ path?: string }> | null) ?? [];
    const firstImagePath = evidenceFiles.find((f) => f.path?.trim())?.path?.trim();
    let imageUrl: string | null = firstImagePath
      ? `/api/storage/${firstImagePath}`
      : null;

    if (!imageUrl) {
      const body = await request.json().catch(() => ({}));
      const pasted = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
      if (pasted) {
        imageUrl = normalizeImageUrl(pasted);
      }
      if (!imageUrl) {
        return NextResponse.json(
          { error: "Image required to approve", code: "IMAGE_REQUIRED" },
          { status: 400 }
        );
      }
    }

    const baseSlug = slugify(submission.workTitle);
    const uniqueSuffix = submission.id.slice(0, 8);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    let artist = await prisma.artist.findFirst({
      where: submission.artistName
        ? { name: { equals: submission.artistName, mode: "insensitive" } }
        : { slug: "unknown-artist" },
    });

    if (!artist) {
      const artistName = submission.artistName || "Unknown Artist";
      const artistSlug = slugify(artistName) + "-" + Date.now().toString(36);
      artist = await prisma.artist.create({
        data: { name: artistName, slug: artistSlug },
      });
    }

    const [artwork] = await prisma.$transaction([
      prisma.artwork.create({
        data: {
          title: submission.workTitle,
          slug,
          medium: submission.medium,
          year: submission.year,
          dimensions: submission.dimensions,
          materials: submission.materials?.join(", ") || null,
          narrative: submission.narrative,
          imageUrl,
          artistId: artist.id,
          isVisible: true,
          ownerAuthUid: submission.submitterAuthUid,
        },
      }),
      prisma.artistSubmission.update({
        where: { id },
        data: { status: "APPROVED" },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      artworkId: artwork.id,
      slug: artwork.slug,
      submissionStatus: "APPROVED",
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[POST /api/admin/submissions/[id]/approve]", err);
    return NextResponse.json(
      { error: "Failed to approve submission" },
      { status: 500 }
    );
  }
}
