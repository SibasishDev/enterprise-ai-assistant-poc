import { z } from "zod";

export const createUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.literal("application/pdf"),
  fileSize: z
    .number()
    .positive()
    .max(50 * 1024 * 1024),
  departmentId: z.string(),
  category: z.string(),
  documentType: z.string(),
});
