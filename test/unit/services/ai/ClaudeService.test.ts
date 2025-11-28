import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ClaudeService } from '@/services/ai/ClaudeService';

vi.mock('axios');

describe('ClaudeService', () => {
  const mockApiKey = 'test-api-key';
  const mockBaseUrl = 'https://api.anthropic.com';
  const mockModel = 'claude-3-5-sonnet-20241022';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateCommitMessage', () => {
    it('should generate valid commit message', async () => {
      const mockResponse = {
        data: {
          content: [
            {
              text: 'feat(auth): add OAuth support',
            },
          ],
        },
      };

      vi.mocked(axios.create).mockReturnValue({
        post: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const service = new ClaudeService(mockApiKey, mockBaseUrl, mockModel);
      const result = await service.generateCommitMessage({
        diff: '+ add OAuth support',
        language: 'English',
      });

      expect(result.message).toBe('feat(auth): add OAuth support');
    });

    it('should include anthropic-version header', async () => {
      const mockPost = vi.fn().mockResolvedValue({
        data: {
          content: [{ text: 'fix(api): handle errors' }],
        },
      });

      vi.mocked(axios.create).mockReturnValue({
        post: mockPost,
      } as any);

      const service = new ClaudeService(mockApiKey);
      await service.generateCommitMessage({
        diff: '+ add error handling',
        language: 'English',
      });

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'anthropic-version': '2023-06-01',
            'x-api-key': mockApiKey,
          }),
        }),
      );
    });

    it('should reject invalid format', async () => {
      vi.mocked(axios.create).mockReturnValue({
        post: vi.fn().mockResolvedValue({
          data: {
            content: [{ text: 'Invalid message' }],
          },
        }),
      } as any);

      const service = new ClaudeService(mockApiKey);

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
        post: vi.fn().mockResolvedValue({}),
      } as any);

      const service = new ClaudeService(mockApiKey);
      const result = await service.validateConnection();

      expect(result).toBe(true);
    });

    it('should return false for invalid connection', async () => {
      vi.mocked(axios.create).mockReturnValue({
        post: vi.fn().mockRejectedValue(new Error('Failed')),
      } as any);

      const service = new ClaudeService(mockApiKey);
      const result = await service.validateConnection();

      expect(result).toBe(false);
    });
  });
});
