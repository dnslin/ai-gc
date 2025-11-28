import * as vscode from 'vscode';
import { CommitController } from '../controllers/CommitController';
import { GitService } from '../services/git/GitService';
import { ConfigManager } from '../services/config/ConfigManager';
import { Logger } from '../utils/logger';

export function registerGenerateCommitCommand(
  context: vscode.ExtensionContext,
): vscode.Disposable {
  return vscode.commands.registerCommand('aiCommit.generate', async () => {
    try {
      Logger.info('Command aiCommit.generate invoked');

      const gitService = new GitService();
      const configManager = new ConfigManager(context);
      const controller = new CommitController(gitService, configManager);

      await controller.generateCommit();
    } catch (error) {
      Logger.error('Command execution failed', error);
      if (error instanceof Error) {
        void vscode.window.showErrorMessage(error.message);
      }
    }
  });
}
