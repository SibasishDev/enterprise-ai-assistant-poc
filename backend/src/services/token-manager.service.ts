import { ContextDocument } from "./context.service";

interface TokenManagerInput {
  contexts: ContextDocument[];

  maxContextTokens?: number;
}

export function selectContextsByTokenBudget(
  input: TokenManagerInput,
): ContextDocument[] {
  const maxTokens = input.maxContextTokens ?? 5000;

  const selected: ContextDocument[] = [];

  let currentTokens = 0;

  for (const context of input.contexts) {
    const estimatedTokens = Math.ceil(context.content.length / 4);

    if (currentTokens + estimatedTokens > maxTokens) {
      break;
    }

    selected.push(context);

    currentTokens += estimatedTokens;
  }

  return selected;
}
