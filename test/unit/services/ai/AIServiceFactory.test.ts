import { describe, it, expect } from 'vitest';
import { AIServiceFactory } from '@/services/ai/AIServiceFactory';
import { OpenAIService } from '@/services/ai/OpenAIService';
import { ClaudeService } from '@/services/ai/ClaudeService';
import { GeminiService } from '@/services/ai/GeminiService';
import { Provider } from '@/types/config';

describe('AIServiceFactory', () => {
  const mockApiKey = 'test-api-key';

  it('should create OpenAI service', () => {
    const service = AIServiceFactory.create(
      {
        provider: Provider.OpenAI,
        model: 'gpt-4',
        language: 'English',
      },
      mockApiKey,
    );

    expect(service).toBeInstanceOf(OpenAIService);
  });

  it('should create Claude service', () => {
    const service = AIServiceFactory.create(
      {
        provider: Provider.Claude,
        model: 'claude-3-5-sonnet-20241022',
        language: 'English',
      },
      mockApiKey,
    );

    expect(service).toBeInstanceOf(ClaudeService);
  });

  it('should create Gemini service', () => {
    const service = AIServiceFactory.create(
      {
        provider: Provider.Gemini,
        model: 'gemini-1.5-pro',
        language: 'English',
      },
      mockApiKey,
    );

    expect(service).toBeInstanceOf(GeminiService);
  });

  it('should create Custom provider as OpenAI-compatible', () => {
    const service = AIServiceFactory.create(
      {
        provider: Provider.Custom,
        baseUrl: 'https://custom.api.com',
        model: 'custom-model',
        language: 'English',
      },
      mockApiKey,
    );

    expect(service).toBeInstanceOf(OpenAIService);
  });

  it('should throw for unsupported provider', () => {
    expect(() =>
      AIServiceFactory.create(
        {
          provider: 'unsupported' as Provider,
          model: 'test',
          language: 'English',
        },
        mockApiKey,
      ),
    ).toThrow('Unsupported provider');
  });
});
