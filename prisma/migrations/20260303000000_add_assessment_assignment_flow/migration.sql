-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'IN_REVIEW', 'SUBMITTED', 'NEEDS_REVISION', 'WITHDRAWN');

CREATE TYPE "AssessmentScoreStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- AlterTable
ALTER TABLE "artworks" ADD COLUMN "variance_flag" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "assessment_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "artwork_id" UUID NOT NULL,
    "assessor_auth_uid" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "due_at" TIMESTAMP(3),
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_admin_auth_uid" TEXT,
    "withdrawn_at" TIMESTAMP(3),
    "notes_to_assessor" TEXT,

    CONSTRAINT "assessment_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "artwork_id" UUID NOT NULL,
    "assessor_auth_uid" TEXT NOT NULL,
    "score_b" DECIMAL(3,1) NOT NULL,
    "score_p" DECIMAL(3,1) NOT NULL,
    "score_m" DECIMAL(3,1) NOT NULL,
    "score_s" DECIMAL(3,1) NOT NULL,
    "total_score" DECIMAL(4,2) NOT NULL,
    "notes" TEXT,
    "status" "AssessmentScoreStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),

    CONSTRAINT "assessment_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_auth_uid" TEXT NOT NULL,
    "actor_role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assessment_assignments_artwork_id_assessor_auth_uid_key" ON "assessment_assignments"("artwork_id", "assessor_auth_uid");
CREATE INDEX "assessment_assignments_assessor_auth_uid_idx" ON "assessment_assignments"("assessor_auth_uid");
CREATE INDEX "assessment_assignments_status_idx" ON "assessment_assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_scores_assignment_id_key" ON "assessment_scores"("assignment_id");
CREATE INDEX "assessment_scores_artwork_id_idx" ON "assessment_scores"("artwork_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_auth_uid_idx" ON "audit_logs"("actor_auth_uid");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs"("entity_type");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "assessment_assignments" ADD CONSTRAINT "assessment_assignments_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_scores" ADD CONSTRAINT "assessment_scores_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assessment_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_scores" ADD CONSTRAINT "assessment_scores_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
