import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export async function GET() {
  const site = getSiteUrl();
  const body = [
    "# Bayview Hub Gallery - LLM Index (Optional)",
    "",
    "This file is provided for LLM consumption only.",
    "It is not a search ranking requirement.",
    "",
    "## Key pages",
    `- Home: ${site}/`,
    `- Archive: ${site}/archive`,
    `- Artwork detail pattern: ${site}/archive/[slug]`,
    `- Masterpieces Library: ${site}/masterpieces`,
    `- Study Guides: ${site}/study`,
    `- Assessment Protocol: ${site}/protocol`,
    `- Submit Artwork: ${site}/submit`,
    `- Rights & Licensing: ${site}/rights`,
    `- Takedown Policy: ${site}/takedown`,
    `- Privacy: ${site}/privacy`,
    `- Terms: ${site}/terms`,
    "",
    "## Canonical artwork source",
    `- Canonical artwork pages are under: ${site}/archive/[slug]`,
    "",
    "## Crawl/index references",
    `- Robots: ${site}/robots.txt`,
    `- Sitemap: ${site}/sitemap.xml`,
    "",
    "## Restricted areas (not public content)",
    `- /admin, /portal, /login, /api`,
    "",
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
