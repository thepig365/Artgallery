-- ─────────────────────────────────────────────────────────────────
-- Migration: add_artist_host_type
-- Adds ARTIST as a valid value for the HostType enum.
-- Supports artists registering their own works through the
-- Artwork Passport & Private Viewing Network programme.
-- IF NOT EXISTS guards against re-running on an already-migrated DB.
-- ─────────────────────────────────────────────────────────────────

ALTER TYPE "HostType" ADD VALUE IF NOT EXISTS 'ARTIST';
