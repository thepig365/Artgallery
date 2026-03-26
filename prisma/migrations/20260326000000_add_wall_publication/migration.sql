-- Migration: add_wall_publication
-- Adds the Private Walls / Public programme layer to HostPassport.
--
-- Fields added:
--   host_public_opt_in  — host's expressed willingness to be listed publicly
--   wall_publication    — actual publication state (PRIVATE_ONLY | PUBLIC_PRIVATE_WALLS)
--   public_slug         — stable URL slug for public detail page (never cleared on unpublish)
--   published_at        — timestamp of most recent publication action
--   published_by        — Supabase auth UID of admin who last published

-- CreateEnum
CREATE TYPE "WallPublication" AS ENUM ('PRIVATE_ONLY', 'PUBLIC_PRIVATE_WALLS');

-- AlterTable: add new columns with safe defaults
ALTER TABLE "host_passports"
  ADD COLUMN "host_public_opt_in" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "wall_publication"   "WallPublication" NOT NULL DEFAULT 'PRIVATE_ONLY',
  ADD COLUMN "public_slug"        TEXT,
  ADD COLUMN "published_at"       TIMESTAMP(3),
  ADD COLUMN "published_by"       TEXT;

-- CreateIndex: unique on public_slug
CREATE UNIQUE INDEX "host_passports_public_slug_key"
  ON "host_passports"("public_slug");

-- CreateIndex: for filtering by publication state
CREATE INDEX "host_passports_wall_publication_idx"
  ON "host_passports"("wall_publication");

-- CreateIndex: for direct slug lookups
CREATE INDEX "host_passports_public_slug_idx"
  ON "host_passports"("public_slug");
