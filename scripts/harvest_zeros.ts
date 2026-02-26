/**
 * Finds artists with 0 ingested works and runs the curated harvester for them.
 * Usage: npx tsx scripts/harvest_zeros.ts
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { execSync } from "child_process";
import rawConfig from "./curated_artists.json";

interface CuratedArtist {
  key: string;
  name: string;
  sources: string[];
  target: number;
  featured?: boolean;
  note?: string;
}

const config: { artists: CuratedArtist[] } = rawConfig;

async function main() {
  const prisma = new PrismaClient();

  const rows = await prisma.$queryRaw<Array<{ tag: string; cnt: bigint }>>(
    Prisma.sql`SELECT t AS tag, COUNT(*) AS cnt
               FROM masterpieces, unnest(tags) AS t
               WHERE t LIKE 'artist:%'
               GROUP BY t`
  );
  const countMap = new Map<string, number>();
  for (const r of rows) countMap.set(r.tag, Number(r.cnt));

  const zeroKeys = config.artists
    .filter((a) => a.target > 0 && a.sources.length > 0)
    .filter((a) => (countMap.get(`artist:${a.key}`) ?? 0) === 0)
    .map((a) => a.key);

  await prisma.$disconnect();

  if (zeroKeys.length === 0) {
    console.log("No zero-count artists found. Nothing to harvest.");
    return;
  }

  console.log(`Found ${zeroKeys.length} zero-count artists: ${zeroKeys.join(", ")}`);

  const batchSize = 10;
  for (let i = 0; i < zeroKeys.length; i += batchSize) {
    const batch = zeroKeys.slice(i, i + batchSize);
    const keysArg = batch.join(",");
    console.log(`\n=== Batch ${Math.floor(i / batchSize) + 1}: ${keysArg} ===\n`);

    execSync(
      `npx tsx scripts/harvest_curated_masterpieces.ts --keys=${keysArg} --maxArtists=${batch.length} --perArtist=6`,
      { stdio: "inherit", cwd: process.cwd() }
    );
  }
}

main().catch((e) => {
  console.error("harvest_zeros failed:", e);
  process.exit(1);
});
