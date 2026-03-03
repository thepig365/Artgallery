-- Harden assessor portal: blind_mode, variance_meta, ON DELETE RESTRICT

-- Add blind_mode to assignments
ALTER TABLE "assessment_assignments" ADD COLUMN "blind_mode" BOOLEAN NOT NULL DEFAULT true;

-- Add variance_meta to artworks (stores axis deltas, score ids when flagged)
ALTER TABLE "artworks" ADD COLUMN "variance_meta" JSONB;

-- Change assessment_scores FK: assignment_id from CASCADE to RESTRICT
ALTER TABLE "assessment_scores" DROP CONSTRAINT IF EXISTS "assessment_scores_assignment_id_fkey";
ALTER TABLE "assessment_scores" ADD CONSTRAINT "assessment_scores_assignment_id_fkey"
  FOREIGN KEY ("assignment_id") REFERENCES "assessment_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Ensure artwork_id FK uses RESTRICT (explicit)
ALTER TABLE "assessment_scores" DROP CONSTRAINT IF EXISTS "assessment_scores_artwork_id_fkey";
ALTER TABLE "assessment_scores" ADD CONSTRAINT "assessment_scores_artwork_id_fkey"
  FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
