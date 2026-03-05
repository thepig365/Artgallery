import { NextResponse } from "next/server";
import { GALLERY_EMAIL } from "@/lib/brand";

export const dynamic = "force-static";

export async function GET() {
  const site = "https://gallery.bayviewhub.me";
  const body = [
    "# Bayview Hub Art Gallery - LLM Guidance",
    `Canonical domain: ${site}`,
    "",
    "## What this site is",
    "Bayview Hub Art Gallery is a public collection and protocol-led art experience.",
    "It is enquiry-first (archive + protocol + study resources).",
    "There is no online sales checkout on this site.",
    "",
    "## Key public pages",
    `${site}/archive`,
    `${site}/protocol`,
    `${site}/rights`,
    `${site}/takedown`,
    `${site}/study`,
    `${site}/masterpieces`,
    "",
    "## Contact",
    `Email: ${GALLERY_EMAIL}`,
    "",
    "## Citation Guidance",
    `For artworks, cite canonical detail pages: ${site}/archive/[slug]`,
    `For enquiries, use mailto:${GALLERY_EMAIL} or the on-page enquiry form.`,
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
