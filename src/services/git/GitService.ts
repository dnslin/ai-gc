import * as vscode from 'vscode';

interface GitExtension {
  getAPI(version: number): GitAPI;
}

interface GitAPI {
  repositories: Repository[];
}

interface Repository {
  diff(cached: boolean): Promise<string>;
  inputBox: { value: string };
}

export class GitService {
  private gitExtension: GitExtension | undefined;

  constructor() {
    const ext = vscode.extensions.getExtension<GitExtension>('vscode.git');
    if (!ext) {
      throw new Error('Git extension not found');
    }
    this.gitExtension = ext.isActive ? ext.exports : undefined;
  }

  /**
   * 获取工作区未暂存的变更 (unstaged changes in working directory)
   * @returns Git diff 字符串
   * @throws 如果 Git 扩展未激活或无仓库
   */
  async getUnstagedDiff(): Promise<string> {
    if (!this.gitExtension) {
      throw new Error('Git extension is not active');
    }

    const repo = this.getRepository();
    const diff = await repo.diff(false); // false = working directory changes (unstaged)
    return diff;
  }

  setCommitMessage(message: string): void {
    if (!this.gitExtension) {
      throw new Error('Git extension is not active');
    }

    const repo = this.getRepository();
    repo.inputBox.value = message;
  }

  private getRepository(): Repository {
    if (!this.gitExtension) {
      throw new Error('Git extension is not active');
    }

    const api = this.gitExtension.getAPI(1);
    if (api.repositories.length === 0) {
      throw new Error('No git repository found');
    }
    return api.repositories[0];
  }
}
