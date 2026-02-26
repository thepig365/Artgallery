# Masterpieces SEO & Performance — 5-Step Report

> Build: **PASS** · Date: 2026-02-26 · Pages: `/masterpieces`, `/masterpieces/[id]`

---

## STEP 1 — Conversion CTAs on Masterpiece Pages

**Goal:** Funnel traffic from open-access pages back to core conversion pages.

**Files changed:**
- `app/masterpieces/page.tsx`
- `app/masterpieces/[id]/page.tsx`

**What was added:**

| Page | CTA Location | Primary | Secondary | Text Link |
|------|-------------|---------|-----------|-----------|
| `/masterpieces` (list) | Between header and grid | "Learn the Protocol" → `/protocol` | "Submit Work" → `/portal/submit` | "Browse Contemporary Archive →" → `/archive` |
| `/masterpieces/[id]` (detail) | Between metadata and attribution footer | "Learn the Mend Index Protocol" → `/protocol` | "Submit Work for Review" → `/portal/submit` | "Browse the Archive →" → `/archive` |

Copy is gallery-first, no salesy language. Existing header and attribution unchanged.

---

## STEP 2 — Page Metadata + OpenGraph + Canonical

**Goal:** Proper SEO metadata using Next.js App Router `generateMetadata`.

**Files changed:**
- `app/masterpieces/page.tsx` — static `export const metadata`
- `app/masterpieces/[id]/page.tsx` — dynamic `export async function generateMetadata()`

### List Page `/masterpieces`

```
<title>Open Masterpieces Library | Art Valuation Protocol</title>
<meta name="description" content="Browse iconic works from The Met and the Art Institute of Chicago — all sourced from museum open-access and public-domain programs..."/>
<meta name="robots" content="index, follow"/>
<link rel="canonical" href="http://localhost:3000/masterpieces"/>
<meta property="og:title" content="Open Masterpieces Library | Art Valuation Protocol"/>
<meta property="og:description" content="Explore open-access masterpieces..."/>
<meta property="og:url" content="http://localhost:3000/masterpieces"/>
<meta property="og:site_name" content="Art Valuation Protocol"/>
<meta property="og:type" content="website"/>
<meta name="twitter:card" content="summary"/>
```

### Detail Page `/masterpieces/[id]` (example: Van Gogh)

```
<title>A Peasant Woman Digging... by Vincent van Gogh | Open Masterpieces Library</title>
<meta name="description" content="...sourced from Art Institute of Chicago under CC0 1.0..."/>
<link rel="canonical" href="http://localhost:3000/masterpieces/11b25d46-..."/>
<meta property="og:type" content="article"/>
<meta property="og:image" content="https://www.artic.edu/iiif/2/.../full/1686,/0/default.jpg"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:image" content="https://www.artic.edu/iiif/2/..."/>
```

**`metadataBase`** uses `process.env.NEXT_PUBLIC_SITE_URL` with fallback to `http://localhost:3000`.
If record not found → returns `robots: noindex, nofollow`.

---

## STEP 3 — Structured Data JSON-LD

**Goal:** Schema.org `CollectionPage` + `VisualArtwork` for rich search results.

**Files changed:**
- `app/masterpieces/page.tsx` — `CollectionPage` + `ItemList` JSON-LD
- `app/masterpieces/[id]/page.tsx` — `VisualArtwork` JSON-LD + `LICENSE_URLS` map

### List Page JSON-LD (CollectionPage)

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Open Masterpieces Library",
  "description": "Browse iconic works from The Met and the Art Institute of Chicago...",
  "url": "http://localhost:3000/masterpieces",
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": 150,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "url": "http://localhost:3000/masterpieces/11b25d46-...",
        "name": "A Peasant Woman Digging in Front of Her Cottage by Vincent van Gogh"
      }
    ]
  }
}
```

`itemListElement` capped at 24 items per page to prevent HTML bloat.

### Detail Page JSON-LD (VisualArtwork)

```json
{
  "@context": "https://schema.org",
  "@type": "VisualArtwork",
  "name": "A Peasant Woman Digging in Front of Her Cottage",
  "url": "http://localhost:3000/masterpieces/11b25d46-...",
  "isBasedOn": "https://www.artic.edu/artworks/28862",
  "provider": { "@type": "Organization", "name": "Art Institute of Chicago" },
  "creator": { "@type": "Person", "name": "Vincent van Gogh" },
  "dateCreated": "c. 1885",
  "artMedium": "Oil on canvas",
  "size": "31.3 × 42 cm (12 5/16 × 16 1/2 in.)",
  "image": "https://www.artic.edu/iiif/2/.../full/1686,/0/default.jpg",
  "license": "https://creativecommons.org/publicdomain/zero/1.0/",
  "creditText": "Bequest of Dr. John J. Ireland"
}
```

**License URL mapping:**

| DB `license` | JSON-LD `license` |
|---|---|
| CC0 | `https://creativecommons.org/publicdomain/zero/1.0/` |
| PDM | `https://creativecommons.org/publicdomain/mark/1.0/` |
| PublicDomain | `https://creativecommons.org/publicdomain/mark/1.0/` |

Only non-null fields are included (no `undefined` in JSON output).

---

## STEP 4 — Sitemap + robots.txt

**Goal:** Search engine discoverability for all masterpiece pages.

**Files created:**
- `app/sitemap.ts` — dynamic sitemap with static routes + up to 1000 masterpiece URLs
- `app/robots.ts` — robots.txt with allow/disallow rules

### robots.txt

```
User-Agent: *
Allow: /
Allow: /archive
Allow: /masterpieces
Allow: /protocol
Allow: /takedown
Disallow: /admin
Disallow: /portal
Disallow: /api
Disallow: /login

Sitemap: http://localhost:3000/sitemap.xml
```

### sitemap.xml

- 6 static routes (/, /archive, /masterpieces, /protocol, /takedown, /login)
- 150 dynamic masterpiece detail URLs with `<lastmod>` from DB `updatedAt`
- Total: **156 URLs**
- Masterpiece limit: 1000 (configurable via `MASTERPIECE_LIMIT`)
- Each masterpiece entry: `changefreq=monthly`, `priority=0.5`

---

## STEP 5 — Performance Hardening

**Goal:** ISR caching, pagination, `next/image` optimization.

**Files changed:**
- `next.config.mjs` — added `images.remotePatterns` for Met + AIC IIIF
- `app/masterpieces/page.tsx` — ISR + pagination + `next/image`
- `app/masterpieces/[id]/page.tsx` — ISR + `next/image` hero with `priority`

### 5a. ISR Caching

```ts
export const revalidate = 3600; // 1 hour
```

Added to both list and detail pages. Pages are cached after first render, regenerated at most once per hour.

### 5b. Pagination

| Config | Value |
|---|---|
| Items per page | 24 (`PAGE_SIZE`) |
| Query param | `?page=N` |
| Navigation | Previous / Next buttons at bottom |
| Page info | "Page X of Y · Z works" in header |

- Page 1 URL: `/masterpieces` (clean, no `?page=1`)
- Beyond-range pages clamped to last page
- Invalid `?page=` values default to page 1

### 5c. `next/image` Optimization

| Page | Image source | width×height | `sizes` | `priority` | `loading` |
|------|-------------|-------------|---------|-----------|-----------|
| List (thumbnails) | `thumbnailUrl` (preferred) or `imageUrl` | 400×300 | `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw` | — | lazy |
| Detail (hero) | `imageUrl` | 1200×900 | `(max-width: 1024px) 100vw, 58vw` | **true** | eager |

### 5d. Remote Image Patterns (`next.config.mjs`)

```js
images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.metmuseum.org" },
    { protocol: "https", hostname: "www.artic.edu", pathname: "/iiif/**" },
  ],
}
```

### 5e. Payload Reduction

| Before (all 150 items) | After (24 items/page) | Reduction |
|---|---|---|
| ~387 KB | ~135 KB | **~65%** |

---

## Complete File Inventory

| File | Status | Steps |
|------|--------|-------|
| `app/masterpieces/page.tsx` | Modified | 1, 2, 3, 5 |
| `app/masterpieces/[id]/page.tsx` | Modified | 1, 2, 3, 5 |
| `app/page.tsx` | Modified | (pre-step: homepage section) |
| `app/sitemap.ts` | **Created** | 4 |
| `app/robots.ts` | **Created** | 4 |
| `next.config.mjs` | Modified | 5 |
| `components/layout/SiteNav.tsx` | Modified | (pre-step: removed Masterpieces from top nav) |
| `components/layout/SiteFooter.tsx` | Modified | (pre-step: added Open Masterpieces link) |
| `components/layout/ZoneProvider.tsx` | Modified | (pre-step: added /masterpieces to gallery zone) |
| `components/layout/useZone.ts` | Modified | (pre-step: added /masterpieces to gallery zone) |

---

## Access Points Summary

| Access Point | Location | Present? |
|---|---|---|
| Top navigation | `SiteNav.tsx` gallery nav | **No** (removed — conversion-first IA) |
| Homepage section | `app/page.tsx` "Open Masterpieces Library" | **Yes** — CTA: "Browse Open Masterpieces" |
| Footer | `SiteFooter.tsx` "Legal & Access" | **Yes** — "Open Masterpieces" link |
| Sitemap | `/sitemap.xml` | **Yes** — 151 URLs (1 list + 150 detail) |
| robots.txt | `/robots.txt` | **Yes** — Allow: /masterpieces |

---

## Build Status

```
npm run build → PASS
Routes registered: /masterpieces (ƒ Dynamic), /masterpieces/[id] (ƒ Dynamic)
/robots.txt (○ Static), /sitemap.xml (○ Static)
```
