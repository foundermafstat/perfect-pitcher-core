-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "brandColor" TEXT,
ADD COLUMN     "deckType" TEXT,
ADD COLUMN     "finalDataEn" JSONB,
ADD COLUMN     "locale" TEXT,
ADD COLUMN     "qaLocalized" JSONB,
ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE INDEX "Story_user_id_idx" ON "Story"("user_id");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
