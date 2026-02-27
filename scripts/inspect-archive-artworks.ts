/**
 * P0 Debug: Inspect first 6 artworks from archive query.
 * Run: npx tsx scripts/inspect-archive-artworks.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const artworks = await prisma.artwork.findMany({
    where: { isVisible: true },
    include: { artist: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  console.log("\n=== Archive artworks (first 6) ===\n");
  artworks.forEach((a, i) => {
    console.log(`${i + 1}. ${a.title}`);
    console.log(`   id: ${a.id}`);
    console.log(`   slug: ${a.slug}`);
    console.log(`   imageUrl: ${a.imageUrl ?? "(null)"}`);
    console.log(`   isVisible: ${a.isVisible}`);
    console.log(`   artist: ${a.artist?.name ?? "(null)"}`);
    console.log("");
  });

  const withImage = artworks.filter((a) => a.imageUrl?.trim());
  const withoutImage = artworks.filter((a) => !a.imageUrl?.trim());
  console.log("--- Summary ---");
  console.log(`With imageUrl: ${withImage.length}`);
  console.log(`Without imageUrl: ${withoutImage.length}`);
  if (withoutImage.length > 0) {
    console.log("\nArtworks with null/empty imageUrl (not a frontend bug):");
    withoutImage.forEach((a) => console.log(`  - ${a.title} (${a.id})`));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
