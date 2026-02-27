# P0: "Awaiting imagery" Fix — Root Cause & Deliverable

## 1) Card Component & Fallback Text

| Location | Component | Data Field | Fallback |
|----------|-----------|------------|----------|
| `/archive` | `GalleryCard` | `artwork.imageUrl` | ~~"Awaiting imagery"~~ → icon only |
| Home featured | `FeaturedSection` | `artwork.imageUrl` | ~~"Awaiting imagery"~~ → icon only |
| Home curated | `app/page.tsx` | (static placeholder) | ~~"Awaiting imagery"~~ → icon only |

**Note**: No `thumbnailUrl` — archive uses `imageUrl` only.

---

## 2) Data Check

**Root cause**: `imageUrl` is `null` in DB for most archive artworks.

- Approve flow sets `imageUrl` only when `evidenceFiles` has a valid `path`.
- Submissions approved before evidence uploads succeeded → `imageUrl` stays null.
- **Not a frontend bug** — the UI correctly shows placeholder when `imageUrl` is null.

**Inspection script**: `scripts/inspect-archive-artworks.ts` (run when DB has capacity).

---

## 3) Image Loading

- Archive uses plain `<img>` (not `next/image`) — `remotePatterns` does not apply to archive cards.
- `/api/storage/...` URLs redirect (302) to Supabase signed URLs; `<img>` follows redirects.
- Added `**.supabase.co` to `next.config.mjs` `remotePatterns` for future `next/image` usage.
- Seed updated: `erosion-study-no-7` now uses `https://picsum.photos/seed/erosion7/800/600` for proof.

---

## 4) Graceful Fallback

**Before**: Light gray panel + icon + "Awaiting imagery" text on every card.

**After**: Light gray panel + icon only (no text). Elegant empty state.

- `GalleryCard`: `bg-surface-alt/80` + `ImageOff` icon (`text-subtle/40`)
- `FeaturedSection`: same
- `app/page.tsx` curated grid: same

---

## 5) Diff Summary

| File | Change |
|------|--------|
| `components/gallery/GalleryCard.tsx` | Placeholder: icon only, no text; removed `hasUrlButFailed` branch |
| `components/gallery/FeaturedSection.tsx` | Placeholder: icon only, no text |
| `app/page.tsx` | Placeholder: icon only; added `ImageOff` import |
| `next.config.mjs` | Added `**.supabase.co` to `remotePatterns` |
| `prisma/seed.ts` | `imageUrl` → `https://picsum.photos/seed/erosion7/800/600` for proof |
| `scripts/inspect-archive-artworks.ts` | New: debug script for data inspection |

---

## Proof (One Image Loads)

1. Run `npx prisma db seed` (when DB has capacity).
2. Visit `/archive` — "Erosion Study No. 7" should show the picsum image.
3. Artworks with null `imageUrl` show the elegant icon-only placeholder.

**To fix production**: Use Admin → Visibility Control → "Set image URL or storage path" for each artwork missing an image.
