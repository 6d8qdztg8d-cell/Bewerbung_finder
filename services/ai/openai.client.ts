import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined;
};

// Default client — uses OPENAI_API_KEY from env
export const openai =
  globalForOpenAI.openai ??
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

if (process.env.NODE_ENV !== "production") {
  globalForOpenAI.openai = openai;
}

/**
 * Returns an OpenAI client configured with the given key.
 * Falls back to the shared env-based client if no key is provided.
 */
export function getOpenAIClient(apiKey?: string | null): OpenAI {
  if (apiKey && apiKey !== "sk-...") {
    return new OpenAI({ apiKey });
  }
  return openai;
}
