# Image Loading Logic — Archive & Gallery

## Flow Overview

1. **Data source**: `getPublicArtworks()` fetches from DB with `imageUrl` (nullable).
2. **Display**: `GalleryCard` shows image when `imageUrl` exists and load succeeds; otherwise placeholder.
3. **Placeholder text**:
   - `"Awaiting imagery"` — no `imageUrl` in DB (never set or null).
   - `"Image failed to load"` — `imageUrl` exists but load failed (404, network, etc.).

## When `imageUrl` Is Set

- **Approval**: When admin approves a submission, `imageUrl` is set from the first evidence file path:
  - `evidenceFiles[].path` → `/api/storage/{path}`
  - If no evidence files with valid `path`, `imageUrl` stays `null`.
- **Admin**: In Visibility Control, admin can manually set `imageUrl` for artworks with no image.

## Why All Images Show "Awaiting imagery"

Most likely: **`imageUrl` is `null` in the DB** for all artworks.

- Submissions were approved when evidence uploads had failed (no `path` in `evidenceFiles`).
- Or submissions had no evidence files at all.

**Fix**: Use Admin → Visibility Control → "Set image URL or storage path" for each artwork, or ensure future submissions have successful evidence uploads before approval.

## Why Images "Disappear" on Refresh

- **If `imageUrl` is null**: Placeholder shows every time (expected).
- **If `imageUrl` exists but load fails**: `onError` fires → placeholder. On refresh, state resets, img retries, fails again → placeholder. Same result.
- **Retry**: `GalleryCard` retries once on error; if both attempts fail, shows "Image failed to load".

## `/api/storage/` Proxy

- **URL**: `/api/storage/{path}` (e.g. `/api/storage/intake/uid/2026/02/xxx/file.jpg`)
- **Behavior**: Generates a signed Supabase URL, redirects (302) to it.
- **Expiry**: Signed URLs expire in 1 hour; each request gets a fresh one.
- **Failure**: 404 if file not in bucket; 503 if Supabase unavailable.
