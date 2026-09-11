import { prisma } from "../config/database";

import { TextChunk } from "./chunk.service";

import { estimateTokenCount } from "../utils/token";

interface StoreChunksInput {
  documentId: string;
  tenantId: string;
  fileName: string;
  chunks: TextChunk[];
}

export async function storeChunks(input: StoreChunksInput) {
  await prisma.documentChunk.deleteMany({
    where: {
      documentId: input.documentId,
      tenantId: input.tenantId,
    },
  });

  await prisma.documentChunk.createMany({
    data: input.chunks.map((chunk) => ({
      documentId: input.documentId,
      tenantId: input.tenantId,
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      tokenCount: estimateTokenCount(chunk.content),

      metadata: {
        fileName: input.fileName,
        source: "pdf",
      },
    })),
  });

  return prisma.documentChunk.findMany({
    where: {
      documentId: input.documentId,
      tenantId: input.tenantId,
    },

    orderBy: {
      chunkIndex: "asc",
    },

    select: {
      id: true,
      content: true,
      chunkIndex: true,
    },
  });
}
