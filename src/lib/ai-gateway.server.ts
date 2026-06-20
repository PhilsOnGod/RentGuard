import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Portable AI provider. By default uses Lovable AI Gateway (no extra setup),
 * but if you set AI_PROVIDER_BASE_URL + AI_PROVIDER_API_KEY in your own .env
 * (e.g. OpenAI: https://api.openai.com/v1, OpenRouter, Groq, etc.) it will
 * use that instead — making the project fully independent of Lovable.
 */
export function createAiProvider() {
  const customBase = process.env.AI_PROVIDER_BASE_URL;
  const customKey = process.env.AI_PROVIDER_API_KEY;

  if (customBase && customKey) {
    return createOpenAICompatible({
      name: "custom-ai",
      baseURL: customBase,
      headers: { Authorization: `Bearer ${customKey}` },
    });
  }
}
/** Model id. Override with AI_MODEL in env when using a non-Lovable provider. */
export function getAiModelId() {
  return process.env.AI_MODEL || "google/gemini-3-flash-preview";
}
