import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/client";

import { MODERN_MASTERS_DATA } from "@/lib/data/modern-masters";
import { STUDY_PACKS_TOP50 } from "@/lib/data/study-packs-top50";
import { getSiteUrl } from "@/lib/site-url";
const SITE_URL = getSiteUrl();
const MASTERPIECE_LIMIT = 1000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/archive`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/masterpieces`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/study`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/protocol`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/takedown`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/login`, changeFrequency: "yearly", priority: 0.2 },
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

  const masterpieces = await prisma.masterpiece.findMany({
    where: { license: { in: ["CC0", "PDM", "PublicDomain"] } },
    select: { id: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
    take: MASTERPIECE_LIMIT,
  });

  const masterpieceRoutes: MetadataRoute.Sitemap = masterpieces.map((m) => ({
    url: `${SITE_URL}/masterpieces/${m.id}`,
    lastModified: m.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...studyRoutes, ...masterpieceRoutes];
}
