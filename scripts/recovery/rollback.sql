-- Rollback: restore artworks from backup. Use only if import went wrong.
-- Replace YYYYMMDDHHMM with your backup table suffix.

-- 1. Option A: Replace artworks entirely (drops dependent data - use with caution)
-- TRUNCATE public.artworks CASCADE;
-- INSERT INTO public.artworks SELECT * FROM public.artworks_backup_YYYYMMDDHHMM;

-- 2. Option B: Delete only rows that were inserted (requires tracking insert ids)
-- Manual: delete by id list from import log.

-- 3. Verify after rollback
SELECT count(*) FROM public.artworks;
