import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitService } from '@/services/git/GitService';
import * as vscode from 'vscode';

vi.mock('vscode', () => ({
  extensions: {
    getExtension: vi.fn(),
  },
}));

describe('GitService', () => {
  const mockRepository = {
    diff: vi.fn(),
    inputBox: { value: '' },
  };

  const mockGitAPI = {
    repositories: [mockRepository],
  };

  const mockGitExtension = {
    isActive: true,
    exports: {
      getAPI: vi.fn().mockReturnValue(mockGitAPI),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(vscode.extensions.getExtension).mockReturnValue(mockGitExtension as any);
  });

  describe('constructor', () => {
    it('should throw if Git extension not found', () => {
      vi.mocked(vscode.extensions.getExtension).mockReturnValue(undefined);

      expect(() => new GitService()).toThrow('Git extension not found');
    });

    it('should initialize successfully', () => {
      expect(() => new GitService()).not.toThrow();
    });
  });

  describe('getUnstagedDiff', () => {
    it('should return unstaged diff from working directory', async () => {
      const mockDiff = '+ add new feature\n- remove old code';
      mockRepository.diff.mockResolvedValue(mockDiff);

      const service = new GitService();
      const result = await service.getUnstagedDiff();

      expect(result).toBe(mockDiff);
      expect(mockRepository.diff).toHaveBeenCalledWith(false);
    });

    it('should handle empty diff', async () => {
      mockRepository.diff.mockResolvedValue('');

      const service = new GitService();
      const result = await service.getUnstagedDiff();

      expect(result).toBe('');
    });

    it('should throw if git extension is not active', async () => {
      vi.mocked(vscode.extensions.getExtension).mockReturnValue({
        ...mockGitExtension,
        isActive: false,
        exports: undefined,
      } as any);

      const service = new GitService();

      await expect(service.getUnstagedDiff()).rejects.toThrow('Git extension is not active');
    });
  });

  describe('setCommitMessage', () => {
    it('should set commit message in SCM input box', () => {
      const service = new GitService();
      const message = 'feat(auth): add JWT validation';

      service.setCommitMessage(message);

      expect(mockRepository.inputBox.value).toBe(message);
    });

    it('should overwrite existing message', () => {
      mockRepository.inputBox.value = 'old message';

      const service = new GitService();
      service.setCommitMessage('new message');

      expect(mockRepository.inputBox.value).toBe('new message');
    });
  });

  describe('getRepository', () => {
    it('should throw if no repository found', () => {
      mockGitAPI.repositories = [];

      const service = new GitService();

      expect(() => service['getRepository']()).toThrow('No git repository found');
    });
  });
});
