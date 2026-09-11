import { VectorSearchResult } from "./vector-search.service";

export interface ContextDocument {
  chunkId: string;
  documentId: string;
  content: string;
  pageNumber: number | null;
  similarity: number;
  fileName?: string;
}

export function buildContext(chunks: VectorSearchResult[]): ContextDocument[] {
  return chunks.map((chunk) => {
    const metadata = chunk.metadata as {
      fileName?: string;
    } | null;

    return {
      chunkId: chunk.id,
      documentId: chunk.documentId,
      content: chunk.content,
      pageNumber: chunk.pageNumber,
      similarity: Number(chunk.similarity),
      fileName: metadata?.fileName,
    };
  });
}
