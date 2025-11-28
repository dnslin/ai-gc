import type * as vscode from 'vscode';

export class Logger {
  private static outputChannel: vscode.OutputChannel | null = (() => {
    // Lazy initialization to avoid vscode import issues in tests
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const vscode = require('vscode') as typeof import('vscode');
      return vscode.window.createOutputChannel('AI Git Commit');
    } catch {
      return null;
    }
  })();

  static info(message: string): void {
    this.log('INFO', message);
  }

  static error(message: string, error?: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.log('ERROR', `${message}: ${errorMessage}`);
  }

  static debug(message: string): void {
    this.log('DEBUG', message);
  }

  private static log(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    if (this.outputChannel) {
      this.outputChannel.appendLine(logMessage);
    } else {
      // eslint-disable-next-line no-console
      console.log(logMessage);
    }
  }
}
