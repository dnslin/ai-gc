import * as vscode from 'vscode';
import { GitService } from '../services/git/GitService';
import { DiffProcessor } from '../utils/diffProcessor';
import { ConfigManager } from '../services/config/ConfigManager';
import { AIServiceFactory } from '../services/ai/AIServiceFactory';
import { ErrorHandler } from '../utils/errorHandler';
import { Logger } from '../utils/logger';

export class CommitController {
  constructor(
    private gitService: GitService,
    private configManager: ConfigManager,
  ) {}

  async generateCommit(): Promise<void> {
    try {
      Logger.info('Starting commit message generation');

      // 1. 获取工作区未暂存的变更
      const rawDiff = await this.gitService.getUnstagedDiff();
      if (!rawDiff || rawDiff.trim() === '') {
        void vscode.window.showWarningMessage('工作区无变更，请先修改文件');
        return;
      }

      Logger.debug(`Diff size: ${rawDiff.length} characters`);

      // 2. 处理 diff（截断检查）
      const { processedDiff, isTruncated } = await DiffProcessor.process(rawDiff);

      // 3. 获取配置
      const config = this.configManager.getConfig();
      const apiKey = await this.configManager.getApiKey(config.provider);

      Logger.info(`Using provider: ${config.provider}, model: ${config.model}`);

      // 4. 创建 AI 服务
      const aiService = AIServiceFactory.create(config, apiKey);

      // 5. 显示加载状态
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'AI 正在生成提交信息...',
          cancellable: true,
        },
        async (progress, token) => {
          token.onCancellationRequested(() => {
            Logger.info('User cancelled generation');
            throw new Error('User cancelled');
          });

          // 6. 调用 AI 生成
          const result = await aiService.generateCommitMessage({
            diff: processedDiff,
            language: config.language,
            truncated: isTruncated,
          });

          // 7. 填充到 SCM 输入框
          let message = result.message;
          if (isTruncated) {
            message += ' (部分变更)';
          }

          this.gitService.setCommitMessage(message);
          Logger.info(`Generated commit message: ${message}`);

          void vscode.window.showInformationMessage('提交信息已生成');
        },
      );
    } catch (error) {
      Logger.error('Failed to generate commit message', error);
      ErrorHandler.handle(error);
    }
  }
}
