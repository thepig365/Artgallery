-- Evidence queries for gallery.bayviewhub.me recovery
-- Run in Supabase SQL editor; paste results into logs
--
-- Schema note: artworks has is_visible (no is_published). No assessments table.

-- 1) Total artworks
SELECT count(*) AS total FROM artworks;

-- 2) Visible artworks (what /archive shows)
SELECT count(*) AS visible FROM artworks WHERE is_visible = true;

-- 3) Audit sessions count (assessment workflow)
SELECT count(*) AS audit_sessions FROM audit_sessions;

-- 4) Artworks with at least one audit session
SELECT count(*) AS artworks_with_audit
FROM artworks a
WHERE EXISTS (
  SELECT 1 FROM audit_sessions s WHERE s.artwork_id = a.id
);
