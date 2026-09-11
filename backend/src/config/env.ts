import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1),

  COGNITO_USER_POOL_ID: z.string().min(1),

  COGNITO_CLIENT_ID: z.string().min(1),

  COGNITO_REGION: z.string().min(1),

  AWS_REGION: z.string().min(1),
  S3_BUCKET_NAME: z.string().min(1),
  SQS_DOCUMENT_QUEUE_URL: z.string().min(1),

  BEDROCK_EMBEDDING_MODEL_ID: z
    .string()
    .default("amazon.titan-embed-text-v2:0"),

  BEDROCK_EMBEDDING_DIMENSIONS: z.coerce.number().default(1024),

  BEDROCK_CHAT_MODEL_ID: z.string().min(1),
  BEDROCK_RERANK_MODEL_ARN: z.string().min(1),
});

export const env = envSchema.parse(process.env);
