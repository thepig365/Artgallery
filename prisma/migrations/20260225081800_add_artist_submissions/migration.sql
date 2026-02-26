-- CreateEnum
CREATE TYPE "ArtistSubmissionStatus" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'NEEDS_INFO', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "artist_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reference_id" TEXT NOT NULL,
    "submitter_auth_uid" TEXT NOT NULL,
    "status" "ArtistSubmissionStatus" NOT NULL DEFAULT 'RECEIVED',
    "work_title" TEXT NOT NULL,
    "artist_name" TEXT,
    "medium" TEXT,
    "year" INTEGER,
    "dimensions" TEXT,
    "edition_info" TEXT,
    "evidence_files" JSONB,
    "materials" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "materials_other" TEXT,
    "narrative" TEXT,
    "consent_given" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artist_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "artist_submissions_reference_id_key" ON "artist_submissions"("reference_id");

-- CreateIndex
CREATE INDEX "artist_submissions_status_idx" ON "artist_submissions"("status");

-- CreateIndex
CREATE INDEX "artist_submissions_submitter_auth_uid_idx" ON "artist_submissions"("submitter_auth_uid");

-- CreateIndex
CREATE INDEX "artist_submissions_created_at_idx" ON "artist_submissions"("created_at");
