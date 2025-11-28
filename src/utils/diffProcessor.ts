import * as vscode from 'vscode';

export interface ProcessedDiff {
  processedDiff: string;
  isTruncated: boolean;
  lineCount: number;
}

export class DiffProcessor {
  private static readonly MAX_LINES = 10000;
  private static readonly TRUNCATE_LINES = 5000;

  static async process(diff: string): Promise<ProcessedDiff> {
    const lines = diff.split('\n');
    const lineCount = lines.length;

    if (lineCount > this.MAX_LINES) {
      // 提示用户分批提交
      const shouldContinue = await vscode.window.showWarningMessage(
        `检测到 ${lineCount} 行变更（超过 ${this.MAX_LINES} 行），建议分批提交以获得更准确的描述。`,
        '继续生成',
        '取消',
      );

      if (shouldContinue !== '继续生成') {
        throw new Error('User cancelled generation');
      }

      // 截断到前 5000 行
      return {
        processedDiff: lines.slice(0, this.TRUNCATE_LINES).join('\n'),
        isTruncated: true,
        lineCount,
      };
    }

    return { processedDiff: diff, isTruncated: false, lineCount };
  }
}
