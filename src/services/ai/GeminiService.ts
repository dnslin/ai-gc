import axios, { AxiosInstance } from 'axios';
import { IAIService } from './IAIService';
import { CommitMessageRequest, CommitMessageResponse } from '../../types/git';
import { PromptBuilder } from './PromptBuilder';
import { GeminiResponse } from '../../types/api-responses';

export class GeminiService implements IAIService {
  private client: AxiosInstance;
  private model: string;
  private apiKey: string;

  constructor(apiKey: string, baseUrl?: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || 'gemini-1.5-pro';
    this.client = axios.create({
      baseURL: baseUrl || 'https://generativelanguage.googleapis.com',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async generateCommitMessage(request: CommitMessageRequest): Promise<CommitMessageResponse> {
    const systemPrompt = PromptBuilder.buildSystemPrompt(request.language);
    const userPrompt = PromptBuilder.buildUserPrompt(request.diff, request.language);

    const response = await this.client.post(
      `/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200,
        },
      },
    );

    const data = response.data as GeminiResponse;
    const message = data.candidates[0].content.parts[0].text.trim();
    this.validateFormat(message);

    return {
      message,
      language: request.language,
      partial: request.truncated,
    };
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.client.get(`/v1beta/models/${this.model}?key=${this.apiKey}`);
      return true;
    } catch {
      return false;
    }
  }

  private validateFormat(message: string): void {
    const regex =
      /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|deps)(\([a-z]+\))?: .+$/;
    if (!regex.test(message)) {
      throw new Error('AI generated message does not follow Conventional Commits format');
    }
  }
}
