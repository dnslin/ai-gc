import * as vscode from 'vscode';
import { registerGenerateCommitCommand } from './commands/generateCommit';

export function activate(context: vscode.ExtensionContext): void {
  const disposable = registerGenerateCommitCommand(context);
  context.subscriptions.push(disposable);
}

export function deactivate(): void {
  // noop
}
