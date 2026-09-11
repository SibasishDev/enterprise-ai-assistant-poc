import { prisma } from "../config/database";

export async function markDocumentProcessing(
  documentId: string,
  tenantId: string,
) {
  return prisma.document.updateMany({
    where: {
      id: documentId,
      tenantId,
    },
    data: {
      status: "PROCESSING",
    },
  });
}

export async function markDocumentCompleted(
  documentId: string,
  tenantId: string,
) {
  return prisma.document.updateMany({
    where: {
      id: documentId,
      tenantId,
    },
    data: {
      status: "COMPLETED",
    },
  });
}

export async function markDocumentFailed(documentId: string, tenantId: string) {
  return prisma.document.updateMany({
    where: {
      id: documentId,
      tenantId,
    },
    data: {
      status: "FAILED",
    },
  });
}
