import { searchKnowledgeBase } from "./query.service";

import { searchKeywordChunks } from "./keyword-search.service";

import { VectorSearchResult } from "./vector-search.service";
import { UserRole } from "@prisma/client";

interface HybridResult extends VectorSearchResult {
  vectorScore: number;
  keywordScore: number;
  hybridScore: number;
}

export async function hybridSearch(
  tenantId: string,
  departmentIds: string[],
  role: UserRole,
  query: string,
): Promise<HybridResult[]> {
  const [vectorResults, keywordResults] = await Promise.all([
    searchKnowledgeBase({
      tenantId,
      departmentIds,
      role,
      query,
      topK: 20,
    }),

    searchKeywordChunks(tenantId, query, 20),
  ]);

  const resultMap = new Map<string, HybridResult>();

  for (const result of vectorResults) {
    resultMap.set(
      result.id,

      {
        ...result,

        vectorScore: Number(result.similarity),

        keywordScore: 0,

        hybridScore: Number(result.similarity) * 0.7,
      },
    );
  }

  for (const result of keywordResults) {
    const existing = resultMap.get(result.id);

    if (existing) {
      existing.keywordScore = Number(result.keywordScore);

      existing.hybridScore =
        existing.vectorScore * 0.7 + existing.keywordScore * 0.3;
    } else {
      resultMap.set(
        result.id,

        {
          ...result,

          similarity: 0,

          vectorScore: 0,

          keywordScore: Number(result.keywordScore),

          hybridScore: Number(result.keywordScore) * 0.3,
        },
      );
    }
  }

  return Array.from(resultMap.values())
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, 20);
}
