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
    `- Archive: ${site}/archive`,
    `- Assessment Protocol: ${site}/protocol`,
    `- Submit Artwork: ${site}/submit`,
    `- Rights & Licensing: ${site}/rights`,
    `- About: ${site}/about`,
    `- Contact: ${site}/contact`,
    "",
    "## Canonical artwork source",
    `- Canonical artwork pages are under: ${site}/archive/[slug]`,
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
