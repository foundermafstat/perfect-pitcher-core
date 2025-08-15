-- AlterTable
ALTER TABLE "Slide" ADD COLUMN     "backgroundType" TEXT DEFAULT 'color',
ADD COLUMN     "gradientAngle" INTEGER DEFAULT 45,
ADD COLUMN     "gradientEnd" TEXT,
ADD COLUMN     "gradientStart" TEXT,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "youtubeBackground" TEXT;
