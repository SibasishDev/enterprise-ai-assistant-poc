-- CreateEnum
CREATE TYPE "DocumentAccessLevel" AS ENUM ('PRIVATE', 'DEPARTMENT', 'TENANT');

-- DropIndex
DROP INDEX "Document_tenantId_status_idx";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "accessLevel" "DocumentAccessLevel" NOT NULL DEFAULT 'PRIVATE',
ADD COLUMN     "category" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "documentType" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "DocumentChunk" ADD COLUMN "searchVector" tsvector 
GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "department" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "location" TEXT;

-- CreateTable
CREATE TABLE "DocumentAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentAccess_userId_idx" ON "DocumentAccess"("userId");

-- CreateIndex
CREATE INDEX "DocumentAccess_documentId_idx" ON "DocumentAccess"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentAccess_userId_documentId_key" ON "DocumentAccess"("userId", "documentId");

-- CreateIndex
CREATE INDEX "Document_tenantId_department_idx" ON "Document"("tenantId", "department");

-- CreateIndex
CREATE INDEX "Document_tenantId_category_idx" ON "Document"("tenantId", "category");

-- CreateIndex
CREATE INDEX "Document_tenantId_documentType_idx" ON "Document"("tenantId", "documentType");

-- CreateIndex
CREATE INDEX "DocumentChunk_searchVector_idx" ON "DocumentChunk" USING GIN ("searchVector");

-- CreateIndex
CREATE INDEX "User_tenantId_department_idx" ON "User"("tenantId", "department");

-- AddForeignKey
ALTER TABLE "DocumentAccess" ADD CONSTRAINT "DocumentAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAccess" ADD CONSTRAINT "DocumentAccess_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
