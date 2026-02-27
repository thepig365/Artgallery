import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeGalleryPublicPath } from "@/lib/supabase/gallery-public";

const PRIVATE_BUCKET = "artist-submissions-evidence";
const PUBLIC_BUCKET = "gallery-public";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_{2,}/g, "_");
}

function parseStorageReference(
  value: string
): { bucket: string; objectPath: string } | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/api/storage/")) {
    return {
      bucket: PRIVATE_BUCKET,
      objectPath: trimmed.replace(/^\/api\/storage\/+/, ""),
    };
  }

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    const normalized = normalizeGalleryPublicPath(trimmed);
    if (!normalized) return null;
    return { bucket: PUBLIC_BUCKET, objectPath: normalized };
  }

  try {
    const url = new URL(trimmed);
    const m = url.pathname.match(
      /\/storage\/v1\/object\/(sign|public)\/([^/]+)\/(.+)$/
    );
    if (!m) return null;
    return {
      bucket: decodeURIComponent(m[2]),
      objectPath: decodeURIComponent(m[3]),
    };
  } catch {
    return null;
  }
}

async function copyToPublicBucket(params: {
  sourceBucket: string;
  sourcePath: string;
  recordId: string;
}) {
  const { sourceBucket, sourcePath, recordId } = params;
  const supabase = createSupabaseAdminClient();

  const fileName = sanitizeFileName(sourcePath.split("/").pop() || "image.jpg");
  const targetPath = `published/${recordId}/${fileName}`;

  const { data: existing, error: existsError } = await supabase.storage
    .from(PUBLIC_BUCKET)
    .download(targetPath);

  if (existing && !existsError) {
    return targetPath;
  }

  const { data: srcData, error: srcErr } = await supabase.storage
    .from(sourceBucket)
    .download(sourcePath);
  if (srcErr || !srcData) {
    throw new Error(`Source image not found: ${sourceBucket}/${sourcePath}`);
  }

  const contentType =
    srcData.type ||
    (fileName.endsWith(".png")
      ? "image/png"
      : fileName.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg");

  const { error: uploadErr } = await supabase.storage
    .from(PUBLIC_BUCKET)
    .upload(targetPath, srcData, {
      upsert: false,
      contentType,
    });

  if (uploadErr && !String(uploadErr.message).toLowerCase().includes("exists")) {
    throw new Error(`Failed to publish image: ${uploadErr.message}`);
  }

  return targetPath;
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

    const evidenceFiles =
      (submission.evidenceFiles as Array<{ path?: string }> | null) ?? [];
    const firstImagePath = evidenceFiles.find((f) => f.path?.trim())?.path?.trim();

    let publicImagePath: string | null = null;
    if (firstImagePath) {
      publicImagePath = await copyToPublicBucket({
        sourceBucket: PRIVATE_BUCKET,
        sourcePath: firstImagePath,
        recordId: submission.id,
      });
    }

    if (!publicImagePath) {
      const body = await request.json().catch(() => ({}));
      const pasted = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
      if (pasted) {
        const parsed = parseStorageReference(pasted);
        if (parsed) {
          if (parsed.bucket === PUBLIC_BUCKET) {
            publicImagePath = normalizeGalleryPublicPath(parsed.objectPath);
          } else {
            publicImagePath = await copyToPublicBucket({
              sourceBucket: parsed.bucket,
              sourcePath: parsed.objectPath,
              recordId: submission.id,
            });
          }
        }
      }
      if (!publicImagePath) {
        return NextResponse.json(
          {
            error:
              "Image required to approve. Paste a gallery-public URL/path or a valid storage URL/path.",
            code: "IMAGE_REQUIRED",
          },
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
          imageUrl: publicImagePath,
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
