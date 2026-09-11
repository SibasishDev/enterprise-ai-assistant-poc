import { buildContext } from "./context.service";

import { buildRagPrompt } from "./prompt.service";

import { generateAnswer } from "./llm.service";
// import { retrieveRelevantChunks } from "./advanced-retrieval.service";
import { selectContextsByTokenBudget } from "./token-manager.service";
import { searchKnowledgeBase } from "./query.service";

interface AskQuestionInput {
  tenantId: string;
  question: string;
  topK?: number;
}

export interface RagSource {
  chunkId: string;
  documentId: string;
  fileName?: string;
  pageNumber: number | null;
  similarity: number;
}

export interface RagResponse {
  answer: string;
  sources: RagSource[];
}

//   const MIN_RERANK_SCORE = 0.20;

const MIN_SIMILARITY = 0.055;

export async function askKnowledgeBase(
  input: AskQuestionInput,
): Promise<RagResponse> {
  //     const retrievedChunks = await retrieveRelevantChunks(
  //         input.tenantId,
  //         input.question
  //     );

  //     const relevantChunks =
  //     retrievedChunks.filter(
  //       (chunk) =>
  //         chunk.rerankScore >=
  //         MIN_RERANK_SCORE
  //     );

  //   if (!relevantChunks.length) {
  //     return {
  //       answer:
  //         "I don't have enough information in the provided documents.",

  //       sources: []
  //     };
  //   }

  const retrievedChunks = await searchKnowledgeBase({
    tenantId: input.tenantId,
    query: input.question,
    topK: input.topK ?? 5,
  });

  const relevantChunks = retrievedChunks.filter(
    (chunk) => Number(chunk.similarity) >= MIN_SIMILARITY,
  );

  console.log("MIN_SIMILARITY:", MIN_SIMILARITY);
  console.log("Retrieved:", retrievedChunks.length);
  console.log("Relevant:", relevantChunks.length);

  if (relevantChunks.length === 0) {
    return {
      answer: "I don't have enough information in the provided documents.",

      sources: [],
    };
  }

  const contexts = buildContext(relevantChunks);

  console.log(contexts, "contexts");

  const selectedContexts = selectContextsByTokenBudget({
    contexts,
    maxContextTokens: 5000,
  });

  //   return {answer: "", sources: []};

  const prompt = buildRagPrompt({
    question: input.question,
    contexts: selectedContexts,
  });

  const answer = await generateAnswer({
    systemPrompt: prompt.systemPrompt,
    userPrompt: prompt.userPrompt,
  });

  const sources = contexts.map((context) => ({
    chunkId: context.chunkId,
    documentId: context.documentId,
    fileName: context.fileName,
    pageNumber: context.pageNumber,
    similarity: context.similarity,
  }));

  return {
    answer,
    sources,
  };
}
