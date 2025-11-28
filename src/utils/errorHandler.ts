import * as vscode from 'vscode';
import axios from 'axios';

export class ErrorHandler {
  static handle(error: unknown): void {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        void vscode.window.showErrorMessage('API Key 无效，请检查配置');
      } else if (error.response?.status === 429) {
        void vscode.window.showErrorMessage('API 请求频率超限，请稍后重试');
      } else if (error.code === 'ENOTFOUND') {
        void vscode.window.showErrorMessage('网络连接失败，请检查网络设置');
      } else if (error.code === 'ECONNABORTED') {
        void vscode.window.showErrorMessage('请求超时，请稍后重试');
      } else {
        void vscode.window.showErrorMessage(`AI 服务错误: ${error.message}`);
      }
    } else if (error instanceof Error) {
      if (error.message.includes('No git repository')) {
        void vscode.window.showWarningMessage('当前工作区未初始化 Git 仓库');
      } else if (error.message.includes('Git extension not found')) {
        void vscode.window.showErrorMessage('未找到 Git 扩展，请确保已安装');
      } else if (error.message.includes('User cancelled')) {
        // User cancelled, no error message needed
      } else if (error.message.includes('API Key is required')) {
        void vscode.window.showErrorMessage('未配置 API Key');
      } else if (error.message.includes('Conventional Commits')) {
        void vscode.window.showErrorMessage('AI 生成的提交信息格式不符合规范，请重试');
      } else {
        void vscode.window.showErrorMessage(`错误: ${error.message}`);
      }
    } else {
      void vscode.window.showErrorMessage('未知错误');
    }
  }
}
