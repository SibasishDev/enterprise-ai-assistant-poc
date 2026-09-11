import { RerankCommand } from "@aws-sdk/client-bedrock-agent-runtime";

import { bedrockAgentRuntimeClient } from "../config/aws";

import { env } from "../config/env";

export interface RerankDocument {
  index: number;
  content: string;
}

export interface RerankedResult {
  originalIndex: number;
  relevanceScore: number;
}

interface RerankInput {
  query: string;
  documents: RerankDocument[];
  topN?: number;
}

export async function rerankDocuments(
  input: RerankInput,
): Promise<RerankedResult[]> {
  if (!input.documents.length) {
    return [];
  }

  const topN = Math.min(input.topN ?? 5, input.documents.length);

  const command = new RerankCommand({
    queries: [
      {
        type: "TEXT",
        textQuery: {
          text: input.query,
        },
      },
    ],

    sources: input.documents.map((document) => ({
      type: "INLINE",

      inlineDocumentSource: {
        type: "TEXT",

        textDocument: {
          text: document.content,
        },
      },
    })),

    rerankingConfiguration: {
      type: "BEDROCK_RERANKING_MODEL",

      bedrockRerankingConfiguration: {
        modelConfiguration: {
          modelArn: env.BEDROCK_RERANK_MODEL_ARN,
        },

        numberOfResults: topN,
      },
    },
  });

  const response = await bedrockAgentRuntimeClient.send(command);

  return (response.results ?? []).map((result) => ({
    originalIndex: result.index ?? 0,

    relevanceScore: Number(result.relevanceScore ?? 0),
  }));
}
