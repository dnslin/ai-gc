import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { GeminiService } from '@/services/ai/GeminiService';

vi.mock('axios');

describe('GeminiService', () => {
  const mockApiKey = 'test-api-key';
  const mockBaseUrl = 'https://generativelanguage.googleapis.com';
  const mockModel = 'gemini-1.5-pro';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateCommitMessage', () => {
    it('should generate valid commit message', async () => {
      const mockResponse = {
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: 'feat(ui): add dark mode toggle',
                  },
                ],
              },
            },
          ],
        },
      };

      vi.mocked(axios.create).mockReturnValue({
        post: vi.fn().mockResolvedValue(mockResponse),
        get: vi.fn(),
      } as any);

      const service = new GeminiService(mockApiKey, mockBaseUrl, mockModel);
      const result = await service.generateCommitMessage({
        diff: '+ add dark mode',
        language: 'English',
      });

      expect(result.message).toBe('feat(ui): add dark mode toggle');
    });

    it('should append API key to URL', async () => {
      const mockPost = vi.fn().mockResolvedValue({
        data: {
          candidates: [
            {
              content: {
                parts: [{ text: 'fix(api): handle timeout' }],
              },
            },
          ],
        },
      });

      vi.mocked(axios.create).mockReturnValue({
        post: mockPost,
      } as any);

      const service = new GeminiService(mockApiKey);
      await service.generateCommitMessage({
        diff: '+ handle timeout',
        language: 'English',
      });

      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining(`?key=${mockApiKey}`),
        expect.any(Object),
      );
    });

    it('should reject invalid format', async () => {
      vi.mocked(axios.create).mockReturnValue({
        post: vi.fn().mockResolvedValue({
          data: {
            candidates: [
              {
                content: {
                  parts: [{ text: 'Bad format' }],
                },
              },
            ],
          },
        }),
      } as any);

      const service = new GeminiService(mockApiKey);

      await expect(
        service.generateCommitMessage({
          diff: '+ add feature',
          language: 'English',
        }),
      ).rejects.toThrow('does not follow Conventional Commits format');
    });
  });

  describe('validateConnection', () => {
    it('should return true for valid connection', async () => {
      vi.mocked(axios.create).mockReturnValue({
        get: vi.fn().mockResolvedValue({}),
      } as any);

      const service = new GeminiService(mockApiKey);
      const result = await service.validateConnection();

      expect(result).toBe(true);
    });

    it('should return false for invalid connection', async () => {
      vi.mocked(axios.create).mockReturnValue({
        get: vi.fn().mockRejectedValue(new Error('Failed')),
      } as any);

      const service = new GeminiService(mockApiKey);
      const result = await service.validateConnection();

      expect(result).toBe(false);
    });
  });
});
