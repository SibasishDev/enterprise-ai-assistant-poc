export interface DocumentUploadedMessage {
  eventType: "DOCUMENT_UPLOADED";
  documentId: string;
  tenantId: string;
  s3Key: string;
}
