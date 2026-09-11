import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";

import { env } from "./env";

export const s3Client = new S3Client({
  region: env.AWS_REGION,
});

export const sqsClient = new SQSClient({
  region: env.AWS_REGION,
});

export const bedrockRuntimeClient = new BedrockRuntimeClient({
  region: env.AWS_REGION,
});

export const bedrockAgentRuntimeClient = new BedrockAgentRuntimeClient({
  region: env.AWS_REGION,
});
