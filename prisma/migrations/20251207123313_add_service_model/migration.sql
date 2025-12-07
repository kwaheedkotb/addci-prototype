-- CreateTable
CREATE TABLE "Service" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dept" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "channelType" TEXT NOT NULL,
    "externalUrl" TEXT,
    "tags" TEXT,
    "tagsAr" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
