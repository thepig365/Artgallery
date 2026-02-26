-- CreateEnum
CREATE TYPE "ClaimRelationship" AS ENUM ('ARTIST', 'OWNER', 'AGENT', 'RIGHTS_HOLDER', 'OTHER');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVOKED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProvenanceEventType" ADD VALUE 'OWNERSHIP_CLAIMED';
ALTER TYPE "ProvenanceEventType" ADD VALUE 'OWNERSHIP_APPROVED';
ALTER TYPE "ProvenanceEventType" ADD VALUE 'OWNERSHIP_REJECTED';
ALTER TYPE "ProvenanceEventType" ADD VALUE 'OWNERSHIP_REVOKED';
ALTER TYPE "ProvenanceEventType" ADD VALUE 'OWNER_HIDDEN';
ALTER TYPE "ProvenanceEventType" ADD VALUE 'OWNER_UNHIDDEN';

-- AlterTable
ALTER TABLE "artworks" ADD COLUMN     "owner_auth_uid" TEXT;

-- CreateTable
CREATE TABLE "ownership_claims" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "artwork_id" UUID NOT NULL,
    "claimant_auth_uid" TEXT NOT NULL,
    "claimant_email" TEXT NOT NULL,
    "claimant_name" TEXT NOT NULL,
    "relationship_to_artwork" "ClaimRelationship" NOT NULL,
    "evidence_text" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_auth_uid" TEXT,
    "review_notes" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ownership_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ownership_claims_artwork_id_idx" ON "ownership_claims"("artwork_id");

-- CreateIndex
CREATE INDEX "ownership_claims_status_idx" ON "ownership_claims"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ownership_claims_artwork_id_claimant_auth_uid_status_key" ON "ownership_claims"("artwork_id", "claimant_auth_uid", "status");

-- AddForeignKey
ALTER TABLE "ownership_claims" ADD CONSTRAINT "ownership_claims_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
