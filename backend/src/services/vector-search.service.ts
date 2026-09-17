import { Prisma, UserRole } from "@prisma/client";
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
  departmentIds: string[];
  embedding: number[];
  topK?: number;
  role: UserRole;
}

export async function searchSimilarChunks(
  input: VectorSearchInput,
): Promise<VectorSearchResult[]> {
  const topK = Math.min(Math.max(input.topK ?? 5, 1), 50);

  const queryVector = embeddingToPgVector(input.embedding);

  let roleSecurityFilter: Prisma.Sql;

  if (input.role === UserRole.SUPER_ADMIN) {
    console.log(`🔑 Admin access granted. Bypassing department restrictions.`);
    roleSecurityFilter = Prisma.sql`1=1`;
  } else {
    if (!input.departmentIds || input.departmentIds.length === 0) {
      roleSecurityFilter = Prisma.sql`1=0`;
    } else {
      roleSecurityFilter = Prisma.sql`d."departmentId" IN (${Prisma.join(input.departmentIds)})`;
    }
  }

  const results = await prisma.$queryRaw<VectorSearchResult[]>`
    SELECT 
      dc.id, 
      dc."documentId", 
      dc.content, 
      dc."pageNumber", 
      1 - ( dc.embedding <=> ${queryVector}::vector ) AS similarity
    FROM "DocumentChunk" dc
    JOIN "Document" d ON d.id = dc."documentId"
    WHERE dc."tenantId" = ${input.tenantId}
      AND dc.embedding IS NOT NULL
      AND ${roleSecurityFilter}
    ORDER BY dc.embedding <=> ${queryVector}::vector
    LIMIT ${topK}
  `;

  console.log(results);

  return results;
}
