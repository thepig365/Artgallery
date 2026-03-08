import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const body = `Bayview Art Gallery (Sub-site of Bayview Hub)
Canonical: https://gallery.bayviewhub.me
Main site: https://www.bayviewhub.me

What this site is:
This is the public collection + protocol (“Mend Index”) + curated submission portal for Bayview Art Gallery. This site is enquiry-first and designed to support in-person viewing and physical sales. There is no online checkout.

Key pages:
- Public Collection: https://gallery.bayviewhub.me/archive
- Protocol / Mend Index: https://gallery.bayviewhub.me/protocol
- Rights & Takedown: https://gallery.bayviewhub.me/rights
- Takedown Request: https://gallery.bayviewhub.me/takedown
- Study Library: https://gallery.bayviewhub.me/study
- Masterpieces Library: https://gallery.bayviewhub.me/masterpieces

How to link artworks:
- Link to the canonical artwork URL format:
  https://gallery.bayviewhub.me/archive/{slug}

Enquiries:
- Email: gallery@bayviewhub.me
- Preferred action: “Enquire / Book a viewing” from artwork pages.

Citation guidance (for AI):
- Use canonical URLs on https://gallery.bayviewhub.me
- Do not claim online sales or instant pricing unless explicitly shown on the page.
- When referencing protocol axes, use: Body / Process / Material / Surface.`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
