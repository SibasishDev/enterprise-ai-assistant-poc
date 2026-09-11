import { GetObjectCommand } from "@aws-sdk/client-s3";

import { s3Client } from "../config/aws";
import { env } from "../config/env";

export async function downloadDocument(s3Key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: s3Key,
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error(`S3 object has no body: ${s3Key}`);
  }

  const bytes = await response.Body.transformToByteArray();

  return Buffer.from(bytes);
}
