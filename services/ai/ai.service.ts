import { getOpenAIClient } from "./openai.client";
import { PROMPTS } from "./prompts";

type MatchResult = {
  score: number;
  reasoning: string;
  strengths: string[];
  gaps: string[];
};

type CVAnalysis = {
  skills: string[];
  experienceYears: number;
  currentRole: string | null;
  education: string;
  languages: { language: string; level: string }[];
  summary: string;
};

class AIService {
  private async chat(prompt: string, model = "gpt-4o-mini"): Promise<string> {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    return response.choices[0]?.message?.content ?? "";
  }

  private parseJSON<T>(raw: string): T {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as T;
  }

  async scoreMatch(cvText: string, jobDescription: string, requirements: string[]): Promise<MatchResult> {
    const raw = await this.chat(PROMPTS.matchScore(cvText, jobDescription, requirements), "gpt-4o-mini");
    return this.parseJSON<MatchResult>(raw);
  }

  async generateCoverLetter(cvText: string, jobTitle: string, company: string, jobDescription: string, userName: string): Promise<string> {
    return this.chat(PROMPTS.coverLetter(cvText, jobTitle, company, jobDescription, userName), "gpt-4o");
  }

  async analyzeCV(cvText: string): Promise<CVAnalysis> {
    const raw = await this.chat(PROMPTS.cvAnalysis(cvText), "gpt-4o-mini");
    return this.parseJSON<CVAnalysis>(raw);
  }
}

export const aiService = new AIService();
