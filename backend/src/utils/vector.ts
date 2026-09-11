export function embeddingToPgVector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
