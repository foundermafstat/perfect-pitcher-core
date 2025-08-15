-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "logoBase64" TEXT,
ADD COLUMN     "logoMimeType" TEXT,
ADD COLUMN     "logoPrompt" TEXT;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
