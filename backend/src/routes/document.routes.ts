import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createDocumentUpload } from "../controllers/document.controller";
import { requireRoles } from "../middleware/rbac.middleware";
import { UserRole } from "@prisma/client";
import {
  getDocumentAccess,
  updateDocumentAccess,
} from "../controllers/document-access.controller";

const router = Router();

router.post("/upload-url", authenticate, createDocumentUpload);

router.get(
  "/:documentId/access",
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN),
  getDocumentAccess,
);

router.put(
  "/:documentId/access",
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN),
  updateDocumentAccess,
);

export default router;
