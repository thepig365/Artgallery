# Artworks Data Recovery Runbook

**Production Supabase project:** `xarwzmsaoqgbjsrmswxz`  
**DO NOT modify app code until artworks data is restored.**

---

## Safety Guards

1. **Always run `--dry-run` first.** Do not import without reviewing the conflict report.
2. **Backup before import.** Create `artworks_backup_<timestamp>` table.
3. **No upsert by slug.** Use `id` as primary key when available; otherwise use staging + manual mapping.
4. **Conflicts block import** unless `--force` is provided. Resolve conflicts manually before re-running.

---

## Step 0: Pre-Import Backup (Required)

Run in **Production SQL Editor** before any import:

```sql
-- Creates a point-in-time backup. Run BEFORE import.
CREATE TABLE public.artworks_backup_20260227 AS SELECT * FROM public.artworks;

-- Verify backup count matches current
SELECT count(*) AS backup_count FROM public.artworks_backup_20260227;
SELECT count(*) AS current_count FROM public.artworks;
```

**Rollback (if import goes wrong):**
```sql
-- 1. Truncate production artworks (ensure no FK violations from dependent tables first)
TRUNCATE public.artworks CASCADE;  -- CASCADE only if you intend to restore related data too

-- 2. Restore from backup
INSERT INTO public.artworks SELECT * FROM public.artworks_backup_20260227;

-- 3. Verify
SELECT count(*) FROM public.artworks;
```

**Optional automated backup** (run via `psql`):
```bash
psql "$DATABASE_URL" -c "CREATE TABLE public.artworks_backup_$(date +%Y%m%d%H%M) AS SELECT * FROM public.artworks;"
```

**Scripts:** See `scripts/recovery/backup.sql` (template) and `scripts/recovery/rollback.sql` (rollback options).

---

## Step 1: Evidence — Count in Production (BEFORE)

In **Supabase Dashboard → SQL Editor** for project `xarwzmsaoqgbjsrmswxz`:

```sql
SELECT count(*) AS total FROM public.artworks;
SELECT count(*) AS visible FROM public.artworks WHERE is_visible = true;
SELECT count(*) AS hidden FROM public.artworks WHERE is_visible = false;
SELECT id, slug, title, is_visible FROM public.artworks ORDER BY created_at DESC LIMIT 10;
```

**Paste results (BEFORE):**
```
total: ___
visible: ___
hidden: ___
Sample slugs: ___
```

---

## Step 2: Find Source — Check Other Supabase Projects

Run in each candidate source:

```sql
SELECT count(*) AS total FROM public.artworks;
SELECT id, slug FROM public.artworks ORDER BY created_at DESC LIMIT 5;
```

**Record which project has the artworks to restore.**

---

## Step 3: Export from Source

```bash
DATABASE_URL="postgresql://...[SOURCE]..." npx tsx scripts/recovery/export-artworks.ts
```

Output: `artworks_export_<timestamp>.csv`

---

## Step 4: Dry-Run Import (Required First)

```bash
DATABASE_URL="postgresql://...[PROD]..." npx tsx scripts/recovery/import-artworks-upsert.ts --dry-run artworks_export_XXX.csv
```

Review the report. If `conflicts_by_slug > 0` or `conflicts_by_id > 0`, the script exits with code 1. Resolve conflicts (staging table + manual mapping) or use `--force` to proceed with non-conflict rows only (conflicted rows are skipped and still require manual resolution).

**Example dry-run output (no conflicts):**
```
--- DRY RUN (no writes) ---

incoming_rows:            42
duplicate_slugs_in_csv:   0
existing_prod_rows:       2
would_insert:             40
would_update:             2
conflicts_by_slug:        0
conflicts_by_id:          0

--- Conflict Report ---
conflicts_by_slug: []
conflicts_by_id: []

--- Sample would_insert ---
sunset, 6-cradle, by-the-sea-of-galilee, seeking-in-the-wilderness-07, sanctuary-of-green

--- Sample would_update ---
erosion-study-no-7, compression-field-ii

Exit: 0 (no conflicts)
```

**Example dry-run output (with conflicts — blocks import):**
```
--- DRY RUN (no writes) ---

incoming_rows:            45
duplicate_slugs_in_csv:   0
existing_prod_rows:       2
would_insert:             40
would_update:             2
conflicts_by_slug:        3
conflicts_by_id:           0

--- Conflict Report ---
conflicts_by_slug: [
  { "slug": "sunset", "sourceId": "abc-123", "prodId": "xyz-789" },
  ...
]

--- Sample would_insert ---
...

Exit: 1 (conflicts)
```
Run with `--force` to apply only non-conflict rows (would_insert + would_update); conflicted rows are skipped and require manual mapping via staging table.

---

## Step 5: Staging Table (When Conflicts Exist)

If dry-run reports conflicts, load CSV into staging for manual mapping:

```sql
-- Create staging table (run once per import batch)
CREATE TABLE IF NOT EXISTS public.artworks_import_staging (
  LIKE public.artworks INCLUDING ALL
);
ALTER TABLE public.artworks_import_staging
  ADD COLUMN IF NOT EXISTS source_project_ref TEXT,
  ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ DEFAULT now();

-- After loading CSV data into artworks_import_staging (via Table Editor or COPY):
-- Produce conflict report
SELECT s.id AS source_id, s.slug, p.id AS prod_id, p.slug AS prod_slug
FROM public.artworks_import_staging s
JOIN public.artworks p ON p.slug = s.slug AND p.id != s.id
ORDER BY s.slug;
```

Resolve conflicts: either remap slugs, merge data, or exclude conflicting rows. Then run a manual INSERT from staging for non-conflict rows only.

---

## Step 6: Apply Import (After Dry-Run OK)

```bash
# With backup already created (Step 0)
DATABASE_URL="postgresql://...[PROD]..." npx tsx scripts/recovery/import-artworks-upsert.ts artworks_export_XXX.csv
```

To proceed with non-conflict rows only when conflicts exist (conflicted rows are skipped):
```bash
npx tsx scripts/recovery/import-artworks-upsert.ts --force artworks_export_XXX.csv
```

---

## Step 7: Verification (AFTER)

Run in Production SQL Editor (or `psql $DATABASE_URL -f scripts/recovery/verification.sql`):

```sql
-- Counts
SELECT count(*) AS total_after FROM public.artworks;
SELECT count(*) AS visible_after FROM public.artworks WHERE is_visible = true;
SELECT count(*) AS hidden_after FROM public.artworks WHERE is_visible = false;

-- 10 slugs that must exist post-import (replace with your expected slugs)
SELECT slug, title, is_visible FROM public.artworks
WHERE slug IN (
  'erosion-study-no-7',
  'compression-field-ii',
  '6-cradle',
  'by-the-sea-of-galilee',
  'sunset',
  'sanctuary-of-green',
  'seeking-in-the-wilderness-07',
  'hatbalah',
  'indigo-memory-cloth',
  'example-slug-10'
)
ORDER BY slug;
```

**Paste results (AFTER):**
```
total_after: ___
visible_after: ___
hidden_after: ___
10 slugs verified: ___
```

---

## Artworks Table Schema (CSV columns)

```
id, title, slug, medium, year, dimensions, materials, narrative,
source_url, image_url, source_license_status,
score_b, score_p, score_m, score_s, final_v,
is_visible, hidden_reason, hidden_at, hidden_by, owner_auth_uid,
artist_id, created_at, updated_at
```

**Note:** `artist_id` must reference existing `artists.id`. Import artists first if source has different artists.
