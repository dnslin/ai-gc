import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as vscode from 'vscode';

// Mock VS Code API
vi.mock('vscode', async () => {
  return {
    commands: {
      registerCommand: vi.fn((_, handler) => {
        // Store handler for testing
        (globalThis as any).__commandHandler = handler;
        return { dispose: vi.fn() };
      }),
    },
    window: {
      showInformationMessage: vi.fn(),
      showWarningMessage: vi.fn(),
      showErrorMessage: vi.fn(),
      showInputBox: vi.fn(),
      withProgress: vi.fn((_, task) => task({}, { onCancellationRequested: vi.fn() })),
      createOutputChannel: vi.fn(() => ({
        appendLine: vi.fn(),
      })),
    },
    workspace: {
      getConfiguration: vi.fn(() => ({
        get: vi.fn((key, defaultValue) => defaultValue),
        update: vi.fn().mockResolvedValue(undefined),
      })),
    },
    extensions: {
      getExtension: vi.fn(() => ({
        isActive: true,
        exports: {
          getAPI: vi.fn(() => ({
            repositories: [
              {
                diff: vi.fn().mockResolvedValue('+ add new feature'),
                inputBox: { value: '' },
              },
            ],
          })),
        },
      })),
    },
    ConfigurationTarget: {
      Global: 1,
      Workspace: 2,
      WorkspaceFolder: 3,
    },
    ProgressLocation: {
      Notification: 15,
    },
  };
});

describe('Extension E2E', () => {
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    vi.clearAllMocks();

    mockContext = {
      subscriptions: [],
      secrets: {
        get: vi.fn().mockResolvedValue('test-api-key'),
        store: vi.fn(),
      },
      globalState: {
        get: vi.fn().mockReturnValue(false),
        update: vi.fn(),
      },
    } as unknown as vscode.ExtensionContext;
  });

  it('should activate extension and register command', async () => {
    const { activate } = await import('@/extension');

    activate(mockContext);

    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'aiCommit.generate',
      expect.any(Function),
    );
    expect(mockContext.subscriptions.length).toBeGreaterThan(0);
  });

  it('should deactivate extension without errors', async () => {
    const { deactivate } = await import('@/extension');

    expect(() => deactivate()).not.toThrow();
  });

  it('should handle command execution', async () => {
    // Import and activate
    const { activate } = await import('@/extension');
    activate(mockContext);

    // Get the registered command handler
    const handler = (globalThis as any).__commandHandler;
    expect(handler).toBeDefined();

    // Mock AI service response
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

    // Execute command
    await handler();

    // Verify SCM interaction
    expect(vscode.extensions.getExtension).toHaveBeenCalledWith('vscode.git');
  });
});
