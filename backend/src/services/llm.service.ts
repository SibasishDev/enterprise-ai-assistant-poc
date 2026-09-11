import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

import { bedrockRuntimeClient } from "../config/aws";

import { env } from "../config/env";

interface NovaResponse {
  output?: {
    message?: {
      role?: string;
      content?: Array<{
        text?: string;
      }>;
    };
  };
}

interface GenerateAnswerInput {
  systemPrompt: string;
  userPrompt: string;
}

export async function generateAnswer(
  input: GenerateAnswerInput,
): Promise<string> {
  const requestBody = {
    schemaVersion: "messages-v1",

    system: [
      {
        text: input.systemPrompt,
      },
    ],

    messages: [
      {
        role: "user",
        content: [
          {
            text: input.userPrompt,
          },
        ],
      },
    ],

    inferenceConfig: {
      maxTokens: 800,
      temperature: 0.1,
      topP: 0.9,
    },
  };

  const command = new InvokeModelCommand({
    modelId: env.BEDROCK_CHAT_MODEL_ID,

    contentType: "application/json",

    accept: "application/json",

    body: JSON.stringify(requestBody),
  });

  const response = await bedrockRuntimeClient.send(command);

  if (!response.body) {
    throw new Error(`Bedrock returned an empty response`);
  }

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  const answer = responseBody.output?.message?.content
    ?.map((item: { text?: string }) => item.text ?? "")
    .join("")
    .trim();

  if (!answer) {
    throw new Error(`Bedrock returned an empty answer`);
  }

  return answer;
}
