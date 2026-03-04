-- Run against any Supabase project to get artwork counts.
-- Usage: psql $DATABASE_URL -f scripts/recovery/count.sql
-- Or paste into Supabase SQL Editor.

SELECT count(*) AS total FROM public.artworks;
SELECT count(*) AS visible FROM public.artworks WHERE is_visible = true;
SELECT id, slug, title, is_visible, created_at FROM public.artworks ORDER BY created_at DESC LIMIT 10;
