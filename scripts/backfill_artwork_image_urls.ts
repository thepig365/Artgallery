/**
 * Backfill artwork imageUrl from originating ArtistSubmission evidenceFiles.
 *
 * For artworks where imageUrl is null and there exists an APPROVED submission
 * with evidenceFiles path, set imageUrl = /api/storage/{path}.
 *
 * Artwork slug = slugify(workTitle) + "-" + submission.id.slice(0,8)
 *
 * Run: npx tsx scripts/backfill_artwork_image_urls.ts [--dry-run]
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  if (dryRun) {
    console.log("--- DRY RUN (no changes) ---\n");
  }

  let submissions: Awaited<ReturnType<typeof prisma.artistSubmission.findMany>>;
  let artworksNullImage: Awaited<ReturnType<typeof prisma.artwork.findMany>>;
  try {
    submissions = await prisma.artistSubmission.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
    artworksNullImage = await prisma.artwork.findMany({
      where: { imageUrl: null },
    });
  } catch (err) {
    console.error("Database unavailable:", (err as Error).message);
    console.log("\nExpected dry-run output when DB is available:");
    console.log("  Would update: <title> (<id>)");
    console.log("    slug: <baseSlug>-<submissionId[0:8]>");
    console.log("    imageUrl: /api/storage/<evidenceFiles[0].path>");
    console.log("\nRun without --dry-run to apply changes.");
    return;
  }

  const slugToArtwork = new Map(artworksNullImage.map((a) => [a.slug, a]));

  let updated = 0;
  let skipped = 0;

  for (const sub of submissions) {
    const evidenceFiles = (sub.evidenceFiles as Array<{ path?: string }> | null) ?? [];
    const firstPath = evidenceFiles.find((f) => f.path?.trim())?.path?.trim();
    if (!firstPath) {
      skipped++;
      continue;
    }

    const baseSlug = slugify(sub.workTitle);
    const suffix = sub.id.slice(0, 8);
    const slug = `${baseSlug}-${suffix}`;

    const artwork = slugToArtwork.get(slug);
    if (!artwork) continue;

    const imageUrl = `/api/storage/${firstPath}`;

    if (dryRun) {
      console.log(`Would update: ${artwork.title} (${artwork.id})`);
      console.log(`  slug: ${slug}`);
      console.log(`  imageUrl: ${imageUrl}`);
      updated++;
    } else {
      await prisma.artwork.update({
        where: { id: artwork.id },
        data: { imageUrl },
      });
      console.log(`Updated: ${artwork.title} (${artwork.id}) -> ${imageUrl}`);
      updated++;
      slugToArtwork.delete(slug);
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Submissions (APPROVED): ${submissions.length}`);
  console.log(`Artworks with null imageUrl: ${artworksNullImage.length}`);
  console.log(`Updated: ${updated}`);
  if (dryRun) {
    console.log("(dry-run: no changes written)");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
