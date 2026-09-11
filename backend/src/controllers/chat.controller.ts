import { Request, Response } from "express";

import { z } from "zod";

import { askQuestionSchema } from "../validators/chat.validator";

import { askKnowledgeBase } from "../services/rag.service";

export async function askQuestion(req: Request, res: Response) {
  try {
    if (!req.auth) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }
    const input = askQuestionSchema.parse(req.body);

    const result = await askKnowledgeBase({
      tenantId: req.auth.tenantId,
      question: input.question,
      topK: input.topK,
    });

    return res.status(200).json({
      question: input.question,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid request",
        errors: error.issues,
      });
    }

    console.error("[ChatController]", error);

    return res.status(500).json({
      message: "Failed to generate answer",
    });
  }
}
