import { generateEmbedding } from "./embedding.service";
import { storeChunkEmbedding } from "./embedding-storage.service";

import { validateEmbedding } from "../utils/embedding";

import { env } from "../config/env";

interface ChunkForEmbedding {
  id: string;
  content: string;
}

export async function embedChunks(chunks: ChunkForEmbedding[]): Promise<void> {
  for (const chunk of chunks) {
    console.log(`[Embedding] Generating embedding for chunk ${chunk.id}`);

    const embedding = await generateEmbedding({
      text: chunk.content,
    });

    validateEmbedding(embedding, env.BEDROCK_EMBEDDING_DIMENSIONS);

    await storeChunkEmbedding({
      chunkId: chunk.id,
      embedding,
    });

    console.log(`[Embedding] Stored embedding for chunk ${chunk.id}`);
  }
}
