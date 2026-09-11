import { prisma } from "../config/database";

export interface KeywordSearchResult {
  id: string;
  documentId: string;
  tenantId: string;
  chunkIndex: number;
  content: string;
  pageNumber: number | null;
  tokenCount: number | null;
  metadata: unknown;
  keywordScore: number;
}

export async function searchKeywordChunks(
  tenantId: string,
  query: string,
  limit = 20,
): Promise<KeywordSearchResult[]> {
  return prisma.$queryRaw<KeywordSearchResult[]>`
    SELECT
      id,
      "documentId",
      "tenantId",
      "chunkIndex",
      content,
      "pageNumber",
      "tokenCount",
      metadata,

      ts_rank(
        "searchVector",
        websearch_to_tsquery(
          'english',
          ${query}
        )
      ) AS "keywordScore"

    FROM "DocumentChunk"

    WHERE
      "tenantId" = ${tenantId}

      AND "searchVector" @@
        websearch_to_tsquery(
          'english',
          ${query}
        )

    ORDER BY
      "keywordScore" DESC

    LIMIT ${limit}
  `;
}
