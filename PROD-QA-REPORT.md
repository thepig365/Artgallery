# Production QA Report

**Base URL:** https://artgallery-bayviewhub.vercel.app  
**Date:** 2026-02-26  
**Scope:** Route health, SEO, security, env sanity, logs

---

## A) Route Health + Timing

| Route        | Status | Time   | Size   |
|-------------|--------|--------|--------|
| /           | 200    | 0.09s  | 26KB   |
| /archive    | 200    | 0.16s  | 17KB   |
| /protocol   | 200    | 0.08s  | 36KB   |
| /takedown   | 200    | 0.08s  | 18KB   |
| /masterpieces | 200  | 1.91s  | 448KB  |
| /study      | 200    | 0.09s  | 81KB   |
| /robots.txt | 200    | 0.07s  | 224B   |
| /sitemap.xml| 200    | 0.09s  | 96KB   |
| /login      | 200    | 0.08s  | 11KB   |
| /portal     | 200    | 0.44s  | 13KB   |

**Result:** All routes return 200. No 401/5xx or timeouts. `/masterpieces` ~1.9s (under 3s threshold).

---

## B) SEO Checks

### robots.txt + sitemap accessibility
- **robots.txt:** OK — Sitemap URL correct, Disallow /admin, /portal, /api, /login
- **sitemap.xml:** OK — Includes /, /archive, /masterpieces, /protocol, /takedown, /login, and many `/masterpieces/[id]` URLs
- **sitemap.xml:** `/study` and `/study/[slug]` not present (static study packs from `lib/data`)

### Head tags presence
- **/masterpieces:** `<title>`, `canonical`, `og:title`, `og:description`, `application/ld+json` — all present
- **/masterpieces/[id]:** `application/ld+json`, `VisualArtwork` schema — present

---

## C) Security Sanity

| Check | Result |
|-------|--------|
| Open redirect (`/login?redirect=https://evil.com`) | **PASS** — Returns 200, no `Location` header. `safeRedirect()` rejects non-path redirects (must start with `/` and be in `ALLOWED_REDIRECTS`). |
| /admin publicly accessible | **PASS** — Returns 200 (HTML). Client fetches `/api/admin/artworks`; on 401, redirects to `/login?redirect=/admin`. Admin data not exposed. |
| External links in study kit nofollow | **PASS** — `/study` and `/study/[slug]` use `rel="nofollow noopener noreferrer"` on external links. |

---

## D) Env Sanity (SEO correctness)

- **NEXT_PUBLIC_SITE_URL:** Sitemap and canonical URLs use `https://artgallery-bayviewhub.vercel.app` — appears correctly set in Vercel.
- **Action:** Confirm in Vercel Dashboard → Project → Settings → Environment Variables that `NEXT_PUBLIC_SITE_URL` = `https://artgallery-bayviewhub.vercel.app`.

---

## E) Logs

- Vercel CLI not installed — could not fetch last 1h errors.
- **Action:** Install `vercel` and run `vercel logs` for DB/connectivity/timeout inspection.

---

## Summary: PASS/FAIL

| Section | Status |
|---------|--------|
| A) Route health + timing | **PASS** |
| B) SEO | **PASS** (study URLs missing from sitemap — non-blocking) |
| C) Security | **PASS** |
| D) Env | **PASS** (verify in dashboard) |
| E) Logs | **N/A** (CLI not available) |

---

## P0 Bugs

**None.** No 401/5xx, no timeouts, no slow (>3s) routes.

---

## Next Actions (max 5)

1. **Add /study and /study/[slug] to sitemap** — Import `STUDY_PACKS_TOP50` and `MODERN_MASTERS` in `app/sitemap.ts`; add static `/study` and dynamic `/study/[slug]` entries.
2. **Verify NEXT_PUBLIC_SITE_URL in Vercel** — Ensure it equals `https://artgallery-bayviewhub.vercel.app` for canonical/OG correctness.
3. **Install Vercel CLI** — `npm i -g vercel` for future log inspection.
4. **Optional: add nofollow to masterpiece detail external links** — Source institution links (`sourceUrl`) currently use `rel="noopener noreferrer"` only; add `nofollow` for consistency with study kit.
5. **Optional: DB index** — If `/masterpieces` latency grows, add `@@index([license, createdAt])` on `Masterpiece` to optimize list queries.
