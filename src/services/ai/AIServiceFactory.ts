import { IAIService } from './IAIService';
import { OpenAIService } from './OpenAIService';
import { ClaudeService } from './ClaudeService';
import { GeminiService } from './GeminiService';
import { AIConfig, Provider } from '../../types/config';

export class AIServiceFactory {
  static create(config: AIConfig, apiKey: string): IAIService {
    switch (config.provider) {
      case Provider.OpenAI:
        return new OpenAIService(apiKey, config.baseUrl, config.model);
      case Provider.Claude:
        return new ClaudeService(apiKey, config.baseUrl, config.model);
      case Provider.Gemini:
        return new GeminiService(apiKey, config.baseUrl, config.model);
      case Provider.Custom:
        // Custom provider defaults to OpenAI-compatible API
        return new OpenAIService(apiKey, config.baseUrl, config.model);
      default:
        throw new Error(`Unsupported provider: ${config.provider as string}`);
    }
  }
}
