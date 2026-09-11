export interface TextChunk {
  chunkIndex: number;
  content: string;
}

export function chunkText(
  text: string,
  chinkSize = 1200,
  overlap = 200,
): TextChunk[] {
  if (chinkSize <= overlap) {
    throw new Error("chunkSize must be greater than overlap");
  }

  const chunks: TextChunk[] = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    const end = Math.min(start + chinkSize, text.length);

    const content = text.slice(start, end).trim();

    if (content.length > 0) {
      chunks.push({
        chunkIndex,
        content,
      });

      chunkIndex++;
    }

    if (end >= text.length) {
      break;
    }

    start = end - overlap;
  }

  return chunks;
}
