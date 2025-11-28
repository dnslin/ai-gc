import { vi } from 'vitest';

const noop = vi.fn();

(globalThis as Record<string, unknown>).vscode = {
  commands: {
    registerCommand: noop
  },
  window: {
    showInformationMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    showErrorMessage: vi.fn()
  },
  workspace: {
    getConfiguration: vi.fn()
  }
} as unknown;

export {};
