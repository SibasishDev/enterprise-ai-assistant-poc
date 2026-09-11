import { prisma } from "../config/database";

import { downloadDocument } from "../services/document-storage.service";

import { extractPdfText } from "../services/pdf.service";

import { chunkText } from "../services/chunk.service";

import { storeChunks } from "../services/chunk-storage.service";

import {
  markDocumentProcessing,
  markDocumentCompleted,
  markDocumentFailed,
} from "../services/document-status.service";

import { cleanText } from "../utils/text-cleaner";

import { DocumentUploadedMessage } from "../types/ingestion";
import { embedChunks } from "../services/chunk-embedding.service";

export async function processDocument(message: DocumentUploadedMessage) {
  const { documentId, tenantId, s3Key } = message;

  console.log(`[Worker] Processing document ${documentId}`);

  try {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        tenantId,
      },
    });

    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    await markDocumentProcessing(documentId, tenantId);

    console.log(`[Worker] Downloading ${s3Key}`);

    const pdfBuffer = await downloadDocument(s3Key);

    console.log(`[Worker] Downloaded ${pdfBuffer.length} bytes`);

    console.log(`[Worker] Extracting PDF text`);

    const extracted = await extractPdfText(pdfBuffer);

    const cleanedText = cleanText(extracted.text);

    if (!cleanedText) {
      throw new Error("No text could be extracted from document");
    }

    console.log(`[Worker] Creating chunks`);

    const chunks = chunkText(cleanedText, 1200, 200);

    console.log(`[Worker] Created ${chunks.length} chunks`);

    const storedChunks = await storeChunks({
      documentId,
      tenantId,
      fileName: document.fileName,
      chunks,
    });

    console.log(`[Worker] Stored ${storedChunks.length} chunks`);

    await embedChunks(
      storedChunks.map((chunk) => ({
        id: chunk.id,
        content: chunk.content,
      })),
    );

    await markDocumentCompleted(documentId, tenantId);

    console.log(`[Worker] Docuemnt ${documentId} completed`);

    return {
      documentId,
      chunks: chunks.length,
      pages: extracted.numberOfPages,
    };
  } catch (error) {
    console.error(`[Worker] Failed processing ${documentId}`, error);

    await markDocumentFailed(documentId, tenantId);

    throw error;
  }
}
