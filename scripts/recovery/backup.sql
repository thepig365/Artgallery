-- Pre-import backup. Run in Production SQL Editor BEFORE any import.
-- Replace YYYYMMDDHHMM with actual timestamp (e.g. 202602271430).

CREATE TABLE public.artworks_backup_YYYYMMDDHHMM AS SELECT * FROM public.artworks;

-- Verify
SELECT count(*) AS backup_count FROM public.artworks_backup_YYYYMMDDHHMM;
SELECT count(*) AS current_count FROM public.artworks;
