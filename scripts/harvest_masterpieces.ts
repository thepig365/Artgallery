/**
 * Harvest open-access masterpieces from The Met and Art Institute of Chicago.
 *
 * Usage:  npx tsx scripts/harvest_masterpieces.ts
 *
 * Rights policy (HARD RULES — never weaken):
 *   Met — only isPublicDomain === true AND primaryImage not empty → CC0
 *   AIC — only is_public_domain === true AND image_id not empty  → CC0
 *
 * Any record that fails these checks is SKIPPED and counted in the summary.
 * Only CC0 / PDM / PublicDomain licenses are written to DB.
 *
 * Upserts into `masterpieces` table via Prisma (source + sourceObjectId unique).
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MET_TARGET = 50;
const AIC_TARGET = 50;

const ALLOWED_LICENSES = new Set(["CC0", "PDM", "PublicDomain"]);

// ─── Utilities ───────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson<T>(url: string, retries = 3): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        console.log(`  Rate limited, waiting ${(i + 1) * 5}s...`);
        await sleep((i + 1) * 5000);
        continue;
      }
      if (!res.ok) {
        console.warn(`  HTTP ${res.status} for ${url}`);
        return null;
      }
      return (await res.json()) as T;
    } catch (err) {
      console.warn(`  Fetch error (attempt ${i + 1}):`, err);
      await sleep(2000);
    }
  }
  return null;
}

function assertLicense(license: string): asserts license is "CC0" | "PDM" | "PublicDomain" {
  if (!ALLOWED_LICENSES.has(license)) {
    throw new Error(`LICENSE VIOLATION: "${license}" is not in allowlist [${[...ALLOWED_LICENSES].join(", ")}]`);
  }
}

// ─── Harvest Stats ───────────────────────────────────────

interface HarvestStats {
  saved: number;
  skippedNotPublicDomain: number;
  skippedNoImage: number;
  skippedLicenseRejected: number;
  errors: number;
}

function newStats(): HarvestStats {
  return { saved: 0, skippedNotPublicDomain: 0, skippedNoImage: 0, skippedLicenseRejected: 0, errors: 0 };
}

function printStats(source: string, stats: HarvestStats) {
  console.log(`\n  ${source} Summary:`);
  console.log(`    saved:                    ${stats.saved}`);
  console.log(`    skipped_not_public_domain: ${stats.skippedNotPublicDomain}`);
  console.log(`    skipped_no_image:          ${stats.skippedNoImage}`);
  console.log(`    skipped_license_rejected:  ${stats.skippedLicenseRejected}`);
  console.log(`    errors:                    ${stats.errors}`);
}

// ─── Met Museum Harvester ────────────────────────────────

interface MetSearchResult {
  total: number;
  objectIDs: number[];
}

interface MetObject {
  objectID: number;
  isPublicDomain: boolean;
  primaryImage: string;
  primaryImageSmall: string;
  title: string;
  artistDisplayName: string;
  objectDate: string;
  medium: string;
  dimensions: string;
  creditLine: string;
  objectURL: string;
  tags?: Array<{ term: string }>;
}

async function harvestMet(): Promise<HarvestStats> {
  console.log("\n═══ THE MET ═══");
  console.log(`Target: ${MET_TARGET} public-domain paintings\n`);

  const stats = newStats();

  const searchUrl =
    "https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&isPublicDomain=true&q=painting";
  const searchResult = await fetchJson<MetSearchResult>(searchUrl);

  if (!searchResult?.objectIDs?.length) {
    console.error("Met search returned no results");
    return stats;
  }

  console.log(`Search returned ${searchResult.objectIDs.length} candidate IDs`);

  const shuffled = searchResult.objectIDs.sort(() => Math.random() - 0.5);

  for (const objectID of shuffled) {
    if (stats.saved >= MET_TARGET) break;

    const obj = await fetchJson<MetObject>(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`
    );

    if (!obj) { stats.errors++; continue; }

    if (obj.isPublicDomain !== true) {
      stats.skippedNotPublicDomain++;
      continue;
    }

    if (!obj.primaryImage) {
      stats.skippedNoImage++;
      continue;
    }

    const license = "CC0";
    try {
      assertLicense(license);
    } catch {
      stats.skippedLicenseRejected++;
      continue;
    }

    const tags = obj.tags?.map((t) => t.term).filter(Boolean) || [];

    try {
      await prisma.masterpiece.upsert({
        where: {
          source_object_unique: {
            source: "met",
            sourceObjectId: String(obj.objectID),
          },
        },
        create: {
          source: "met",
          sourceObjectId: String(obj.objectID),
          title: obj.title || "Untitled",
          artist: obj.artistDisplayName || null,
          date: obj.objectDate || null,
          medium: obj.medium || null,
          dimensions: obj.dimensions || null,
          imageUrl: obj.primaryImage,
          thumbnailUrl: obj.primaryImageSmall || null,
          license,
          creditLine: obj.creditLine || null,
          sourceUrl: obj.objectURL || `https://www.metmuseum.org/art/collection/search/${obj.objectID}`,
          tags,
        },
        update: {
          title: obj.title || "Untitled",
          artist: obj.artistDisplayName || null,
          imageUrl: obj.primaryImage,
          thumbnailUrl: obj.primaryImageSmall || null,
        },
      });
      stats.saved++;
      if (stats.saved % 10 === 0) console.log(`  Met: ${stats.saved}/${MET_TARGET} saved`);
    } catch (err) {
      console.warn(`  Upsert failed for Met #${objectID}:`, err);
      stats.errors++;
    }

    await sleep(200);
  }

  console.log(`\nMet harvest complete: ${stats.saved} masterpieces saved`);
  printStats("Met", stats);
  return stats;
}

// ─── Art Institute of Chicago Harvester ──────────────────

const AIC_IIIF_BASE = "https://lakeimagesweb.artic.edu/iiif/2";

interface AicSearchResult {
  pagination: { total: number; total_pages: number; current_page: number };
  config: { iiif_url: string };
  data: Array<{
    id: number;
    title: string;
    artist_title: string | null;
    date_display: string | null;
    medium_display: string | null;
    dimensions: string | null;
    credit_line: string | null;
    is_public_domain: boolean;
    image_id: string | null;
    category_titles?: string[];
    style_titles?: string[];
    api_link: string;
  }>;
}

async function harvestAic(): Promise<HarvestStats> {
  console.log("\n═══ ART INSTITUTE OF CHICAGO ═══");
  console.log(`Target: ${AIC_TARGET} public-domain works\n`);

  const stats = newStats();
  let page = 1;
  const queries = ["painting", "landscape", "portrait", "impressionism", "still life", "abstract"];

  let iiifBase = AIC_IIIF_BASE;

  for (const query of queries) {
    if (stats.saved >= AIC_TARGET) break;
    page = 1;

    while (stats.saved < AIC_TARGET && page <= 5) {
      const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&limit=20&page=${page}&fields=id,title,artist_title,date_display,medium_display,dimensions,credit_line,is_public_domain,image_id,category_titles,style_titles,api_link`;

      const result = await fetchJson<AicSearchResult>(url);
      if (!result?.data?.length) break;

      if (result.config?.iiif_url) {
        iiifBase = result.config.iiif_url.replace(
          "https://www.artic.edu/iiif/2",
          AIC_IIIF_BASE
        );
      }

      for (const item of result.data) {
        if (stats.saved >= AIC_TARGET) break;

        if (item.is_public_domain !== true) {
          stats.skippedNotPublicDomain++;
          continue;
        }

        if (!item.image_id) {
          stats.skippedNoImage++;
          continue;
        }

        const license = "CC0";
        try {
          assertLicense(license);
        } catch {
          stats.skippedLicenseRejected++;
          continue;
        }

        const imageUrl = `${iiifBase}/${item.image_id}/full/1686,/0/default.jpg`;
        const thumbnailUrl = `${iiifBase}/${item.image_id}/full/400,/0/default.jpg`;
        const sourceUrl = `https://www.artic.edu/artworks/${item.id}`;

        const tags: string[] = [
          ...(item.category_titles || []),
          ...(item.style_titles || []),
        ].filter(Boolean);

        try {
          await prisma.masterpiece.upsert({
            where: {
              source_object_unique: {
                source: "aic",
                sourceObjectId: String(item.id),
              },
            },
            create: {
              source: "aic",
              sourceObjectId: String(item.id),
              title: item.title || "Untitled",
              artist: item.artist_title || null,
              date: item.date_display || null,
              medium: item.medium_display || null,
              dimensions: item.dimensions || null,
              imageUrl,
              thumbnailUrl,
              license,
              creditLine: item.credit_line || "Art Institute of Chicago",
              sourceUrl,
              tags,
            },
            update: {
              title: item.title || "Untitled",
              artist: item.artist_title || null,
              imageUrl,
              thumbnailUrl,
            },
          });
          stats.saved++;
          if (stats.saved % 10 === 0) console.log(`  AIC: ${stats.saved}/${AIC_TARGET} saved`);
        } catch (err) {
          console.warn(`  Upsert failed for AIC #${item.id}:`, err);
          stats.errors++;
        }

        await sleep(100);
      }

      page++;
      await sleep(300);
    }
  }

  console.log(`\nAIC harvest complete: ${stats.saved} masterpieces saved`);
  printStats("AIC", stats);
  return stats;
}

// ─── Main ────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  Masterpiece Harvester — Met + AIC           ║");
  console.log("║  License allowlist: CC0, PDM, PublicDomain   ║");
  console.log("╚══════════════════════════════════════════════╝");

  const metStats = await harvestMet();
  const aicStats = await harvestAic();

  const total = await prisma.masterpiece.count();
  const bySource = await prisma.masterpiece.groupBy({
    by: ["source"],
    _count: true,
  });
  const byLicense = await prisma.masterpiece.groupBy({
    by: ["license"],
    _count: true,
  });

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║  HARVEST REPORT                              ║");
  console.log("╠══════════════════════════════════════════════╣");
  console.log(`║  Met saved:        ${metStats.saved}`);
  console.log(`║  Met skipped:      ${metStats.skippedNotPublicDomain} not-PD, ${metStats.skippedNoImage} no-img, ${metStats.skippedLicenseRejected} lic-reject`);
  console.log(`║  AIC saved:        ${aicStats.saved}`);
  console.log(`║  AIC skipped:      ${aicStats.skippedNotPublicDomain} not-PD, ${aicStats.skippedNoImage} no-img, ${aicStats.skippedLicenseRejected} lic-reject`);
  console.log("╠══════════════════════════════════════════════╣");
  console.log(`║  Total in DB:      ${total}`);
  bySource.forEach((g) => console.log(`║    ${g.source}: ${g._count}`));
  console.log("║  By license:");
  byLicense.forEach((g) => console.log(`║    ${g.license}: ${g._count}`));
  console.log("╚══════════════════════════════════════════════╝\n");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Harvest failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
