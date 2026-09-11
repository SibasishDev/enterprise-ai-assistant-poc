import { prisma } from "../config/database";
import { embeddingToPgVector } from "../utils/vector";

interface StoreEmbeddingInput {
  chunkId: string;
  embedding: number[];
}

export async function storeChunkEmbedding(
  input: StoreEmbeddingInput,
): Promise<void> {
  const vector = embeddingToPgVector(input.embedding);

  await prisma.$executeRaw`
    UPDATE "DocumentChunk"
    SET "embedding" = ${vector}::vector
    WHERE "id" = ${input.chunkId}
  `;
}
