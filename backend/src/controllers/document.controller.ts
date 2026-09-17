import { Request, Response } from "express";

import { createUploadSchema } from "../validators/document.validator";
import { createUploadUrl } from "../services/document.service";

export async function createDocumentUpload(req: Request, res: Response) {
  const input = createUploadSchema.parse(req.body);

  if (!req.auth) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const result = await createUploadUrl({
    tenantId: req.auth.tenantId,
    fileName: input.fileName,
    contentType: input.contentType,
    fileSize: input.fileSize,
    departmentId: input.departmentId,
    category: input.category,
    documentType: input.documentType,
  });

  return res.status(201).json(result);
}
