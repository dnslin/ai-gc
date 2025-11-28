import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommitController } from '@/controllers/CommitController';
import { GitService } from '@/services/git/GitService';
import { ConfigManager } from '@/services/config/ConfigManager';
import * as vscode from 'vscode';

vi.mock('@/services/git/GitService');
vi.mock('@/services/config/ConfigManager');
vi.mock('@/utils/diffProcessor', () => ({
  DiffProcessor: {
    process: vi.fn().mockResolvedValue({
      processedDiff: 'processed diff',
      isTruncated: false,
      lineCount: 100,
    }),
  },
}));
vi.mock('@/services/ai/AIServiceFactory', () => ({
  AIServiceFactory: {
    create: vi.fn().mockReturnValue({
      generateCommitMessage: vi.fn().mockResolvedValue({
        message: 'feat(test): add test feature',
        language: 'English',
      }),
    }),
  },
}));

vi.mock('vscode', () => ({
  window: {
    showWarningMessage: vi.fn(),
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    withProgress: vi.fn((_, task) => task({}, { onCancellationRequested: vi.fn() })),
  },
  ProgressLocation: {
    Notification: 15,
  },
}));

describe('CommitController', () => {
  let mockGitService: GitService;
  let mockConfigManager: ConfigManager;
  let controller: CommitController;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGitService = {
      getUnstagedDiff: vi.fn().mockResolvedValue('+ add feature'),
      setCommitMessage: vi.fn(),
    } as unknown as GitService;

    mockConfigManager = {
      getConfig: vi.fn().mockResolvedValue({
        provider: 'openai',
        model: 'gpt-4',
        language: 'English',
      }),
      getApiKey: vi.fn().mockResolvedValue('test-api-key'),
    } as unknown as ConfigManager;

    controller = new CommitController(mockGitService, mockConfigManager);
  });

  describe('generateCommit', () => {
    it('should generate and set commit message', async () => {
      await controller.generateCommit();

      expect(mockGitService.getUnstagedDiff).toHaveBeenCalled();
      expect(mockConfigManager.getConfig).toHaveBeenCalled();
      expect(mockConfigManager.getApiKey).toHaveBeenCalled();
      expect(mockGitService.setCommitMessage).toHaveBeenCalledWith('feat(test): add test feature');
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('提交信息已生成');
    });

    it('should show warning if diff is empty', async () => {
      vi.mocked(mockGitService.getUnstagedDiff).mockResolvedValue('');

      await controller.generateCommit();

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('工作区无变更，请先修改文件');
      expect(mockGitService.setCommitMessage).not.toHaveBeenCalled();
    });

    it('should append truncation marker if diff is truncated', async () => {
      const { DiffProcessor } = await import('@/utils/diffProcessor');
      vi.mocked(DiffProcessor.process).mockResolvedValue({
        processedDiff: 'truncated diff',
        isTruncated: true,
        lineCount: 15000,
      });

      await controller.generateCommit();

      expect(mockGitService.setCommitMessage).toHaveBeenCalledWith(
        'feat(test): add test feature (部分变更)',
      );
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(mockGitService.getUnstagedDiff).mockRejectedValue(new Error('Git error'));

      await controller.generateCommit();

      expect(mockGitService.setCommitMessage).not.toHaveBeenCalled();
    });
  });
});
