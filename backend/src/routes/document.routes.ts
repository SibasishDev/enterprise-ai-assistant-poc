import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createDocumentUpload } from "../controllers/document.controller";

const router = Router();

router.post("/upload-url", authenticate, createDocumentUpload);

export default router;
