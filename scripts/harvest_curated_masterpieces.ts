/**
 * Harvest curated masterpieces for the Top 50 artist list.
 *
 * FAST MODE — hard limits to prevent long runs:
 *   MET_MAX_TOTAL       = 500  (skip Met if search total exceeds this)
 *   MET_MAX_SCAN        = 200  (only scan first 200 objectIDs)
 *   MET_PER_OBJECT_DELAY = 300ms
 *   MET_RETRY_MAX       = 5   (exponential backoff on 429/503/403)
 *
 * Usage:
 *   npx tsx scripts/harvest_curated_masterpieces.ts [options]
 *
 * Options:
 *   --keys=monet,rembrandt    Only process these artists
 *   --maxArtists=10           Max artists to process (default 10)
 *   --perArtist=6             Target works per artist (default 6)
 *   --sources=met|aic|both    Limit to one source (default: both)
 *
 * Compliance (HARD RULES — never weaken):
 *   - Only CC0 / PDM / PublicDomain licenses
 *   - Met: isPublicDomain === true AND primaryImage present
 *   - AIC: is_public_domain === true AND image_id present
 *
 * Tagging:
 *   - Always adds "artist:<key>"
 *   - Only adds "featured" when artist.featured === true
 *   - Tags are merged, never overwritten
 */

import { PrismaClient } from "@prisma/client";
import rawConfig from "./curated_artists.json";

// ─── Types + Config ──────────────────────────────────────

interface CuratedArtist {
  key: string;
  name: string;
  sources: string[];
  target: number;
  featured?: boolean;
  note?: string;
}

const curatedConfig: { artists: CuratedArtist[] } = rawConfig;
const prisma = new PrismaClient();

const ALLOWED_LICENSES = new Set(["CC0", "PDM", "PublicDomain"]);
const AIC_IIIF_BASE = "https://lakeimagesweb.artic.edu/iiif/2";

const MET_PER_OBJECT_DELAY = 300;
const MET_MAX_TOTAL = 500;
const MET_MAX_SCAN = 200;
const MET_RETRY_MAX = 5;
const MAX_BACKOFF = 10_000;

// ─── CLI Args ────────────────────────────────────────────

interface CliOptions {
  keys: string[] | null;
  maxArtists: number;
  perArtist: number;
  sources: "met" | "aic" | "both";
}

function parseArgs(): CliOptions {
  const opts: CliOptions = {
    keys: null,
    maxArtists: 10,
    perArtist: 6,
    sources: "both",
  };

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--keys=")) {
      opts.keys = arg.slice(7).split(",").map((k) => k.trim()).filter(Boolean);
    } else if (arg.startsWith("--maxArtists=")) {
      opts.maxArtists = parseInt(arg.slice(13), 10) || 10;
    } else if (arg.startsWith("--perArtist=")) {
      opts.perArtist = parseInt(arg.slice(12), 10) || 6;
    } else if (arg.startsWith("--sources=")) {
      const v = arg.slice(10);
      if (v === "met" || v === "aic" || v === "both") opts.sources = v;
    }
  }

  return opts;
}

// ─── Utilities ───────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJsonWithBackoff<T>(url: string, retries = MET_RETRY_MAX): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429 || res.status === 503) {
        const delay = Math.min(1000 * Math.pow(2, i), MAX_BACKOFF);
        console.log(`  ⏳ HTTP ${res.status} — backoff ${delay}ms (${i + 1}/${retries})`);
        await sleep(delay);
        continue;
      }
      if (res.status === 403) {
        const delay = Math.min(2000 * Math.pow(2, i), MAX_BACKOFF);
        console.log(`  ⏳ HTTP 403 — backoff ${delay}ms (${i + 1}/${retries})`);
        await sleep(delay);
        continue;
      }
      if (!res.ok) {
        return null;
      }
      return (await res.json()) as T;
    } catch {
      const delay = Math.min(2000 * Math.pow(2, i), MAX_BACKOFF);
      console.warn(`  Fetch error (${i + 1}/${retries}), retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
  console.warn(`  Exhausted ${retries} retries for ${url}`);
  return null;
}

const metSearchCache = new Map<string, number[]>();

function mergeTags(existing: string[], additions: string[]): string[] {
  const set = new Set(existing);
  for (const t of additions) set.add(t);
  return [...set];
}

function buildCuratedTags(artistKey: string, isFeatured: boolean): string[] {
  const tags = [`artist:${artistKey}`];
  if (isFeatured) tags.push("featured");
  return tags;
}

// ─── Met Harvester (FAST MODE) ───────────────────────────

interface MetSearchResult { total: number; objectIDs: number[] | null; }

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

interface MetHarvestResult {
  saved: number;
  metTotal: number;
  metScanned: number;
  skippedReason: string | null;
}

async function harvestMetForArtist(
  artist: CuratedArtist,
  target: number
): Promise<MetHarvestResult> {
  const lastName = artist.name.split(" ").pop()!;
  const curatedTags = buildCuratedTags(artist.key, artist.featured === true);

  let objectIDs = metSearchCache.get(artist.name);
  let metTotal = 0;

  if (!objectIDs) {
    const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?artistOrCulture=true&hasImages=true&isPublicDomain=true&q=${encodeURIComponent(artist.name)}`;
    const result = await fetchJsonWithBackoff<MetSearchResult>(searchUrl);
    if (!result?.objectIDs?.length) {
      return { saved: 0, metTotal: 0, metScanned: 0, skippedReason: "no Met results" };
    }
    metTotal = result.total;
    objectIDs = result.objectIDs;
    metSearchCache.set(artist.name, objectIDs);
    await sleep(MET_PER_OBJECT_DELAY);
  } else {
    metTotal = objectIDs.length;
  }

  if (metTotal > MET_MAX_TOTAL) {
    console.log(`    Met: ${metTotal} candidates > MET_MAX_TOTAL(${MET_MAX_TOTAL}) — SKIPPING Met for this artist`);
    return { saved: 0, metTotal, metScanned: 0, skippedReason: `metTotal=${metTotal} > ${MET_MAX_TOTAL}` };
  }

  const scanIds = objectIDs.slice(0, MET_MAX_SCAN);
  console.log(`    Met: ${metTotal} total, scanning first ${scanIds.length}`);

  let saved = 0;
  let scanned = 0;

  for (const objectID of scanIds) {
    if (saved >= target) break;
    scanned++;

    await sleep(MET_PER_OBJECT_DELAY);
    const obj = await fetchJsonWithBackoff<MetObject>(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`
    );
    if (!obj) continue;

    if (obj.isPublicDomain !== true) continue;
    if (!obj.primaryImage) continue;
    if (!obj.artistDisplayName?.toLowerCase().includes(lastName.toLowerCase())) continue;
    if (!ALLOWED_LICENSES.has("CC0")) continue;

    const existingTags = obj.tags?.map((t) => t.term).filter(Boolean) || [];
    const tags = mergeTags(existingTags, curatedTags);

    try {
      await prisma.masterpiece.upsert({
        where: {
          source_object_unique: { source: "met", sourceObjectId: String(obj.objectID) },
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
          license: "CC0",
          creditLine: obj.creditLine || null,
          sourceUrl: obj.objectURL || `https://www.metmuseum.org/art/collection/search/${obj.objectID}`,
          tags,
        },
        update: {
          title: obj.title || "Untitled",
          artist: obj.artistDisplayName || null,
          imageUrl: obj.primaryImage,
          thumbnailUrl: obj.primaryImageSmall || null,
          tags,
        },
      });
      saved++;
      if (saved % 3 === 0) console.log(`    Met: ${saved}/${target} for ${artist.key}`);
    } catch (err) {
      console.warn(`    Upsert failed for Met #${objectID}:`, err);
    }
  }

  return { saved, metTotal, metScanned: scanned, skippedReason: null };
}

// ─── AIC Harvester ───────────────────────────────────────

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
  }>;
}

async function harvestAicForArtist(
  artist: CuratedArtist,
  target: number
): Promise<number> {
  const lastName = artist.name.split(" ").pop()!;
  const curatedTags = buildCuratedTags(artist.key, artist.featured === true);
  let tagged = 0;
  let page = 1;
  let iiifBase = AIC_IIIF_BASE;

  while (tagged < target && page <= 10) {
    const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(artist.name)}&limit=20&page=${page}&fields=id,title,artist_title,date_display,medium_display,dimensions,credit_line,is_public_domain,image_id,category_titles,style_titles`;
    const result = await fetchJsonWithBackoff<AicSearchResult>(url);
    if (!result?.data?.length) break;

    if (result.config?.iiif_url) {
      iiifBase = result.config.iiif_url.replace("https://www.artic.edu/iiif/2", AIC_IIIF_BASE);
    }

    for (const item of result.data) {
      if (tagged >= target) break;
      if (item.is_public_domain !== true) continue;
      if (!item.image_id) continue;
      if (!item.artist_title?.toLowerCase().includes(lastName.toLowerCase())) continue;
      if (!ALLOWED_LICENSES.has("CC0")) continue;

      const imageUrl = `${iiifBase}/${item.image_id}/full/1686,/0/default.jpg`;
      const thumbnailUrl = `${iiifBase}/${item.image_id}/full/400,/0/default.jpg`;
      const sourceUrl = `https://www.artic.edu/artworks/${item.id}`;

      const baseTags = [
        ...(item.category_titles || []),
        ...(item.style_titles || []),
      ].filter(Boolean);
      const tags = mergeTags(baseTags, curatedTags);

      try {
        await prisma.masterpiece.upsert({
          where: {
            source_object_unique: { source: "aic", sourceObjectId: String(item.id) },
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
            license: "CC0",
            creditLine: item.credit_line || "Art Institute of Chicago",
            sourceUrl,
            tags,
          },
          update: {
            title: item.title || "Untitled",
            artist: item.artist_title || null,
            imageUrl,
            thumbnailUrl,
            tags,
          },
        });
        tagged++;
        if (tagged % 3 === 0) console.log(`    AIC: ${tagged}/${target} for ${artist.key}`);
      } catch (err) {
        console.warn(`    Upsert failed for AIC #${item.id}:`, err);
      }

      await sleep(100);
    }

    page++;
    await sleep(300);
  }

  return tagged;
}

// ─── Main ────────────────────────────────────────────────

interface ArtistReport {
  key: string;
  name: string;
  metTotal: number;
  metScanned: number;
  metSaved: number;
  aicSaved: number;
  total: number;
  skippedReason: string | null;
}

async function main() {
  const opts = parseArgs();

  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║  Curated Artists Harvester — FAST MODE                    ║");
  console.log("║  License: CC0 / PDM / PublicDomain only                   ║");
  console.log("║  Met limits: MAX_TOTAL=500, MAX_SCAN=200, DELAY=300ms     ║");
  console.log("╠═══════════════════════════════════════════════════════════╣");
  console.log(`║  maxArtists: ${opts.maxArtists}   perArtist: ${opts.perArtist}   sources: ${opts.sources}`);
  if (opts.keys) {
    console.log(`║  keys: ${opts.keys.join(", ")}`);
  } else {
    console.log(`║  keys: auto (featured first, then rest)`);
  }
  console.log("╚═══════════════════════════════════════════════════════════╝");

  let candidates: CuratedArtist[];

  if (opts.keys) {
    const keySet = new Set(opts.keys);
    candidates = curatedConfig.artists.filter((a) => keySet.has(a.key));
  } else {
    const featured = curatedConfig.artists.filter((a) => a.featured === true && a.target > 0);
    const rest = curatedConfig.artists.filter((a) => a.featured !== true && a.target > 0);
    candidates = [...featured, ...rest];
  }

  candidates = candidates.slice(0, opts.maxArtists);

  const report: ArtistReport[] = [];
  let processed = 0;

  for (const artist of candidates) {
    console.log(`\n═══ [${processed + 1}/${candidates.length}] ${artist.name.toUpperCase()} (${artist.key}) ═══`);

    if (artist.target === 0 || artist.sources.length === 0) {
      console.log(`  SKIPPED — ${artist.note || "no sources configured"}`);
      report.push({ key: artist.key, name: artist.name, metTotal: 0, metScanned: 0, metSaved: 0, aicSaved: 0, total: 0, skippedReason: artist.note || "target=0" });
      processed++;
      continue;
    }

    const runTarget = Math.min(opts.perArtist, artist.target);
    const allowMet = opts.sources !== "aic" && artist.sources.includes("met");
    const allowAic = opts.sources !== "met" && artist.sources.includes("aic");

    const sourcesUsed = [allowMet && "met", allowAic && "aic"].filter(Boolean) as string[];
    const perSource = Math.ceil(runTarget / sourcesUsed.length);

    let metResult: MetHarvestResult = { saved: 0, metTotal: 0, metScanned: 0, skippedReason: null };
    let aicSaved = 0;

    if (allowMet) {
      console.log(`  Met (target ~${perSource})...`);
      metResult = await harvestMetForArtist(artist, perSource);
      console.log(`  Met: ${metResult.saved} saved (total=${metResult.metTotal}, scanned=${metResult.metScanned}${metResult.skippedReason ? `, skip: ${metResult.skippedReason}` : ""})`);
    }

    if (allowAic) {
      const remaining = runTarget - metResult.saved;
      const aicTarget = Math.max(perSource, remaining);
      console.log(`  AIC (target ~${aicTarget})...`);
      aicSaved = await harvestAicForArtist(artist, aicTarget);
      console.log(`  AIC: ${aicSaved} saved`);
    }

    report.push({
      key: artist.key,
      name: artist.name,
      metTotal: metResult.metTotal,
      metScanned: metResult.metScanned,
      metSaved: metResult.saved,
      aicSaved,
      total: metResult.saved + aicSaved,
      skippedReason: metResult.saved === 0 && aicSaved === 0 ? (metResult.skippedReason || "no matches") : null,
    });
    processed++;
  }

  // ─── Summary Table ────────────────────────────────────

  console.log("\n╔═══════════════════════════════════════════════════════════════════════════════════════╗");
  console.log("║  HARVEST REPORT (FAST MODE)                                                          ║");
  console.log("╠═══════════════════════════════════════════════════════════════════════════════════════╣");
  console.log("║  artist key          | met_total | met_scanned | met_saved | aic_saved | skip_reason");
  console.log("╠═══════════════════════════════════════════════════════════════════════════════════════╣");
  for (const r of report) {
    const key = r.key.padEnd(20);
    const mt = String(r.metTotal).padStart(9);
    const ms = String(r.metScanned).padStart(11);
    const mv = String(r.metSaved).padStart(9);
    const av = String(r.aicSaved).padStart(9);
    const sk = r.skippedReason || "-";
    console.log(`║  ${key} | ${mt} | ${ms} | ${mv} | ${av} | ${sk}`);
  }

  const dbTotal = await prisma.masterpiece.count();
  const bySource = await prisma.masterpiece.groupBy({ by: ["source"], _count: true });
  console.log("╠═══════════════════════════════════════════════════════════════════════════════════════╣");
  console.log(`║  Total in DB: ${dbTotal}`);
  bySource.forEach((g) => console.log(`║    ${g.source}: ${g._count}`));
  console.log("╚═══════════════════════════════════════════════════════════════════════════════════════╝\n");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Curated harvest failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
