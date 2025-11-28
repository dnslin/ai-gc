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
    const key = await this.context.secrets.get(`aiCommit.${provider}.apiKey`);
    if (!key) {
      const input = await vscode.window.showInputBox({
        prompt: `请输入 ${provider} 的 API Key`,
        password: true,
        ignoreFocusOut: true,
      });

      if (!input) {
        throw new Error('API Key is required');
      }

      await this.context.secrets.store(`aiCommit.${provider}.apiKey`, input);
      return input;
    }
    return key;
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
