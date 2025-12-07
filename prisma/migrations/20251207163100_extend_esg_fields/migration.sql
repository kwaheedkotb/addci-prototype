-- AlterTable
ALTER TABLE "Application" ADD COLUMN "country" TEXT;
ALTER TABLE "Application" ADD COLUMN "environmentalProfile" TEXT;
ALTER TABLE "Application" ADD COLUMN "governanceProfile" TEXT;
ALTER TABLE "Application" ADD COLUMN "phoneNumber" TEXT;
ALTER TABLE "Application" ADD COLUMN "socialProfile" TEXT;
ALTER TABLE "Application" ADD COLUMN "subSector" TEXT;
ALTER TABLE "Application" ADD COLUMN "tradeLicenseNumber" TEXT;

-- CreateTable
CREATE TABLE "ApplicationDocument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "ocrText" TEXT,
    "aiReview" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApplicationDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
