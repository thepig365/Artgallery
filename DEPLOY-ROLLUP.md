# Deploy Rollup

Date: 2026-02-27
Project: `gallery.bayviewhub.me`
Branch: `main`
Commit: `5bdca1c`

## What shipped

- Public archive image delivery now uses permanent public URLs from bucket `gallery-public`.
- Legacy `/api/storage` proxy is gated by `ENABLE_LEGACY_STORAGE_PROXY === "true"`.
- Default behavior with env unset is OFF: returns `410 Gone` with `cache-control: no-store`.
- Added idempotent migration script:
  - `scripts/migrate_to_gallery_public.ts`

## Migration status

Executed:

```bash
npx tsx scripts/migrate_to_gallery_public.ts --dry-run
npx tsx scripts/migrate_to_gallery_public.ts
```

Final summary:

- Public artworks considered: `6`
- Copied to `gallery-public`: `0`
- DB rows updated: `0`
- Skipped: `6`
- Failures: `0`

Meaning: migration already completed earlier; rerun is idempotent no-op.

## Production verification

### Legacy proxy disabled

Command:

```bash
curl -I https://gallery.bayviewhub.me/api/storage/anything
```

Observed headers:

```text
HTTP/2 410
cache-control: no-store
content-type: application/json; charset=utf-8
```

### Public image URLs on archive

- `/archive` HTML contains image URLs under:
  - `.../storage/v1/object/public/gallery-public/published/...`
- No public image src via `/api/storage/...` on archive cards.

## DB spot-check

Sample `artworks.imageUrl` values are object paths (no tokenized URL):

- `published/23df52b0-b88c-4e9b-8d7c-605dbaf01571/5_Seeking_in_the_wilderness.jpg`
- `published/05303f6e-da37-42b6-8aef-42928b42eb6c/6_CRADLE.jpg`
- `published/18d85d30-e1ae-4806-893f-c9b54cc44fc9/3_BY_THE_SEA_OF_GALILEE.jpg`
