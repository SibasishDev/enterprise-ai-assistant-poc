/*
  Warnings:

  - A unique constraint covering the columns `[documentId,chunkIndex]` on the table `DocumentChunk` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DocumentChunk_documentId_chunkIndex_key" ON "DocumentChunk"("documentId", "chunkIndex");
