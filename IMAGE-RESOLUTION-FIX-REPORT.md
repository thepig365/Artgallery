# Image Resolution Fix Report

**Date:** 2026-02-26
**Branch:** main
**Status:** Fixed & Deployed

---

## Problem Summary

Gallery artwork images were intermittently failing to load on the public-facing archive pages and homepage featured section. Two distinct but related issues were identified:

### Issue 1: CORB Failures from 302 Redirect Proxy

**Root Cause:** Artwork images stored in Supabase private storage were served through a client-side proxy route (`/api/storage/[...path]`). This proxy generated a short-lived signed URL (1-hour TTL) and returned a **302 redirect** to the browser. When the signed URL expired or Supabase returned a non-image content type (e.g., an error page), the browser's **Cross-Origin Read Blocking (CORB)** policy blocked the response entirely, resulting in broken images with no visible error.

**Symptoms:**
- Images appeared as blank/broken on page load or after the 1-hour signed URL expired
- No clear error in the browser console (CORB blocks silently)
- Refreshing the page temporarily fixed the issue (new signed URL generated)
- The problem was worse on pages cached by Vercel's CDN, where the HTML was served with stale `/api/storage/...` proxy paths that then triggered redirects to expired URLs

### Issue 2: Hydration Race Condition with Image onLoad

**Root Cause:** In server-side rendered (SSR) pages, the browser may finish loading an image **before** React hydrates the component and attaches the `onLoad` event handler. When this happened, the `onLoad` callback never fired, so the component's `loaded`/`imgLoaded` state remained `false` — causing the skeleton placeholder to persist indefinitely over a fully loaded image.

**Symptoms:**
- Images visually loaded but the grey skeleton overlay never disappeared
- The image was visible underneath the skeleton (opacity transition stuck)
- Only affected fast-loading images on SSR pages (homepage featured section, archive pages)
- Did not affect client-side navigation (only initial page load)

---

## Solution

### Fix 1: Server-Side URL Resolution (replaces client-side 302 redirects)

**New file:** `lib/supabase/storage.ts`

Created a server-side URL resolution layer that converts stored proxy paths (`/api/storage/<path>`) into fresh Supabase signed URLs **at request time**, before the HTML reaches the browser. This eliminates the 302 redirect entirely.

**Key design decisions:**
- **7-day signed URL TTL** (up from 1-hour) — longer TTL reduces re-signing frequency while still being secure for private storage
- **Passthrough for full URLs** — images from external sources (Met Museum, Art Institute of Chicago) are returned unchanged
- **Null-safe** — returns `null` if the path is missing or signing fails, so components fall back to the placeholder gracefully
- **Batch resolver** (`resolveArtworkImageUrls`) — resolves all artwork URLs in parallel via `Promise.all` for listing pages

**Files modified:**
| File | Change |
|------|--------|
| `lib/supabase/storage.ts` | NEW — `resolveStorageUrl()` and `resolveArtworkImageUrls()` |
| `app/api/artworks/public/route.ts` | Resolve URLs before JSON response |
| `app/archive/page.tsx` | Resolve URLs before passing to client components |
| `app/archive/[slug]/page.tsx` | Resolve single artwork URL before rendering |

### Fix 2: Hydration-Aware Image Loading (imgRef + useEffect)

Added a `useRef` on the `<img>` element and a `useEffect` hook that checks `imgRef.current.complete && imgRef.current.naturalWidth > 0` on mount. If the image was already loaded by the browser before React hydration, the loaded state is set immediately — removing the skeleton.

**Files modified:**
| File | Change |
|------|--------|
| `components/gallery/FeaturedSection.tsx` | Added `imgRef` + hydration check `useEffect` |
| `components/gallery/GalleryCard.tsx` | Added `imgRef` + hydration check `useEffect` |

---

## Architecture Before vs After

```
BEFORE (broken):
  Browser → /api/storage/path.jpg → 302 redirect → Supabase signed URL (1hr TTL)
                                      ↓ (if expired)
                                    CORB block → broken image

AFTER (fixed):
  Server (SSR) → resolveStorageUrl("/api/storage/path.jpg")
               → Supabase signed URL (7-day TTL)
               → HTML contains direct signed URL
  Browser → loads image directly from Supabase CDN (no redirect)
```

---

## Files Changed (6 total)

| File | Type | Lines Changed |
|------|------|--------------|
| `lib/supabase/storage.ts` | NEW | +67 |
| `app/api/artworks/public/route.ts` | Modified | +3 / -1 |
| `app/archive/page.tsx` | Modified | +3 / -1 |
| `app/archive/[slug]/page.tsx` | Modified | +5 / -2 |
| `components/gallery/FeaturedSection.tsx` | Modified | +10 / -1 |
| `components/gallery/GalleryCard.tsx` | Modified | +13 / -4 |

**Total:** +34 additions / -9 deletions across 6 files

---

## Verification

- TypeScript: `tsc --noEmit` passes with zero errors
- ESLint: `next lint` passes with zero warnings
- The existing `/api/storage/[...path]` proxy route is preserved for backward compatibility (e.g., admin tools, email links) but is no longer the primary image delivery path for public pages

---

## Risk Assessment

- **Low risk:** Changes are additive; the old proxy route still works as a fallback
- **No database migration required:** No schema changes; `imageUrl` column values are unchanged
- **No breaking changes:** Components receive the same prop shape; only the URL value changes from a proxy path to a direct signed URL
- **Rollback:** Reverting this commit restores the old 302-redirect behavior
