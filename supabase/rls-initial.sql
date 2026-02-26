-- ─────────────────────────────────────────────────────────────
-- Art Valuation Protocol — Row Level Security Bootstrap
-- Supabase / PostgreSQL
--
-- ASSUMPTIONS:
--   • Supabase auth is configured; auth.uid() returns the logged-in user's UUID.
--   • The assessor_users.auth_uid column maps to auth.users.id.
--   • These policies are additive; Supabase enables RLS on creation.
--
-- INTEGRATION NOTES:
--   • Run this AFTER Prisma migrations have created the tables.
--   • Adjust role resolution if using custom claims instead of
--     the assessor_users table lookup shown here.
-- ─────────────────────────────────────────────────────────────

-- ──── Helper function: get current user's role ──────────────
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role::text
  FROM assessor_users
  WHERE auth_uid = auth.uid()::text
    AND is_active = true
  LIMIT 1;
$$;

-- ──────────────────────────────────────────────────────────────
-- ARTWORKS
-- ──────────────────────────────────────────────────────────────
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Public read: only visible artworks
CREATE POLICY "artworks_public_read" ON artworks
  FOR SELECT
  USING (is_visible = true);

-- Authenticated read: admins and assessors can see all
CREATE POLICY "artworks_staff_read" ON artworks
  FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() IN ('ADMIN', 'ASSESSOR')
  );

-- Insert: admins only
CREATE POLICY "artworks_admin_insert" ON artworks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role() = 'ADMIN'
  );

-- Update: admins only
CREATE POLICY "artworks_admin_update" ON artworks
  FOR UPDATE
  TO authenticated
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');

-- ──────────────────────────────────────────────────────────────
-- ARTISTS
-- ──────────────────────────────────────────────────────────────
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "artists_public_read" ON artists
  FOR SELECT
  USING (true);

-- Admin write
CREATE POLICY "artists_admin_write" ON artists
  FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');

-- ──────────────────────────────────────────────────────────────
-- ASSESSOR USERS
-- ──────────────────────────────────────────────────────────────
ALTER TABLE assessor_users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "assessor_users_self_read" ON assessor_users
  FOR SELECT
  TO authenticated
  USING (auth_uid = auth.uid()::text);

-- Admins can read all
CREATE POLICY "assessor_users_admin_read" ON assessor_users
  FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'ADMIN');

-- Admin manage
CREATE POLICY "assessor_users_admin_manage" ON assessor_users
  FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');

-- ──────────────────────────────────────────────────────────────
-- AUDIT SESSIONS
-- ──────────────────────────────────────────────────────────────
ALTER TABLE audit_sessions ENABLE ROW LEVEL SECURITY;

-- Assessors and admins can read
CREATE POLICY "audit_sessions_staff_read" ON audit_sessions
  FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() IN ('ADMIN', 'ASSESSOR')
  );

-- Admin create/update
CREATE POLICY "audit_sessions_admin_write" ON audit_sessions
  FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');

-- ──────────────────────────────────────────────────────────────
-- AUDIT SCORES
-- ──────────────────────────────────────────────────────────────
ALTER TABLE audit_scores ENABLE ROW LEVEL SECURITY;

-- Assessors can read their own scores
CREATE POLICY "audit_scores_self_read" ON audit_scores
  FOR SELECT
  TO authenticated
  USING (
    assessor_user_id = (
      SELECT id FROM assessor_users WHERE auth_uid = auth.uid()::text
    )
  );

-- Admins can read all scores
CREATE POLICY "audit_scores_admin_read" ON audit_scores
  FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'ADMIN');

-- Assessors can insert their own scores
CREATE POLICY "audit_scores_assessor_insert" ON audit_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    assessor_user_id = (
      SELECT id FROM assessor_users WHERE auth_uid = auth.uid()::text
    )
    AND public.get_user_role() IN ('ADMIN', 'ASSESSOR')
  );

-- ──────────────────────────────────────────────────────────────
-- AUDIT VARIANCE REVIEWS
-- ──────────────────────────────────────────────────────────────
ALTER TABLE audit_variance_reviews ENABLE ROW LEVEL SECURITY;

-- Staff read
CREATE POLICY "variance_reviews_staff_read" ON audit_variance_reviews
  FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() IN ('ADMIN', 'ASSESSOR')
  );

-- Admin write
CREATE POLICY "variance_reviews_admin_write" ON audit_variance_reviews
  FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');

-- ──────────────────────────────────────────────────────────────
-- PROVENANCE LOGS
-- ──────────────────────────────────────────────────────────────
ALTER TABLE provenance_logs ENABLE ROW LEVEL SECURITY;

-- Admin read only (audit trail is sensitive)
CREATE POLICY "provenance_logs_admin_read" ON provenance_logs
  FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'ADMIN');

-- System insert (via service role / server-side only)
-- In Supabase, server-side calls use the service_role key which bypasses RLS.
-- No explicit INSERT policy needed for server actions.

-- ──────────────────────────────────────────────────────────────
-- TAKEDOWN REQUESTS
-- ──────────────────────────────────────────────────────────────
ALTER TABLE takedown_requests ENABLE ROW LEVEL SECURITY;

-- Public can submit (insert) — no auth required for intake
CREATE POLICY "takedown_requests_public_insert" ON takedown_requests
  FOR INSERT
  WITH CHECK (true);

-- Admin read/manage
CREATE POLICY "takedown_requests_admin_read" ON takedown_requests
  FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'ADMIN');

CREATE POLICY "takedown_requests_admin_update" ON takedown_requests
  FOR UPDATE
  TO authenticated
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');
