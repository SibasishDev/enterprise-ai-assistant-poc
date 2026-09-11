import { searchKnowledgeBase } from "./query.service";

import { rerankDocuments } from "./reranker.service";

import { VectorSearchResult } from "./vector-search.service";

const RETRIEVAL_TOP_K = 20;
const FINAL_TOP_N = 5;

export interface AdvancedRetrievalResult {
  chunks: VectorSearchResult[];
  rerankScore: number;
}

export async function retrieveRelevantChunks(
  tenantId: string,
  query: string,
): Promise<
  Array<
    VectorSearchResult & {
      rerankScore: number;
    }
  >
> {
  const candidates = await searchKnowledgeBase({
    tenantId,
    query,
    topK: RETRIEVAL_TOP_K,
  });

  if (!candidates.length) {
    return [];
  }

  const rerankResults = await rerankDocuments({
    query,

    documents: candidates.map((chunk, index) => ({
      index,
      content: chunk.content,
    })),

    topN: FINAL_TOP_N,
  });

  return rerankResults.map((result) => ({
    ...candidates[result.originalIndex],

    rerankScore: result.relevanceScore,
  }));
}
