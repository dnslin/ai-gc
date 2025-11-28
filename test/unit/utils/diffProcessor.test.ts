import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiffProcessor } from '@/utils/diffProcessor';
import * as vscode from 'vscode';

vi.mock('vscode', () => ({
  window: {
    showWarningMessage: vi.fn(),
  },
}));

describe('DiffProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('process', () => {
    it('should process small diff without truncation', async () => {
      const diff = Array(100)
        .fill('+ add line')
        .join('\n');

      const result = await DiffProcessor.process(diff);

      expect(result.isTruncated).toBe(false);
      expect(result.lineCount).toBe(100);
      expect(result.processedDiff).toBe(diff);
    });

    it('should prompt user when diff exceeds 10k lines', async () => {
      const diff = Array(15000)
        .fill('+ add line')
        .join('\n');

      vi.mocked(vscode.window.showWarningMessage).mockResolvedValue('继续生成' as any);

      const result = await DiffProcessor.process(diff);

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        expect.stringContaining('15000 行变更'),
        '继续生成',
        '取消',
      );
      expect(result.isTruncated).toBe(true);
      expect(result.lineCount).toBe(15000);
    });

    it('should truncate diff to 5000 lines when user continues', async () => {
      const diff = Array(15000)
        .fill('+ add line')
        .join('\n');

      vi.mocked(vscode.window.showWarningMessage).mockResolvedValue('继续生成' as any);

      const result = await DiffProcessor.process(diff);

      const truncatedLines = result.processedDiff.split('\n').length;
      expect(truncatedLines).toBe(5000);
    });

    it('should throw when user cancels', async () => {
      const diff = Array(15000)
        .fill('+ add line')
        .join('\n');

      vi.mocked(vscode.window.showWarningMessage).mockResolvedValue('取消' as any);

      await expect(DiffProcessor.process(diff)).rejects.toThrow('User cancelled generation');
    });

    it('should handle exactly 10k lines without prompt', async () => {
      const diff = Array(10000)
        .fill('+ add line')
        .join('\n');

      const result = await DiffProcessor.process(diff);

      expect(vscode.window.showWarningMessage).not.toHaveBeenCalled();
      expect(result.isTruncated).toBe(false);
    });

    it('should handle empty diff', async () => {
      const result = await DiffProcessor.process('');

      expect(result.lineCount).toBe(1); // empty string splits to 1 element
      expect(result.isTruncated).toBe(false);
    });

    it('should handle boundary at 10001 lines', async () => {
      const diff = Array(10001)
        .fill('+ add line')
        .join('\n');

      vi.mocked(vscode.window.showWarningMessage).mockResolvedValue('继续生成' as any);

      const result = await DiffProcessor.process(diff);

      expect(vscode.window.showWarningMessage).toHaveBeenCalled();
      expect(result.isTruncated).toBe(true);
    });
  });
});
