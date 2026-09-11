import { readPdfText } from "pdf-text-reader";

export interface ExtractedPdf {
  text: string;
  numberOfPages: number; // Note: adjust depending on package API
}

export async function extractPdfText(buffer: Buffer): Promise<ExtractedPdf> {
  // Modern packages accept buffers natively or handle strings asynchronously
  const binaryData = new Uint8Array(buffer);

  const pages = await readPdfText({ data: binaryData });

  return {
    text: pages,
    numberOfPages: 1, // If page counting is needed, use pdf-text-reader's page array length
  };
}
