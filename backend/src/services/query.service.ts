import { generateEmbedding } from "./embedding.service";

import {
  searchSimilarChunks,
  VectorSearchResult,
} from "./vector-search.service";

interface SearchQueryInput {
  tenantId: string;
  query: string;
  topK?: number;
}

//   const retrievalTopK = 20;

export async function searchKnowledgeBase(
  input: SearchQueryInput,
): Promise<VectorSearchResult[]> {
  const query = input.query.trim();

  if (!query) {
    throw new Error(`Search query cannot be empty`);
  }

  console.log(query, "query");

  const embedding = await generateEmbedding({
    text: query,
  });

  const results = await searchSimilarChunks({
    tenantId: input.tenantId,
    embedding,
    topK: 5,
  });

  return results;
}
