import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/client";
import { Prisma, WallPublication } from "@prisma/client";

import { MODERN_MASTERS_DATA } from "@/lib/data/modern-masters";
import { STUDY_PACKS_TOP50 } from "@/lib/data/study-packs-top50";
import { toGalleryPublicUrl } from "@/lib/supabase/gallery-public";
import { SITE_URL } from "@/lib/site-url";
const MASTERPIECE_LIMIT = 1000;

/**
 * Safely load masterpieces, returning empty array if table doesn't exist (P2021)
 */
async function loadMasterpieces(): Promise<{ id: string; updatedAt: Date }[]> {
  try {
    return await prisma.masterpiece.findMany({
      where: { license: { in: ["CC0", "PDM", "PublicDomain"] } },
      select: { id: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
      take: MASTERPIECE_LIMIT,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021") {
      console.warn("[Sitemap] masterpieces table missing; skipping.");
      return [];
    }
    console.error("[Sitemap] Failed to load masterpieces:", err);
    return [];
  }
}

/**
 * Safely load artworks, returning empty array if table doesn't exist (P2021)
 */
async function loadArchiveArtworks(): Promise<{ slug: string; updatedAt: Date; imageUrl: string | null }[]> {
  try {
    return await prisma.artwork.findMany({
      where: { isVisible: true },
      select: { slug: true, updatedAt: true, imageUrl: true },
      orderBy: { createdAt: "desc" },
      take: 2000,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021") {
      console.warn("[Sitemap] artworks table missing; skipping.");
      return [];
    }
    console.error("[Sitemap] Failed to load archive artworks:", err);
    return [];
  }
}

/**
 * Public Private Walls detail URLs — only rows published to the programme with a slug.
 */
async function loadPrivateWallSlugs(): Promise<{ publicSlug: string; updatedAt: Date }[]> {
  try {
    const rows = await prisma.hostPassport.findMany({
      where: {
        wallPublication: WallPublication.PUBLIC_PRIVATE_WALLS,
        publicSlug: { not: null },
      },
      select: { publicSlug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    });
    return rows.filter((r): r is { publicSlug: string; updatedAt: Date } => r.publicSlug != null);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021") {
      console.warn("[Sitemap] host_passports table missing; skipping private walls URLs.");
      return [];
    }
    console.error("[Sitemap] Failed to load private walls slugs:", err);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/archive`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/open-your-wall`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${SITE_URL}/art-work-for-private-walls`, changeFrequency: "weekly", priority: 0.72 },
    { url: `${SITE_URL}/passport`, changeFrequency: "monthly", priority: 0.65 },
    { url: `${SITE_URL}/passport/register`, changeFrequency: "monthly", priority: 0.65 },
    { url: `${SITE_URL}/private-viewing`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/submit`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/rights`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/masterpieces`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/study`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/protocol`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/takedown`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const studySlugs = [
    ...MODERN_MASTERS_DATA.map((m) => m.slug),
    ...STUDY_PACKS_TOP50.map((p) => p.slug),
  ];
  const studyRoutes: MetadataRoute.Sitemap = studySlugs.map((slug) => ({
    url: `${SITE_URL}/study/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const masterpieces = await loadMasterpieces();

  const masterpieceRoutes: MetadataRoute.Sitemap = masterpieces.map((m) => ({
    url: `${SITE_URL}/masterpieces/${m.id}`,
    lastModified: m.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const archiveArtworks = await loadArchiveArtworks();

  const archiveRoutes: MetadataRoute.Sitemap = archiveArtworks.map((a) => ({
    url: `${SITE_URL}/archive/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    images: toGalleryPublicUrl(a.imageUrl) ? [toGalleryPublicUrl(a.imageUrl)!] : [],
  }));

  const privateWallRows = await loadPrivateWallSlugs();
  const privateWallRoutes: MetadataRoute.Sitemap = privateWallRows.map((w) => ({
    url: `${SITE_URL}/art-work-for-private-walls/${w.publicSlug}`,
    lastModified: w.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  return [
    ...staticRoutes,
    ...archiveRoutes,
    ...privateWallRoutes,
    ...studyRoutes,
    ...masterpieceRoutes,
  ];
}
