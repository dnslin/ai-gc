import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigManager } from '@/services/config/ConfigManager';
import * as vscode from 'vscode';

vi.mock('vscode', () => ({
  workspace: {
    getConfiguration: vi.fn(),
  },
  window: {
    showInputBox: vi.fn(),
  },
}));

describe('ConfigManager', () => {
  const mockContext = {
    secrets: {
      get: vi.fn(),
      store: vi.fn(),
    },
  } as unknown as vscode.ExtensionContext;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConfig', () => {
    it('should return default config', async () => {
      vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
        get: vi.fn((key, defaultValue) => defaultValue),
      } as any);

      const manager = new ConfigManager(mockContext);
      const config = await manager.getConfig();

      expect(config.provider).toBe('openai');
      expect(config.language).toBe('English');
      expect(config.model).toBe('gpt-4');
    });

    it('should return custom config', async () => {
      vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
        get: vi.fn((key) => {
          const values: Record<string, string> = {
            provider: 'claude',
            baseUrl: 'https://custom.api.com',
            model: 'custom-model',
            language: 'Chinese',
          };
          return values[key];
        }),
      } as any);

      const manager = new ConfigManager(mockContext);
      const config = await manager.getConfig();

      expect(config.provider).toBe('claude');
      expect(config.baseUrl).toBe('https://custom.api.com');
      expect(config.model).toBe('custom-model');
      expect(config.language).toBe('Chinese');
    });

    it('should use default model if not specified', async () => {
      vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
        get: vi.fn((key, defaultValue) => {
          if (key === 'provider') return 'gemini';
          return defaultValue || '';
        }),
      } as any);

      const manager = new ConfigManager(mockContext);
      const config = await manager.getConfig();

      expect(config.model).toBe('gemini-1.5-pro');
    });
  });

  describe('getApiKey', () => {
    it('should return existing API key', async () => {
      vi.mocked(mockContext.secrets.get).mockResolvedValue('existing-key');

      const manager = new ConfigManager(mockContext);
      const key = await manager.getApiKey('openai');

      expect(key).toBe('existing-key');
      expect(mockContext.secrets.get).toHaveBeenCalledWith('aiCommit.openai.apiKey');
    });

    it('should prompt for new API key if not exists', async () => {
      vi.mocked(mockContext.secrets.get).mockResolvedValue(undefined);
      vi.mocked(vscode.window.showInputBox).mockResolvedValue('new-key');

      const manager = new ConfigManager(mockContext);
      const key = await manager.getApiKey('openai');

      expect(key).toBe('new-key');
      expect(vscode.window.showInputBox).toHaveBeenCalledWith({
        prompt: expect.stringContaining('openai'),
        password: true,
        ignoreFocusOut: true,
      });
      expect(mockContext.secrets.store).toHaveBeenCalledWith('aiCommit.openai.apiKey', 'new-key');
    });

    it('should throw if user cancels input', async () => {
      vi.mocked(mockContext.secrets.get).mockResolvedValue(undefined);
      vi.mocked(vscode.window.showInputBox).mockResolvedValue(undefined);

      const manager = new ConfigManager(mockContext);

      await expect(manager.getApiKey('openai')).rejects.toThrow('API Key is required');
    });
  });
});
