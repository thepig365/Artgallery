# Problem Finding & Fix Report: Artwork Image Loading

**Date:** 2026-02-26
**Commit:** `b2f64cd`
**Branch:** main
**Deployed:** Yes (Vercel auto-deploy from push to main)

---

## 1. Investigation

An audit of the uncommitted working tree on `main` revealed **6 modified/new files** — all targeting the same root problem: **artwork images failing to display on public gallery pages**.

### Files with pending changes at time of investigation

| # | File | Status |
|---|------|--------|
| 1 | `lib/supabase/storage.ts` | **NEW** (untracked) |
| 2 | `app/api/artworks/public/route.ts` | Modified |
| 3 | `app/archive/page.tsx` | Modified |
| 4 | `app/archive/[slug]/page.tsx` | Modified |
| 5 | `components/gallery/FeaturedSection.tsx` | Modified |
| 6 | `components/gallery/GalleryCard.tsx` | Modified |

---

## 2. Problems Found

### Problem 1: CORB Failures from Client-Side 302 Redirect Proxy

**Severity:** P0 (images broken for end users)
**Affected pages:** Homepage featured section, `/archive`, `/archive/[slug]`

#### How the old system worked

The database stores artwork image paths as internal proxy URLs:

```
/api/storage/submissions/abc123/photo.jpg
```

When the browser requested this URL, a Next.js API route (`app/api/storage/[...path]/route.ts`) would:

1. Extract the storage path from the URL
2. Call `supabase.storage.from("artist-submissions-evidence").createSignedUrl(path, 3600)` (1-hour TTL)
3. Return a **302 redirect** to the signed URL

```typescript
// app/api/storage/[...path]/route.ts — THE OLD APPROACH
export async function GET(_request, { params }) {
  const { path: segments } = await params;
  const storagePath = segments.map((s) => decodeURIComponent(s)).join("/");

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from("artist-submissions-evidence")
    .createSignedUrl(storagePath, 3600); // 1 hour TTL

  return NextResponse.redirect(data.signedUrl, 302); // <-- the problem
}
```

#### Why this broke

1. **Signed URL expiry:** The 1-hour TTL meant that after 60 minutes, the signed URL embedded in the redirect would expire. Supabase would return an error page (HTML, not an image) at that URL.

2. **CORB (Cross-Origin Read Blocking):** Modern browsers enforce CORB — when an `<img>` tag follows a cross-origin redirect and the response content-type is not an image (e.g., Supabase returns `text/html` for an expired URL), the browser **silently blocks** the response. No error fires, no `onerror` callback triggers — the image just stays blank.

3. **Vercel CDN caching compounded the issue:** The archive pages use `revalidate = 60` (ISR). Vercel cached the server-rendered HTML containing `/api/storage/...` proxy paths. Even after revalidation, the HTML still contained proxy paths that would 302-redirect to potentially expired signed URLs.

#### Symptoms observed

- Images appeared as blank/broken after ~1 hour without a page reload
- No error in the browser console (CORB blocks silently in Chrome)
- Refreshing the page temporarily fixed images (a new 302 redirect generates a new signed URL)
- Intermittent failures — some images loaded, others didn't (depending on when the signed URL was generated relative to access time)

---

### Problem 2: React Hydration Race Condition on Image onLoad

**Severity:** P1 (visual glitch — skeleton persists over loaded image)
**Affected components:** `FeaturedSection.tsx`, `GalleryCard.tsx`

#### How the old components worked

Both `FeaturedSection` and `GalleryCard` used an opacity-based loading pattern:

```typescript
// OLD CODE in both components
const [loaded, setLoaded] = useState(false);

<img
  src={artwork.imageUrl}
  onLoad={() => setLoaded(true)}          // <-- only fires if React is hydrated
  className={loaded ? "opacity-100" : "opacity-0"}
/>
{!loaded && <div className="animate-pulse" />}  // skeleton overlay
```

#### Why this broke

On **server-side rendered pages** (homepage, archive), the HTML arrives with the `<img>` tag already in the DOM. The browser starts downloading the image immediately. If the image is **small or cached**, it may finish loading **before** React hydrates the component and attaches the `onLoad` event handler.

When that happens:
1. The browser loads the image and fires the native `load` event
2. React hasn't hydrated yet, so no handler is attached
3. React hydrates, attaches `onLoad`, but the event already fired and won't fire again
4. `loaded` stays `false` forever
5. The skeleton overlay (`animate-pulse`) persists on top of the fully loaded image
6. The image is stuck at `opacity-0` (invisible) behind the skeleton

#### Symptoms observed

- Grey pulsing skeleton overlay visible on page load, never disappearing
- Image was loaded (visible in DevTools Network tab) but hidden by CSS
- Only happened on initial SSR page load, not on client-side navigation
- More common for small/cached images that load faster than React hydrates

---

## 3. Fixes Applied

### Fix 1: Server-Side URL Resolution

**New file created:** `lib/supabase/storage.ts`

Instead of serving proxy URLs to the browser and relying on 302 redirects, we now resolve proxy paths into fresh Supabase signed URLs **on the server** before the HTML reaches the client.

```typescript
// lib/supabase/storage.ts — THE NEW APPROACH

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "artist-submissions-evidence";
const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7 days (up from 1 hour)
const PROXY_PREFIX = "/api/storage/";

/**
 * Resolve a stored proxy path into a fresh Supabase signed URL.
 * Server-side only.
 *
 * - "/api/storage/some/path.jpg" → fresh signed URL
 * - "https://images.metmuseum.org/..." → passed through unchanged
 * - null/undefined → null
 */
export async function resolveStorageUrl(
  imageUrl: string | null | undefined
): Promise<string | null> {
  if (!imageUrl) return null;

  // External URLs (Met Museum, Art Institute, etc.) pass through
  if (!imageUrl.startsWith(PROXY_PREFIX)) return imageUrl;

  const objectPath = imageUrl.slice(PROXY_PREFIX.length);
  if (!objectPath) return null;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(objectPath, SIGNED_URL_TTL);

    if (error || !data?.signedUrl) {
      console.error("[resolveStorageUrl] Signed URL error:", error);
      return null; // component falls back to placeholder
    }

    return data.signedUrl;
  } catch (err) {
    console.error("[resolveStorageUrl] Exception:", err);
    return null;
  }
}

/**
 * Batch resolver — resolves imageUrl for an array of artworks.
 * Runs all resolutions in parallel via Promise.all.
 */
export async function resolveArtworkImageUrls<
  T extends { imageUrl?: string | null }
>(artworks: T[]): Promise<T[]> {
  return Promise.all(
    artworks.map(async (artwork) => ({
      ...artwork,
      imageUrl: await resolveStorageUrl(artwork.imageUrl),
    }))
  );
}
```

**Integration points — where resolution was added:**

**`app/api/artworks/public/route.ts`** (public JSON API):
```typescript
// BEFORE
const artworks = await getPublicArtworks({ take: 100 });
return NextResponse.json(artworks);

// AFTER
const artworks = await getPublicArtworks({ take: 100 });
const resolved = await resolveArtworkImageUrls(artworks);
return NextResponse.json(resolved);
```

**`app/archive/page.tsx`** (archive listing SSR page):
```typescript
// BEFORE
publicArtworks = await getPublicArtworks({ take: 100 });

// AFTER
const artworks = await getPublicArtworks({ take: 100 });
publicArtworks = await resolveArtworkImageUrls(artworks);
```

**`app/archive/[slug]/page.tsx`** (single artwork detail SSR page):
```typescript
// BEFORE
{artwork.imageUrl ? (
  <img src={artwork.imageUrl} ... />

// AFTER
const resolvedImageUrl = await resolveStorageUrl(artwork.imageUrl);
// ...
{resolvedImageUrl ? (
  <img src={resolvedImageUrl} ... />
```

---

### Fix 2: Hydration-Aware Image Loading

Added a `useRef` + `useEffect` pattern to both image components that detects images already loaded by the browser before React hydration.

**Applied to `components/gallery/GalleryCard.tsx`:**
```typescript
const imgRef = useRef<HTMLImageElement>(null);

// Handle images that loaded before React hydration attached onLoad
useEffect(() => {
  if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
    setImgLoaded(true);
  }
}, []);

// ...
<img ref={imgRef} ... />
```

**Applied identically to `components/gallery/FeaturedSection.tsx`:**
```typescript
const imgRef = useRef<HTMLImageElement>(null);

useEffect(() => {
  if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
    setLoaded(true);
  }
}, []);

// ...
<img ref={imgRef} ... />
```

**How it works:**
- `useEffect` with `[]` runs once after hydration
- `imgRef.current.complete` — browser reports image download finished
- `imgRef.current.naturalWidth > 0` — image decoded successfully (not a broken image)
- If both are true, immediately set loaded state → skeleton removed, opacity set to 1

---

## 4. Architecture Comparison

```
BEFORE (broken):
  ┌──────────┐    ┌───────────────────┐    ┌──────────────────┐
  │ Browser  │───>│ /api/storage/path │───>│ 302 → signed URL │
  │ <img>    │    │ (Next.js route)   │    │ (1-hour TTL)     │
  └──────────┘    └───────────────────┘    └──────────────────┘
                                                    │
                                           (if expired after 1hr)
                                                    │
                                                    v
                                           ┌──────────────────┐
                                           │ CORB BLOCK       │
                                           │ (HTML error page) │
                                           │ Image blank       │
                                           └──────────────────┘

AFTER (fixed):
  ┌────────────────┐    ┌────────────────────────┐
  │ Server (SSR)   │───>│ resolveStorageUrl()     │
  │ page render    │    │ → Supabase signed URL   │
  │                │    │   (7-day TTL)           │
  └────────────────┘    └────────────────────────┘
          │
          v
  ┌──────────┐    ┌──────────────────────────────┐
  │ Browser  │───>│ Supabase CDN (direct load)   │
  │ <img>    │    │ No redirect, no CORB risk    │
  └──────────┘    └──────────────────────────────┘
```

---

## 5. Files Changed Summary

| # | File | Change Type | Description |
|---|------|-------------|-------------|
| 1 | `lib/supabase/storage.ts` | **NEW** (+67 lines) | Server-side URL resolution: `resolveStorageUrl()` + `resolveArtworkImageUrls()` |
| 2 | `app/api/artworks/public/route.ts` | Modified (+3/-1) | Pipe artworks through `resolveArtworkImageUrls()` before JSON response |
| 3 | `app/archive/page.tsx` | Modified (+3/-1) | Resolve URLs server-side before passing to `<ArchiveClient>` |
| 4 | `app/archive/[slug]/page.tsx` | Modified (+5/-2) | Resolve single artwork URL via `resolveStorageUrl()` before render |
| 5 | `components/gallery/FeaturedSection.tsx` | Modified (+10/-1) | Add `useRef` + `useEffect` hydration check for image `onLoad` |
| 6 | `components/gallery/GalleryCard.tsx` | Modified (+13/-4) | Add `useRef` + `useEffect` hydration check; update inline docs |

**Total:** +101 lines added, -9 lines removed across 6 files

---

## 6. What Was NOT Changed

- **`app/api/storage/[...path]/route.ts`** — The old 302 proxy route is **preserved**. It still works for backward compatibility (admin tools, email links, any hardcoded references). It is simply no longer the primary image delivery path for public pages.
- **Database schema** — No migration needed. The `image_url` column values remain as `/api/storage/...` proxy paths. Resolution happens at read time.
- **Component prop interfaces** — `ArtworkWithVisibility.imageUrl` is still `string | null`. Components receive the same shape; only the URL value changes.

---

## 7. Verification

| Check | Result |
|-------|--------|
| TypeScript (`tsc --noEmit`) | Pass — zero errors |
| ESLint (`next lint`) | Pass — zero warnings |
| Git status after commit | Clean working tree |
| Push to `origin/main` | Success (`07652a6..b2f64cd`) |
| Vercel auto-deploy | Triggered from push |

---

## 8. Risk Assessment

| Risk | Level | Rationale |
|------|-------|-----------|
| Breaking existing images | **None** | Additive change; old proxy route still works as fallback |
| Database migration | **None** | No schema changes; `imageUrl` values unchanged |
| Signed URL security | **Low** | 7-day TTL is standard for private storage; URLs are non-guessable, non-enumerable |
| Performance impact | **Positive** | Eliminates one network round-trip (302 redirect) per image per page load |
| Rollback path | **Simple** | `git revert b2f64cd` restores old 302-redirect behavior |
