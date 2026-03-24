-- ─────────────────────────────────────────────────────────────────
-- Migration: add_host_passport
-- Adds the host_passports table and associated enums for the
-- Artwork Passport & Private Viewing Network programme.
-- ─────────────────────────────────────────────────────────────────

-- Enums

CREATE TYPE "HostPassportStatus" AS ENUM (
  'PRELIMINARY',
  'UNDER_REVIEW',
  'REVIEWED',
  'HIDDEN'
);

CREATE TYPE "HostType" AS ENUM (
  'COLLECTOR',
  'HOMEOWNER',
  'STYLIST',
  'DESIGNER',
  'OTHER'
);

CREATE TYPE "VisibilityPreference" AS ENUM (
  'PRIVATE_ONLY',
  'BY_REQUEST',
  'BY_INTRODUCTION',
  'HIDDEN'
);

CREATE TYPE "ArtworkPassportType" AS ENUM (
  'ORIGINAL',
  'EDITION',
  'DIGITAL_PRINT',
  'REPRODUCTION'
);

-- Table

CREATE TABLE "host_passports" (
  "id"                  UUID         NOT NULL DEFAULT gen_random_uuid(),
  -- Human-readable display ID (PP-YYYYMMDD-XXXXXX). Never used in public URLs.
  "passport_id"         TEXT         NOT NULL,
  -- Unguessable UUID for the public share URL /passport/record/[shareToken].
  "share_token"         TEXT         NOT NULL,
  "status"              "HostPassportStatus" NOT NULL DEFAULT 'PRELIMINARY',
  "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"          TIMESTAMP(3) NOT NULL,

  -- Host details — never exposed in public passport page
  "host_name"           TEXT         NOT NULL,
  "host_email"          TEXT         NOT NULL,
  "host_mobile"         TEXT         NOT NULL,
  "host_region"         TEXT         NOT NULL,   -- suburb / region only
  "host_type"           "HostType"   NOT NULL,
  "visibility_pref"     "VisibilityPreference" NOT NULL DEFAULT 'BY_REQUEST',

  -- Artwork — shown in public passport
  "artwork_title"       TEXT         NOT NULL,
  "artist_name"         TEXT         NOT NULL,
  "artwork_year"        INTEGER,
  "medium"              TEXT         NOT NULL,
  "dimensions"          TEXT         NOT NULL,
  "ownership_status"    TEXT         NOT NULL,
  "artwork_type"        "ArtworkPassportType" NOT NULL,
  "significance"        TEXT         NOT NULL,
  "viewing_requested"   BOOLEAN      NOT NULL DEFAULT false,

  -- Supabase Storage paths (private passport-records bucket).
  -- Path convention: pending/{upload-uuid}/{slot}.{ext}
  -- The pending/ prefix enables future cleanup of orphaned uploads
  -- (images uploaded but never tied to a completed registration).
  "main_image_path"     TEXT         NOT NULL,   -- required, non-nullable
  "detail_image_paths"  TEXT[]       NOT NULL DEFAULT '{}',
  "in_room_image_path"  TEXT,
  "back_image_path"     TEXT,

  CONSTRAINT "host_passports_pkey"         PRIMARY KEY ("id"),
  CONSTRAINT "host_passports_passport_id_key" UNIQUE ("passport_id"),
  CONSTRAINT "host_passports_share_token_key" UNIQUE ("share_token")
);

-- Indexes

CREATE INDEX "host_passports_share_token_idx"  ON "host_passports" ("share_token");
CREATE INDEX "host_passports_passport_id_idx"  ON "host_passports" ("passport_id");
CREATE INDEX "host_passports_status_idx"       ON "host_passports" ("status");
CREATE INDEX "host_passports_created_at_idx"   ON "host_passports" ("created_at");
