/**
 * Migrate public artwork image references to permanent gallery-public object paths.
 *
 * Idempotent:
 * - Skip copy when destination already exists.
 * - Skip DB update when artwork already points to destination objectPath.
 *
 * Usage:
 *   npx tsx scripts/migrate_to_gallery_public.ts --dry-run
 *   npx tsx scripts/migrate_to_gallery_public.ts
 */
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const PRIVATE_BUCKET = "artist-submissions-evidence";
const PUBLIC_BUCKET = "gallery-public";

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

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

function parseSourceRef(
  ref: string
): { bucket: string; objectPath: string } | null {
  const value = ref.trim();
  if (!value) return null;

  if (value.startsWith("/api/storage/")) {
    return {
      bucket: PRIVATE_BUCKET,
      objectPath: value.replace(/^\/api\/storage\/+/, ""),
    };
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const u = new URL(value);
      const m = u.pathname.match(
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

  // Assume plain objectPath in gallery-public
  return { bucket: PUBLIC_BUCKET, objectPath: value.replace(/^\/+/, "") };
}

async function targetExists(
  supabase: any,
  objectPath: string
) {
  const { data, error } = await supabase.storage
    .from(PUBLIC_BUCKET)
    .download(objectPath);
  return !!data && !error;
}

async function copyToPublic(params: {
  supabase: any;
  sourceBucket: string;
  sourcePath: string;
  recordId: string;
}) {
  const { supabase, sourceBucket, sourcePath, recordId } = params;
  const fileName = sanitizeFileName(sourcePath.split("/").pop() || "image.jpg");
  const destinationPath = `published/${recordId}/${fileName}`;

  if (await targetExists(supabase, destinationPath)) {
    return { destinationPath, copied: false };
  }

  const { data: srcData, error: srcErr } = await supabase.storage
    .from(sourceBucket)
    .download(sourcePath);
  if (srcErr || !srcData) {
    throw new Error(`Source missing: ${sourceBucket}/${sourcePath}`);
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
    .upload(destinationPath, srcData, {
      upsert: false,
      contentType,
    });
  if (uploadErr && !uploadErr.message.toLowerCase().includes("exists")) {
    throw new Error(`Upload failed: ${uploadErr.message}`);
  }
  return { destinationPath, copied: true };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRole = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  requireEnv("DATABASE_URL");

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const artworks = await prisma.artwork.findMany({
    where: { isVisible: true },
    select: { id: true, title: true, slug: true, imageUrl: true },
    orderBy: { createdAt: "desc" },
  });

  const approvedSubs = await prisma.artistSubmission.findMany({
    where: { status: "APPROVED" },
    select: { id: true, workTitle: true, evidenceFiles: true },
  });

  const subBySlug = new Map(
    approvedSubs.map((s) => [`${slugify(s.workTitle)}-${s.id.slice(0, 8)}`, s])
  );

  let considered = 0;
  let copied = 0;
  let updated = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const artwork of artworks) {
    considered++;

    let source = artwork.imageUrl ? parseSourceRef(artwork.imageUrl) : null;
    if (!source) {
      const sub = subBySlug.get(artwork.slug);
      const evidence =
        (sub?.evidenceFiles as Array<{ path?: string }> | null)?.find((f) =>
          f.path?.trim()
        )?.path || null;
      if (evidence) {
        source = { bucket: PRIVATE_BUCKET, objectPath: evidence };
      }
    }

    if (!source?.objectPath) {
      skipped++;
      continue;
    }

    // Already normalized objectPath in public bucket
    if (source.bucket === PUBLIC_BUCKET && artwork.imageUrl === source.objectPath) {
      skipped++;
      continue;
    }

    try {
      const { destinationPath, copied: didCopy } =
        source.bucket === PUBLIC_BUCKET
          ? { destinationPath: source.objectPath, copied: false }
          : dryRun
            ? {
                destinationPath: `published/${artwork.id}/${sanitizeFileName(
                  source.objectPath.split("/").pop() || "image.jpg"
                )}`,
                copied: false,
              }
            : await copyToPublic({
                supabase,
                sourceBucket: source.bucket,
                sourcePath: source.objectPath,
                recordId: artwork.id,
              });

      if (didCopy) copied++;

      if (artwork.imageUrl !== destinationPath) {
        if (dryRun) {
          console.log(`[DRY] ${artwork.id} ${artwork.title}`);
          console.log(`      ${artwork.imageUrl ?? "(null)"} -> ${destinationPath}`);
        } else {
          await prisma.artwork.update({
            where: { id: artwork.id },
            data: { imageUrl: destinationPath },
          });
        }
        updated++;
      } else {
        skipped++;
      }
    } catch (err) {
      failures.push(`${artwork.id}: ${(err as Error).message}`);
    }
  }

  console.log("\n--- migrate_to_gallery_public summary ---");
  console.log(`Dry run: ${dryRun ? "yes" : "no"}`);
  console.log(`Public artworks considered: ${considered}`);
  console.log(`Copied to ${PUBLIC_BUCKET}: ${copied}`);
  console.log(`DB rows updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  if (failures.length > 0) {
    console.log(`Failures: ${failures.length}`);
    for (const item of failures.slice(0, 20)) console.log(`  - ${item}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
