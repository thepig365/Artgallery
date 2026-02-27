/**
 * Import artworks from https://www.chelseyartwork.com/selected-works
 *
 * Usage:
 *   pnpm tsx scripts/import_chelseyartwork.ts --dry-run
 *   pnpm tsx scripts/import_chelseyartwork.ts --limit 10
 *   pnpm tsx scripts/import_chelseyartwork.ts --force-update
 */
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";

const SOURCE_BASE = "https://www.chelseyartwork.com";
const SELECTED_WORKS_URL = `${SOURCE_BASE}/selected-works`;
const PUBLIC_BUCKET = "gallery-public";
const ARTIST_NAME = "Chelsey L";
const RATE_LIMIT_MS = 1000; // 1 req/sec

type ImportedWork = {
  title: string;
  imageSourceUrl: string;
  sourceUrl: string;
  year: number | null;
  medium: string | null;
  dimensions: string | null;
  materials: string | null;
  narrative: string | null;
  slugBase: string;
};

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const forceUpdate = args.includes("--force-update");
  const limitIndex = args.indexOf("--limit");
  const limit =
    limitIndex >= 0 && args[limitIndex + 1]
      ? Number(args[limitIndex + 1])
      : undefined;
  return { dryRun, forceUpdate, limit };
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[?#].*$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 180);
}

function inferContentType(url: string, header: string | null): string {
  if (header && header.startsWith("image/")) return header;
  const lower = url.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

async function fetchSelectedWorksHtml(): Promise<string> {
  const res = await fetch(SELECTED_WORKS_URL, {
    headers: {
      "user-agent": "ArtgalleryImporter/1.0 (+https://gallery.bayviewhub.me)",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch selected-works: HTTP ${res.status}`);
  }
  return res.text();
}

function parseWorksFromSelectedWorks(html: string): ImportedWork[] {
  const $ = cheerio.load(html);
  const works: ImportedWork[] = [];

  // Selector strategy:
  // - Each work is rendered in a wrapper div with inline style containing "cursor:pointer"
  // - Inside: first img + centered metadata block with p tags
  $("div[style*='cursor:pointer']").each((_, el) => {
    const root = $(el);
    const img = root.find("img[src]").first();
    const src = img.attr("src")?.trim();
    if (!src) return;

    const pTexts = root
      .find("p")
      .map((__, p) => $(p).text().trim())
      .get()
      .filter(Boolean);
    if (pTexts.length === 0) return;

    const title = pTexts[0];
    if (!title) return;

    const yearText = pTexts[1] ?? "";
    const yearMatch = yearText.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? Number(yearMatch[0]) : null;

    const mediumCandidate = pTexts[2] ?? null;
    const medium =
      mediumCandidate && !/inquire/i.test(mediumCandidate)
        ? mediumCandidate
        : null;

    const absoluteImage = new URL(src, SOURCE_BASE).toString();
    const slugBase = slugify(title);
    const sourceUrl = `${SELECTED_WORKS_URL}#${slugBase}`;

    works.push({
      title,
      imageSourceUrl: absoluteImage,
      sourceUrl,
      year,
      medium,
      dimensions: null,
      materials: medium,
      narrative: null,
      slugBase,
    });
  });

  // Deduplicate by sourceUrl
  const uniq = new Map<string, ImportedWork>();
  for (const w of works) {
    if (!uniq.has(w.sourceUrl)) uniq.set(w.sourceUrl, w);
  }
  return [...uniq.values()];
}

async function ensureArtist(prisma: PrismaClient) {
  const existing = await prisma.artist.findFirst({
    where: { name: { equals: ARTIST_NAME, mode: "insensitive" } },
  });
  if (existing) return existing;

  return prisma.artist.create({
    data: {
      name: ARTIST_NAME,
      slug: `chelsey-l-import-${Date.now().toString(36)}`,
    },
  });
}

async function run() {
  const { dryRun, forceUpdate, limit } = parseArgs();
  const prisma = new PrismaClient();
  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  requireEnv("DATABASE_URL");

  let found = 0;
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const html = await fetchSelectedWorksHtml();
    let works = parseWorksFromSelectedWorks(html);
    if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
      works = works.slice(0, limit);
    }

    found = works.length;
    const artist = await ensureArtist(prisma);
    let lastImageFetchAt = 0;

    for (const work of works) {
      try {
        let existing = await prisma.artwork.findFirst({
          where: { sourceUrl: work.sourceUrl },
        });

        if (!existing) {
          existing = await prisma.artwork.findFirst({
            where: {
              slug: `${work.slugBase}-chelsey`,
              artistId: artist.id,
            },
          });
        }

        const fileName = sanitizeFilename(
          decodeURIComponent(
            work.imageSourceUrl.split("/").pop() || `${work.slugBase}.jpg`
          )
        );

        const targetRecordId = existing?.id || `new-${work.slugBase}`;
        const objectPath = `chelsey/${targetRecordId}/${fileName}`;

        const shouldUploadImage =
          forceUpdate || !existing || !existing.imageUrl || existing.imageUrl !== objectPath;

        let uploadedObjectPath: string | null = existing?.imageUrl ?? null;

        if (shouldUploadImage) {
          if (!dryRun) {
            const now = Date.now();
            const waitMs = RATE_LIMIT_MS - (now - lastImageFetchAt);
            if (waitMs > 0) await sleep(waitMs);
            lastImageFetchAt = Date.now();

            const imageRes = await fetch(work.imageSourceUrl, {
              headers: {
                "user-agent":
                  "ArtgalleryImporter/1.0 (+https://gallery.bayviewhub.me)",
              },
            });
            if (!imageRes.ok) {
              throw new Error(
                `Image fetch failed (${imageRes.status}) ${work.imageSourceUrl}`
              );
            }
            const contentType = inferContentType(
              work.imageSourceUrl,
              imageRes.headers.get("content-type")
            );
            const arrayBuffer = await imageRes.arrayBuffer();
            const bytes = Buffer.from(arrayBuffer);

            const { error: upErr } = await supabase.storage
              .from(PUBLIC_BUCKET)
              .upload(objectPath, bytes, {
                contentType,
                upsert: true,
              });
            if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
          }

          uploadedObjectPath = objectPath;
        }

        if (!existing) {
          const slug = `${work.slugBase}-chelsey`;
          if (dryRun) {
            created++;
            continue;
          }

          await prisma.artwork.create({
            data: {
              title: work.title,
              slug,
              year: work.year,
              medium: work.medium,
              dimensions: work.dimensions,
              materials: work.materials,
              narrative: work.narrative,
              sourceUrl: work.sourceUrl,
              imageUrl: uploadedObjectPath,
              artistId: artist.id,
              isVisible: true,
            },
          });
          created++;
          continue;
        }

        const nextData = {
          title: work.title,
          year: work.year,
          medium: work.medium,
          dimensions: work.dimensions,
          materials: work.materials,
          narrative: work.narrative,
          sourceUrl: work.sourceUrl,
          imageUrl: uploadedObjectPath,
          isVisible: true,
        };

        const changed =
          forceUpdate ||
          existing.title !== nextData.title ||
          existing.year !== nextData.year ||
          existing.medium !== nextData.medium ||
          existing.dimensions !== nextData.dimensions ||
          existing.materials !== nextData.materials ||
          existing.narrative !== nextData.narrative ||
          existing.sourceUrl !== nextData.sourceUrl ||
          existing.imageUrl !== nextData.imageUrl ||
          existing.isVisible !== true;

        if (!changed) {
          skipped++;
          continue;
        }

        if (!dryRun) {
          await prisma.artwork.update({
            where: { id: existing.id },
            data: nextData,
          });
        }
        updated++;
      } catch (err) {
        failed++;
        console.error(
          `[import] failed: ${work.title} - ${(err as Error).message}`
        );
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n--- import_chelseyartwork summary ---");
  console.log(`dryRun: ${dryRun}`);
  console.log(`forceUpdate: ${forceUpdate}`);
  console.log(`found: ${found}`);
  console.log(`created: ${created}`);
  console.log(`updated: ${updated}`);
  console.log(`skipped: ${skipped}`);
  console.log(`failed: ${failed}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
