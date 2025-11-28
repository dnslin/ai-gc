import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { OpenAIService } from '@/services/ai/OpenAIService';

vi.mock('axios');

describe('OpenAIService', () => {
  const mockApiKey = 'test-api-key';
  const mockBaseUrl = 'https://api.openai.com';
  const mockModel = 'gpt-4';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateCommitMessage', () => {
    it('should generate valid commit message', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: 'feat(auth): add JWT validation',
              },
            },
          ],
        },
      };

      vi.mocked(axios.create).mockReturnValue({
        post: vi.fn().mockResolvedValue(mockResponse),
        get: vi.fn(),
      } as any);

      const service = new OpenAIService(mockApiKey, mockBaseUrl, mockModel);
      const result = await service.generateCommitMessage({
        diff: '+ add JWT validation',
        language: 'English',
      });

      expect(result.message).toBe('feat(auth): add JWT validation');
      expect(result.language).toBe('English');
    });

    it('should reject invalid commit message format', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: 'Invalid format message',
              },
            },
          ],
        },
      };

      vi.mocked(axios.create).mockReturnValue({
        post: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const service = new OpenAIService(mockApiKey);

      await expect(
        service.generateCommitMessage({
          diff: '+ add feature',
          language: 'English',
        }),
      ).rejects.toThrow('does not follow Conventional Commits format');
    });

    it('should handle truncated diff', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: 'fix(api): handle null response',
              },
            },
          ],
        },
      };

      vi.mocked(axios.create).mockReturnValue({
        post: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const service = new OpenAIService(mockApiKey);
      const result = await service.generateCommitMessage({
        diff: '+ fix null handling',
        language: 'English',
        truncated: true,
      });

      expect(result.partial).toBe(true);
    });

    it('should handle API errors', async () => {
      vi.mocked(axios.create).mockReturnValue({
        post: vi.fn().mockRejectedValue(new Error('API Error')),
      } as any);

      const service = new OpenAIService(mockApiKey);

      await expect(
        service.generateCommitMessage({
          diff: '+ add feature',
          language: 'English',
        }),
      ).rejects.toThrow('API Error');
    });
  });

  describe('validateConnection', () => {
    it('should return true for valid connection', async () => {
      vi.mocked(axios.create).mockReturnValue({
        get: vi.fn().mockResolvedValue({}),
      } as any);

      const service = new OpenAIService(mockApiKey);
      const result = await service.validateConnection();

      expect(result).toBe(true);
    });

    it('should return false for invalid connection', async () => {
      vi.mocked(axios.create).mockReturnValue({
        get: vi.fn().mockRejectedValue(new Error('Connection failed')),
      } as any);

      const service = new OpenAIService(mockApiKey);
      const result = await service.validateConnection();

      expect(result).toBe(false);
    });
  });
});
