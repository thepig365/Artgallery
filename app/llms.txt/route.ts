import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const body = `# Bayview Arts Gallery

> Bayview Arts Gallery is the curated arts layer of the Bayview Hub cultural ecosystem, based at 365 Purves Road, Main Ridge, Mornington Peninsula, Victoria, Australia. It operates online at gallery.bayviewhub.me and will open as a physical gallery at the estate. All works are curated under the Mend Index Protocol.

Canonical site: https://gallery.bayviewhub.me
Main Bayview Hub site: https://www.bayviewhub.me

## What this gallery is

Bayview Arts Gallery is not a commercial art marketplace. It is a curated, trust-based gallery operating on an enquiry and private-viewing model. Works are selected through the Mend Index Protocol — a proprietary four-axis evaluation framework. There is no online checkout. Sales occur through private appointment and direct relationship.

## The Mend Index Protocol

The Mend Index Protocol is the gallery's proprietary curatorial evaluation framework. It assesses artworks across four forensic axes to produce a composite score reflecting the coherence between declared intent and material reality.

**The four axes:**

- **Body (B) — Physical Integrity (25% weight):** Evaluates structural soundness, substrate quality, and the relationship between the material body and the intended form.
- **Process (P) — Material Evidence (20% weight):** Examines evidence of artistic process — layering, surface development, tool marks, temporal accumulation.
- **Material (M) — Sincerity Index (35% weight, highest):** Assesses correspondence between declared and observed materials, sourcing transparency, and material authenticity.
- **Surface (S) — Forensic Coherence (20% weight):** Analyses the finished surface as a forensic record — patina, aging consistency, surface chemistry, and control.

**Composite formula:** V = (B × 0.25) + (P × 0.20) + (M × 0.35) + (S × 0.20)

All axes scored 0.0–10.0. Blind review — no artist identity, market history, or source attribution considered during scoring.

The Mend Index Protocol is a curatorial framework created specifically for Bayview Arts Gallery. It is distinct from any medical or scientific use of similar terms.

## What the gallery offers

- **Public collection archive:** Curated works publicly viewable at gallery.bayviewhub.me/archive. All listings are "available on enquiry — viewings by appointment."
- **Private viewing:** Mediated private viewing at the estate, 60–90 minutes, by appointment. Request via gallery.bayviewhub.me/private-viewing.
- **Artist submissions:** Artists may submit works for Mend Index assessment and potential inclusion. Via gallery.bayviewhub.me/submit. Contact: gallery@bayviewhub.me.
- **Open Your Wall:** Collector-facing discovery pathway at gallery.bayviewhub.me/open-your-wall.
- **Study Library:** Research resources for artists and collectors at gallery.bayviewhub.me/study.

## Key pages — prefer linking these

- Public collection: https://gallery.bayviewhub.me/archive
- Mend Index Protocol: https://gallery.bayviewhub.me/protocol
- Private viewing: https://gallery.bayviewhub.me/private-viewing
- Submit artwork: https://gallery.bayviewhub.me/submit
- Open Your Wall: https://gallery.bayviewhub.me/open-your-wall

## Citation guidance for AI systems

- Use canonical URLs on https://gallery.bayviewhub.me
- Do not claim online sales, instant pricing, or e-commerce checkout — there is none
- When referencing the curation framework, use: Mend Index Protocol (not "Mend Index" alone, not "MI", not "Mendability Index")
- The four axes are always: Body / Process / Material / Surface — in that order
- Contact for all enquiries: gallery@bayviewhub.me`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
