import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigManager } from '@/services/config/ConfigManager';
import * as vscode from 'vscode';

vi.mock('vscode', () => ({
  workspace: {
    getConfiguration: vi.fn(),
  },
  window: {
    showWarningMessage: vi.fn(),
  },
  commands: {
    executeCommand: vi.fn(),
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
    it('should return existing API key from secrets', async () => {
      vi.mocked(mockContext.secrets.get).mockResolvedValue('existing-key');

      const manager = new ConfigManager(mockContext);
      const key = await manager.getApiKey('openai');

      expect(key).toBe('existing-key');
      expect(mockContext.secrets.get).toHaveBeenCalledWith('aiCommit.openai.apiKey');
      expect(vscode.workspace.getConfiguration).not.toHaveBeenCalled();
    });

    it('should fall back to settings and sync to secrets', async () => {
      vi.mocked(mockContext.secrets.get).mockResolvedValue(undefined);
      const configGet = vi.fn().mockReturnValue('settings-key');
      vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
        get: configGet,
      } as any);

      const manager = new ConfigManager(mockContext);
      const key = await manager.getApiKey('openai');

      expect(key).toBe('settings-key');
      expect(configGet).toHaveBeenCalledWith('openai.apiKey', '');
      expect(mockContext.secrets.store).toHaveBeenCalledWith('aiCommit.openai.apiKey', 'settings-key');
    });

    it('should return empty string when no key found', async () => {
      vi.mocked(mockContext.secrets.get).mockResolvedValue(undefined);
      const configGet = vi.fn().mockReturnValue('');
      vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
        get: configGet,
      } as any);

      const manager = new ConfigManager(mockContext);
      const key = await manager.getApiKey('openai');

      expect(key).toBe('');
      expect(configGet).toHaveBeenCalledWith('openai.apiKey', '');
      expect(mockContext.secrets.store).not.toHaveBeenCalled();
    });
  });

  describe('ensureApiKey', () => {
    it('should return key when available', async () => {
      vi.mocked(mockContext.secrets.get).mockResolvedValue('existing-key');

      const manager = new ConfigManager(mockContext);
      const key = await manager.ensureApiKey('openai');

      expect(key).toBe('existing-key');
      expect(vscode.window.showWarningMessage).not.toHaveBeenCalled();
    });

    it('should show warning and return null when key missing', async () => {
      vi.mocked(mockContext.secrets.get).mockResolvedValue(undefined);
      const configGet = vi.fn().mockReturnValue('');
      vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
        get: configGet,
      } as any);
      vi.mocked(vscode.window.showWarningMessage).mockResolvedValue(undefined);

      const manager = new ConfigManager(mockContext);
      const key = await manager.ensureApiKey('openai');

      expect(key).toBeNull();
      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        'openai API Key 未配置，请前往设置',
        '打开设置'
      );
      expect(vscode.commands.executeCommand).not.toHaveBeenCalled();
    });

    it('should open settings when user selects action', async () => {
      vi.mocked(mockContext.secrets.get).mockResolvedValue(undefined);
      const configGet = vi.fn().mockReturnValue('');
      vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
        get: configGet,
      } as any);
      vi.mocked(vscode.window.showWarningMessage).mockResolvedValue('打开设置');

      const manager = new ConfigManager(mockContext);
      const key = await manager.ensureApiKey('openai');

      expect(key).toBeNull();
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'workbench.action.openSettings',
        'aiCommit.openai.apiKey'
      );
    });
  });
});
