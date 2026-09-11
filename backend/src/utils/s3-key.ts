export function buildDocumentKey(tenantId: string, documentId: string) {
  return `tenats/${tenantId}/documents/${documentId}/original.pdf`;
}
