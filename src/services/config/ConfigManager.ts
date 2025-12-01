import * as vscode from 'vscode';
import { AIConfig, Provider } from '../../types/config';

export class ConfigManager {
  constructor(private context: vscode.ExtensionContext) {}

  getConfig(): AIConfig {
    const config = vscode.workspace.getConfiguration('aiCommit');

    const provider = config.get<string>('provider', 'openai') as Provider;
    const baseUrl = config.get<string>('baseUrl', '');
    const model = config.get<string>('model', '');
    const language = config.get<'English' | 'Chinese'>('language', 'English');

    return {
      provider,
      baseUrl: baseUrl || undefined,
      model: model || this.getDefaultModel(provider),
      language,
    };
  }

  async getApiKey(provider: string): Promise<string> {
    // 优先级 1: Secrets API(向后兼容)
    const secretKey = await this.context.secrets.get(`aiCommit.${provider}.apiKey`);
    if (secretKey) {
      return secretKey;
    }

    // 优先级 2: Settings UI
    const settingsKey = vscode.workspace
      .getConfiguration('aiCommit')
      .get<string>(`${provider}.apiKey`, '');

    if (settingsKey) {
      // 同步写入 Secrets 保持加密
      await this.context.secrets.store(`aiCommit.${provider}.apiKey`, settingsKey);
      return settingsKey;
    }

    // 优先级 3: 返回空触发通知
    return '';
  }

  async ensureApiKey(provider: string): Promise<string | null> {
    const key = await this.getApiKey(provider);
    if (key) {
      return key;
    }

    const action = await vscode.window.showWarningMessage(
      `${provider} API Key 未配置，请前往设置`,
      '打开设置'
    );

    if (action === '打开设置') {
      await vscode.commands.executeCommand(
        'workbench.action.openSettings',
        `aiCommit.${provider}.apiKey`
      );
    }

    return null;
  }

  private getDefaultModel(provider: Provider): string {
    switch (provider) {
      case Provider.OpenAI:
        return 'gpt-4';
      case Provider.Claude:
        return 'claude-3-5-sonnet-20241022';
      case Provider.Gemini:
        return 'gemini-1.5-pro';
      case Provider.Custom:
        return 'gpt-4';
      default:
        return 'gpt-4';
    }
  }
}
