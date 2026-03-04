-- Verification: run BEFORE and AFTER import.
-- Replace slugs below with your expected post-import sample.

-- Counts
SELECT count(*) AS total FROM public.artworks;
SELECT count(*) AS visible FROM public.artworks WHERE is_visible = true;
SELECT count(*) AS hidden FROM public.artworks WHERE is_visible = false;

-- 10 slugs that must exist (customize list)
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
