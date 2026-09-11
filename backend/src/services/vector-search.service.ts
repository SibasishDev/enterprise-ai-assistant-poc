import { prisma } from "../config/database";

import { embeddingToPgVector } from "../utils/vector";

export interface VectorSearchResult {
  id: string;
  documentId: string;
  tenantId: string;
  chunkIndex: number;
  content: string;
  pageNumber: number | null;
  tokenCount: number | null;
  metadata: unknown;
  similarity: number;
}

interface VectorSearchInput {
  tenantId: string;
  embedding: number[];
  topK?: number;
}

export async function searchSimilarChunks(
  input: VectorSearchInput,
): Promise<VectorSearchResult[]> {
  const topK = Math.min(Math.max(input.topK ?? 5, 1), 50);

  const queryVector = embeddingToPgVector(input.embedding);

  const results = await prisma.$queryRaw<VectorSearchResult[]>`
        SELECT
          id,
          "documentId",
          "tenantId",
          "chunkIndex",
          content,
          "pageNumber",
          "tokenCount",
          metadata,
  
          1 - (
            embedding <=> ${queryVector}::vector
          ) AS similarity
  
        FROM "DocumentChunk"
  
        WHERE
          "tenantId" = ${input.tenantId}
          AND embedding IS NOT NULL
  
        ORDER BY
          embedding <=> ${queryVector}::vector
  
        LIMIT ${topK}
      `;

  console.log(results);

  return results;
}
