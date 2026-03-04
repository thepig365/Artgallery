/**
 * Import artworks from CSV into production.
 *
 * SAFETY:
 * - Uses `id` as primary key for upsert (not slug).
 * - Always run with --dry-run first. Exit non-zero if conflicts unless --force.
 * - Backup artworks before import (see DATA-RECOVERY-RUNBOOK.md).
 *
 * Usage:
 *   npx tsx scripts/recovery/import-artworks-upsert.ts --dry-run artworks_export_XXX.csv
 *   npx tsx scripts/recovery/import-artworks-upsert.ts artworks_export_XXX.csv
 *   npx tsx scripts/recovery/import-artworks-upsert.ts --force artworks_export_XXX.csv
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (inQuotes) {
      current += c;
    } else if (c === ",") {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function parseBool(s: string): boolean {
  return s === "true" || s === "1" || s === "yes";
}

interface ParsedRow {
  id: string;
  slug: string;
  artistId: string;
  get: (col: string) => string | null;
}

function buildRow(headers: string[], row: string[], slugIdx: number, idIdx: number, artistIdIdx: number): ParsedRow | null {
  const slug = row[slugIdx]?.trim();
  const id = row[idIdx]?.trim();
  const artistId = row[artistIdIdx]?.trim();
  if (!slug || !artistId) return null;
  return {
    id: id || "",
    slug,
    artistId,
    get: (col: string) => {
      const i = headers.indexOf(col);
      return i >= 0 ? row[i]?.trim() || null : null;
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");
  const csvPath = args.find((a) => !a.startsWith("-"));

  if (!csvPath || !fs.existsSync(csvPath)) {
    console.error("Usage: npx tsx scripts/recovery/import-artworks-upsert.ts [--dry-run] [--force] <artworks_export_XXX.csv>");
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const headers = parseCsvLine(lines[0]);
  const idIdx = headers.indexOf("id");
  const slugIdx = headers.indexOf("slug");
  const artistIdIdx = headers.indexOf("artist_id");
  if (slugIdx < 0 || artistIdIdx < 0) {
    console.error("CSV must have 'slug' and 'artist_id' columns");
    process.exit(1);
  }

  const rows: ParsedRow[] = [];
  for (const line of lines.slice(1)) {
    const row = parseCsvLine(line);
    if (row.length < headers.length) continue;
    const parsed = buildRow(headers, row, slugIdx, idIdx, artistIdIdx);
    if (parsed) rows.push(parsed);
  }

  const incomingRows = rows.length;
  const slugCounts = new Map<string, number>();
  for (const r of rows) {
    slugCounts.set(r.slug, (slugCounts.get(r.slug) ?? 0) + 1);
  }
  const duplicateSlugsInCsv = [...slugCounts.entries()].filter(([, c]) => c > 1).map(([s]) => s);

  const existingById = new Map<string, { id: string; slug: string }>();
  const existingBySlug = new Map<string, { id: string; slug: string }>();
  const prodArtworks = await prisma.artwork.findMany({ select: { id: true, slug: true } });
  for (const a of prodArtworks) {
    existingById.set(a.id, { id: a.id, slug: a.slug });
    existingBySlug.set(a.slug, { id: a.id, slug: a.slug });
  }
  const existingProdRows = prodArtworks.length;

  const wouldInsert: ParsedRow[] = [];
  const wouldUpdate: ParsedRow[] = [];
  const conflictsBySlug: { slug: string; sourceId: string; prodId: string }[] = [];
  const conflictsById: { id: string; sourceSlug: string; prodSlug: string }[] = [];

  for (const r of rows) {
    const prodById = r.id ? existingById.get(r.id) : null;
    const prodBySlug = existingBySlug.get(r.slug);

    if (prodById) {
      if (prodById.slug === r.slug) {
        wouldUpdate.push(r);
      } else {
        conflictsById.push({ id: r.id, sourceSlug: r.slug, prodSlug: prodById.slug });
      }
    } else if (prodBySlug) {
      if (prodBySlug.id === r.id) {
        wouldUpdate.push(r);
      } else {
        conflictsBySlug.push({ slug: r.slug, sourceId: r.id, prodId: prodBySlug.id });
      }
    } else {
      wouldInsert.push(r);
    }
  }

  const conflictCount = conflictsBySlug.length + conflictsById.length;
  const exitCode = conflictCount > 0 && !force ? 1 : 0;

  console.log(dryRun ? "--- DRY RUN (no writes) ---\n" : "--- IMPORT ---\n");
  console.log("incoming_rows:          ", incomingRows);
  console.log("duplicate_slugs_in_csv: ", duplicateSlugsInCsv.length);
  console.log("existing_prod_rows:     ", existingProdRows);
  console.log("would_insert:           ", wouldInsert.length);
  console.log("would_update:           ", wouldUpdate.length);
  console.log("conflicts_by_slug:       ", conflictsBySlug.length);
  console.log("conflicts_by_id:         ", conflictsById.length);
  console.log("\n--- Conflict Report ---");
  if (conflictsBySlug.length) {
    console.log("conflicts_by_slug:", JSON.stringify(conflictsBySlug.slice(0, 10), null, 2));
    if (conflictsBySlug.length > 10) console.log(`  ... and ${conflictsBySlug.length - 10} more`);
  }
  if (conflictsById.length) {
    console.log("conflicts_by_id:", JSON.stringify(conflictsById.slice(0, 10), null, 2));
    if (conflictsById.length > 10) console.log(`  ... and ${conflictsById.length - 10} more`);
  }
  if (wouldInsert.length) {
    console.log("\n--- Sample would_insert ---");
    console.log(wouldInsert.slice(0, 5).map((r) => r.slug).join(", "));
  }
  if (wouldUpdate.length) {
    console.log("\n--- Sample would_update ---");
    console.log(wouldUpdate.slice(0, 5).map((r) => r.slug).join(", "));
  }
  console.log("\nExit:", exitCode, conflictCount > 0 ? "(conflicts)" : "(no conflicts)");

  if (dryRun) {
    process.exit(exitCode);
  }

  if (conflictCount > 0 && !force) {
    console.error("\nAborting: conflicts exist. Resolve manually (staging + mapping) or use --force to proceed with non-conflict rows only.");
    process.exit(1);
  }

  let inserted = 0;
  let updated = 0;
  const get = (r: ParsedRow, col: string) => r.get(col);

  const conflictSlugSet = new Set(conflictsBySlug.map((c) => c.slug));
  const conflictIdSet = new Set(conflictsById.map((c) => c.id));

  for (const r of rows) {
    if (conflictSlugSet.has(r.slug) || conflictIdSet.has(r.id)) continue;

    const prodById = r.id ? existingById.get(r.id) : null;
    const prodBySlug = existingBySlug.get(r.slug);
    const willUpdate = prodById && prodById.slug === r.slug;

    if (willUpdate) {
      try {
        await prisma.artwork.update({
          where: { id: r.id },
          data: {
            title: get(r, "title") || undefined,
            medium: get(r, "medium") ?? undefined,
            year: get(r, "year") ? parseInt(get(r, "year")!, 10) : undefined,
            dimensions: get(r, "dimensions") ?? undefined,
            materials: get(r, "materials") ?? undefined,
            narrative: get(r, "narrative") ?? undefined,
            sourceUrl: get(r, "source_url") ?? undefined,
            imageUrl: get(r, "image_url") ?? undefined,
            sourceLicenseStatus: get(r, "source_license_status") ?? undefined,
            scoreB: get(r, "score_b") ? parseFloat(get(r, "score_b")!) : undefined,
            scoreP: get(r, "score_p") ? parseFloat(get(r, "score_p")!) : undefined,
            scoreM: get(r, "score_m") ? parseFloat(get(r, "score_m")!) : undefined,
            scoreS: get(r, "score_s") ? parseFloat(get(r, "score_s")!) : undefined,
            finalV: get(r, "final_v") ? parseFloat(get(r, "final_v")!) : undefined,
            isVisible: parseBool(get(r, "is_visible") || "true"),
            hiddenReason: get(r, "hidden_reason") ?? undefined,
            hiddenAt: get(r, "hidden_at") ? new Date(get(r, "hidden_at")!) : undefined,
            hiddenBy: get(r, "hidden_by") ?? undefined,
            ownerAuthUid: get(r, "owner_auth_uid") ?? undefined,
          },
        });
        updated++;
      } catch (err) {
        console.error(`Update failed ${r.slug}:`, err);
      }
    } else if (!prodBySlug) {
      try {
        await prisma.artwork.create({
          data: {
            id: r.id || undefined,
            title: get(r, "title") || "Untitled",
            slug: r.slug,
            medium: get(r, "medium"),
            year: get(r, "year") ? parseInt(get(r, "year")!, 10) : null,
            dimensions: get(r, "dimensions"),
            materials: get(r, "materials"),
            narrative: get(r, "narrative"),
            sourceUrl: get(r, "source_url"),
            imageUrl: get(r, "image_url"),
            sourceLicenseStatus: get(r, "source_license_status"),
            scoreB: get(r, "score_b") ? parseFloat(get(r, "score_b")!) : null,
            scoreP: get(r, "score_p") ? parseFloat(get(r, "score_p")!) : null,
            scoreM: get(r, "score_m") ? parseFloat(get(r, "score_m")!) : null,
            scoreS: get(r, "score_s") ? parseFloat(get(r, "score_s")!) : null,
            finalV: get(r, "final_v") ? parseFloat(get(r, "final_v")!) : null,
            isVisible: parseBool(get(r, "is_visible") || "true"),
            hiddenReason: get(r, "hidden_reason"),
            hiddenAt: get(r, "hidden_at") ? new Date(get(r, "hidden_at")!) : null,
            hiddenBy: get(r, "hidden_by"),
            ownerAuthUid: get(r, "owner_auth_uid"),
            artistId: r.artistId,
          },
        });
        inserted++;
      } catch (err) {
        console.error(`Insert failed ${r.slug}:`, err);
      }
    }
  }

  const after = await prisma.artwork.count();
  const sample = await prisma.artwork.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: { slug: true, title: true },
  });

  console.log("\n[AFTER] artworks count:", after);
  console.log("Inserted:", inserted, "Updated:", updated);
  console.log("10 example slugs:", sample.map((s) => s.slug).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
