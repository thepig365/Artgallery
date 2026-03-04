/**
 * Export artworks from current DATABASE_URL to CSV.
 * Usage: DATABASE_URL="postgresql://..." npx tsx scripts/recovery/export-artworks.ts
 * Output: artworks_export_TIMESTAMP.csv
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function escapeCsv(val: unknown): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

async function main() {
  const artworks = await prisma.artwork.findMany({
    include: { artist: true },
    orderBy: { createdAt: "asc" },
  });

  const headers = [
    "id", "title", "slug", "medium", "year", "dimensions", "materials", "narrative",
    "source_url", "image_url", "source_license_status",
    "score_b", "score_p", "score_m", "score_s", "final_v",
    "is_visible", "hidden_reason", "hidden_at", "hidden_by", "owner_auth_uid",
    "artist_id", "artist_name", "created_at", "updated_at",
  ];

  const rows = artworks.map((a) => [
    a.id,
    a.title,
    a.slug,
    a.medium,
    a.year,
    a.dimensions,
    a.materials,
    a.narrative,
    a.sourceUrl,
    a.imageUrl,
    a.sourceLicenseStatus,
    a.scoreB,
    a.scoreP,
    a.scoreM,
    a.scoreS,
    a.finalV,
    a.isVisible,
    a.hiddenReason,
    a.hiddenAt?.toISOString(),
    a.hiddenBy,
    a.ownerAuthUid,
    a.artistId,
    a.artist?.name ?? "",
    a.createdAt.toISOString(),
    a.updatedAt.toISOString(),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
  const outPath = path.join(process.cwd(), `artworks_export_${Date.now()}.csv`);
  fs.writeFileSync(outPath, csv, "utf-8");

  console.log(`Exported ${artworks.length} artworks to ${outPath}`);
  console.log("Sample slugs:", artworks.slice(0, 5).map((a) => a.slug).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
