-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ASSESSOR', 'ARTIST', 'VIEWER');

-- CreateEnum
CREATE TYPE "AuditPhase" AS ENUM ('BLIND_SCORING', 'OPEN_REVIEW', 'VARIANCE_CHECK', 'FINALIZED');

-- CreateEnum
CREATE TYPE "AuditSessionStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TakedownStatus" AS ENUM ('OPEN', 'REVIEWED', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProvenanceEventType" AS ENUM ('ARTWORK_CREATED', 'ARTWORK_UPDATED', 'ARTWORK_HIDDEN', 'ARTWORK_UNHIDDEN', 'SCORE_SUBMITTED', 'SCORE_UPDATED', 'VARIANCE_FLAGGED', 'VARIANCE_RESOLVED', 'TAKEDOWN_REQUESTED', 'TAKEDOWN_RESOLVED', 'AUDIT_SESSION_CREATED', 'AUDIT_SESSION_COMPLETED');

-- CreateTable
CREATE TABLE "artists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "website" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artworks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "medium" TEXT,
    "year" INTEGER,
    "dimensions" TEXT,
    "materials" TEXT,
    "narrative" TEXT,
    "source_url" TEXT,
    "image_url" TEXT,
    "source_license_status" TEXT,
    "score_b" DOUBLE PRECISION,
    "score_p" DOUBLE PRECISION,
    "score_m" DOUBLE PRECISION,
    "score_s" DOUBLE PRECISION,
    "final_v" DOUBLE PRECISION,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "hidden_reason" TEXT,
    "hidden_at" TIMESTAMP(3),
    "hidden_by" UUID,
    "artist_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessor_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auth_uid" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ASSESSOR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessor_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "artwork_id" UUID NOT NULL,
    "phase" "AuditPhase" NOT NULL DEFAULT 'BLIND_SCORING',
    "status" "AuditSessionStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "audit_session_id" UUID NOT NULL,
    "assessor_user_id" UUID NOT NULL,
    "score_b" DOUBLE PRECISION NOT NULL,
    "score_p" DOUBLE PRECISION NOT NULL,
    "score_m" DOUBLE PRECISION NOT NULL,
    "score_s" DOUBLE PRECISION NOT NULL,
    "final_v" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_variance_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "audit_session_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "variance_threshold" DOUBLE PRECISION NOT NULL,
    "max_variance" DOUBLE PRECISION NOT NULL,
    "flagged_field" TEXT NOT NULL,
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_variance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provenance_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_type" "ProvenanceEventType" NOT NULL,
    "artwork_id" UUID,
    "actor_id" UUID,
    "detail" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provenance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "takedown_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "artwork_id" UUID NOT NULL,
    "complainant_name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "work_url" TEXT NOT NULL,
    "complaint_basis" TEXT NOT NULL,
    "evidence_links" TEXT[],
    "declaration_accepted" BOOLEAN NOT NULL,
    "status" "TakedownStatus" NOT NULL DEFAULT 'OPEN',
    "review_notes" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "takedown_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "artists_slug_key" ON "artists"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "artworks_slug_key" ON "artworks"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "assessor_users_auth_uid_key" ON "assessor_users"("auth_uid");

-- CreateIndex
CREATE UNIQUE INDEX "assessor_users_email_key" ON "assessor_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "audit_scores_audit_session_id_assessor_user_id_key" ON "audit_scores"("audit_session_id", "assessor_user_id");

-- CreateIndex
CREATE INDEX "provenance_logs_artwork_id_idx" ON "provenance_logs"("artwork_id");

-- CreateIndex
CREATE INDEX "provenance_logs_event_type_idx" ON "provenance_logs"("event_type");

-- AddForeignKey
ALTER TABLE "artworks" ADD CONSTRAINT "artworks_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_sessions" ADD CONSTRAINT "audit_sessions_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_scores" ADD CONSTRAINT "audit_scores_audit_session_id_fkey" FOREIGN KEY ("audit_session_id") REFERENCES "audit_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_scores" ADD CONSTRAINT "audit_scores_assessor_user_id_fkey" FOREIGN KEY ("assessor_user_id") REFERENCES "assessor_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_variance_reviews" ADD CONSTRAINT "audit_variance_reviews_audit_session_id_fkey" FOREIGN KEY ("audit_session_id") REFERENCES "audit_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_variance_reviews" ADD CONSTRAINT "audit_variance_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "assessor_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provenance_logs" ADD CONSTRAINT "provenance_logs_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provenance_logs" ADD CONSTRAINT "provenance_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "assessor_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "takedown_requests" ADD CONSTRAINT "takedown_requests_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

