import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";

import { askQuestion } from "../controllers/chat.controller";

const router = Router();

router.post("/", authenticate, askQuestion);

export default router;
