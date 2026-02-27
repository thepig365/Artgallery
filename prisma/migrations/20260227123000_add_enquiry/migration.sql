-- CreateTable
CREATE TABLE "enquiries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "cta_type" TEXT NOT NULL,
    "artwork_id" UUID,
    "artwork_slug" TEXT,
    "source_url" TEXT,
    "user_agent" TEXT,
    "ip" TEXT,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "enquiries_created_at_idx" ON "enquiries"("created_at");

-- CreateIndex
CREATE INDEX "enquiries_artwork_id_idx" ON "enquiries"("artwork_id");

-- CreateIndex
CREATE INDEX "enquiries_cta_type_idx" ON "enquiries"("cta_type");

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
