import axios, { AxiosInstance } from 'axios';
import { IAIService } from './IAIService';
import { CommitMessageRequest, CommitMessageResponse } from '../../types/git';
import { PromptBuilder } from './PromptBuilder';
import { OpenAIResponse } from '../../types/api-responses';

export class OpenAIService implements IAIService {
  private client: AxiosInstance;
  private model: string;

  constructor(apiKey: string, baseUrl?: string, model?: string) {
    this.model = model || 'gpt-4';
    this.client = axios.create({
      baseURL: baseUrl || 'https://api.openai.com',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async generateCommitMessage(request: CommitMessageRequest): Promise<CommitMessageResponse> {
    const systemPrompt = PromptBuilder.buildSystemPrompt(request.language);
    const userPrompt = PromptBuilder.buildUserPrompt(request.diff, request.language);

    const response = await this.client.post('/v1/chat/completions', {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const data = response.data as OpenAIResponse;
    const message = data.choices[0].message.content.trim();
    this.validateFormat(message);

    return {
      message,
      language: request.language,
      partial: request.truncated,
    };
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.client.get('/v1/models');
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
