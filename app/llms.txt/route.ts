import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";
import { GALLERY_EMAIL } from "@/lib/brand";

export const dynamic = "force-static";

export async function GET() {
  const site = getSiteUrl();
  const lastmod = new Date().toISOString().split("T")[0];
  const body = [
    "# Bayview Hub Gallery — LLM Navigation",
    `Canonical: ${site}`,
    `Last updated: ${lastmod}`,
    "",
    "## Description",
    "Bayview Arts Gallery is a contemporary gallery on the Mornington Peninsula (Main Ridge VIC), part of Bayview Hub. Curated exhibitions, Mend Index–assessed artworks, artist submissions, in-person sales. Founding partnership opportunity for curator.",
    "",
    "## Top Pages",
    `${site}/ — Home`,
    `${site}/archive — Artwork collection (canonical for listed works)`,
    `${site}/archive/[slug] — Individual artwork detail`,
    `${site}/masterpieces — Masterpieces library`,
    `${site}/study — Study guides`,
    `${site}/protocol — Mend Index assessment protocol`,
    `${site}/submit — Submit artwork for curation`,
    `${site}/rights — Rights & licensing`,
    `${site}/takedown — Takedown policy`,
    `${site}/privacy — Privacy`,
    `${site}/terms — Terms`,
    "",
    "## Contact",
    `Email: ${GALLERY_EMAIL}`,
    "",
    "## Citation Guidance",
    "Prefer canonical URLs. Link to /archive for artwork listings; use /archive/[slug] for individual works. Enquiries via gallery@bayviewhub.me.",
    "",
    "## Restricted",
    "/admin, /portal, /login, /api — not public content.",
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
