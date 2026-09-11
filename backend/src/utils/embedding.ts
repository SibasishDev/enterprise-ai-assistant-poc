export function validateEmbedding(
  embedding: number[],
  expectedDimensions: number,
): void {
  if (!Array.isArray(embedding)) {
    throw new Error("Embedding must be an array");
  }

  if (embedding.length !== expectedDimensions) {
    throw new Error(
      `Invalid embedding dimensions. Expected ${expectedDimensions}, received ${embedding.length}`,
    );
  }

  for (const value of embedding) {
    if (!Number.isFinite(value)) {
      throw new Error("Embedding contains invalid numeric values");
    }
  }
}
