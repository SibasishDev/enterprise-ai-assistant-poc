import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "../config/database";
import { s3Client } from "../config/aws";
import { env } from "../config/env";
import { buildDocumentKey } from "../utils/s3-key";
import { processDocument } from "../workers/document.worker";
import { DocumentUploadedMessage } from "../types/ingestion";

interface CreateUploadInput {
  tenantId: string;
  fileName: string;
  contentType: string;
  fileSize?: number;
}

export async function createUploadUrl(input: CreateUploadInput) {
  const document = await prisma.document.create({
    data: {
      ...input,
      contentType: input.contentType,
      fileSize: input.fileSize ? BigInt(input.fileSize) : undefined,
      status: "PENDING",
      s3Key: "",
    },
  });

  const s3Key = buildDocumentKey(input.tenantId, document.id);

  await prisma.document.update({
    where: {
      id: document.id,
    },
    data: {
      s3Key,
    },
  });

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: s3Key,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 900,
  });

  setTimeout(() => {
    try {
      processDocument({
        documentId: document.id,
        tenantId: input.tenantId,
        s3Key,
      } as DocumentUploadedMessage);
    } catch (error) {
      console.error("Background processDocument worker failed:", error);
    }
  }, 5000);

  return {
    documentId: document.id,
    uploadUrl,
    expiresIn: 900,
  };
}
