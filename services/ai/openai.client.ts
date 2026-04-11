import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? "placeholder-set-in-env",
    });
  }
  return _client;
}

// Keep named export for convenience
export { _client as openai };
