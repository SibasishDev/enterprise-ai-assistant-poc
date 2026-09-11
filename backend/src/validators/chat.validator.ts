import { z } from "zod";

export const askQuestionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(2, "Question is too short")
    .max(4000, "Question is too long"),

  topK: z.number().int().min(1).max(20).optional(),
});
