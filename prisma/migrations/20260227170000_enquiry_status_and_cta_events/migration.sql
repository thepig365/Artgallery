-- AlterTable
ALTER TABLE "enquiries"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "enquiries_status_idx" ON "enquiries"("status");

-- CreateTable
CREATE TABLE "cta_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_type" TEXT NOT NULL,
    "cta_type" TEXT NOT NULL,
    "artwork_id" UUID,
    "artwork_slug" TEXT,
    "source_url" TEXT,
    "user_agent" TEXT,
    "ip" TEXT,
    "enquiry_id" UUID,
    CONSTRAINT "cta_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cta_events_created_at_idx" ON "cta_events"("created_at");

-- CreateIndex
CREATE INDEX "cta_events_event_type_idx" ON "cta_events"("event_type");

-- CreateIndex
CREATE INDEX "cta_events_cta_type_idx" ON "cta_events"("cta_type");

-- CreateIndex
CREATE INDEX "cta_events_artwork_id_idx" ON "cta_events"("artwork_id");

-- CreateIndex
CREATE INDEX "cta_events_enquiry_id_idx" ON "cta_events"("enquiry_id");

-- AddForeignKey
ALTER TABLE "cta_events"
ADD CONSTRAINT "cta_events_artwork_id_fkey"
FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cta_events"
ADD CONSTRAINT "cta_events_enquiry_id_fkey"
FOREIGN KEY ("enquiry_id") REFERENCES "enquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
