import * as vscode from 'vscode';
import { registerGenerateCommitCommand } from './commands/generateCommit';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const disposable = registerGenerateCommitCommand(context);
  context.subscriptions.push(disposable);

  // 自动迁移 Secrets 到 Settings(仅首次)
  await migrateSecretsToSettings(context);
}

async function migrateSecretsToSettings(context: vscode.ExtensionContext): Promise<void> {
  const providers = ['openai', 'claude', 'gemini', 'custom'];
  const config = vscode.workspace.getConfiguration('aiCommit');
  const migrationKey = 'secretsMigrated';

  const migrated = context.globalState.get<boolean>(migrationKey, false);
  if (migrated) {
    return;
  }

  for (const provider of providers) {
    const secret = await context.secrets.get(`aiCommit.${provider}.apiKey`);
    if (secret && !config.get(`${provider}.apiKey`)) {
      await config.update(`${provider}.apiKey`, secret, vscode.ConfigurationTarget.Global);
    }
  }

  await context.globalState.update(migrationKey, true);
}

export function deactivate(): void {
  // noop
}
