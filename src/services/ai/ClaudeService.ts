import axios, { AxiosInstance } from 'axios';
import { IAIService } from './IAIService';
import { CommitMessageRequest, CommitMessageResponse } from '../../types/git';
import { PromptBuilder } from './PromptBuilder';
import { ClaudeResponse } from '../../types/api-responses';

export class ClaudeService implements IAIService {
  private client: AxiosInstance;
  private model: string;

  constructor(apiKey: string, baseUrl?: string, model?: string) {
    this.model = model || 'claude-3-5-sonnet-20241022';
    this.client = axios.create({
      baseURL: baseUrl || 'https://api.anthropic.com',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async generateCommitMessage(request: CommitMessageRequest): Promise<CommitMessageResponse> {
    const systemPrompt = PromptBuilder.buildSystemPrompt(request.language);
    const userPrompt = PromptBuilder.buildUserPrompt(request.diff, request.language);

    const response = await this.client.post('/v1/messages', {
      model: this.model,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      max_tokens: 200,
      temperature: 0.3,
    });

    const data = response.data as ClaudeResponse;
    const message = data.content[0].text.trim();
    this.validateFormat(message);

    return {
      message,
      language: request.language,
      partial: request.truncated,
    };
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.client.post('/v1/messages', {
        model: this.model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      });
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
