-- CreateTable
CREATE TABLE "masterpieces" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "source" TEXT NOT NULL,
    "source_object_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "date" TEXT,
    "medium" TEXT,
    "dimensions" TEXT,
    "image_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "license" TEXT NOT NULL,
    "credit_line" TEXT,
    "source_url" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "masterpieces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "masterpieces_source_idx" ON "masterpieces"("source");

-- CreateIndex
CREATE UNIQUE INDEX "masterpieces_source_source_object_id_key" ON "masterpieces"("source", "source_object_id");
