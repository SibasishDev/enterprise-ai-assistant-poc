import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

import { bedrockRuntimeClient } from "../config/aws";

import { env } from "../config/env";

interface TitanEmbeddingResponse {
  embedding: number[];
  inputTextTokenCount: number;
}

interface GenerateEmbeddingInput {
  text: string;
}

export async function generateEmbedding(
  input: GenerateEmbeddingInput,
): Promise<number[]> {
  const text = input.text.trim();

  if (!text) {
    throw new Error(`Cannot genearte embedding for empty text`);
  }

  const requestBody = {
    inputText: text,
    dimensions: env.BEDROCK_EMBEDDING_DIMENSIONS,
    normalize: true,
  };

  const command = new InvokeModelCommand({
    modelId: env.BEDROCK_EMBEDDING_MODEL_ID,

    contentType: "application/json",

    accept: "application/json",

    body: JSON.stringify(requestBody),
  });

  const response = await bedrockRuntimeClient.send(command);

  if (!response.body) {
    throw new Error(`BedRock returned an emepty response`);
  }

  console.log(response);

  const responseBody = JSON.parse(
    new TextDecoder().decode(response.body),
  ) as TitanEmbeddingResponse;

  if (!responseBody.embedding?.length) {
    throw new Error("Bedrock returned an empty embedding");
  }

  return responseBody.embedding;
}
