export class PromptBuilder {
  static buildSystemPrompt(language: string): string {
    // 语言声明放在开头 - 提高 AI 注意力权重
    const languageInstruction =
      language === 'Chinese'
        ? '你必须用中文生成提交信息。技术术语（如 feat、fix、refactor 等 type 和 scope）保持英文，描述部分使用中文。\n\n'
        : 'Generate commit messages in English.\n\n';

    const baseRules = `你是一个 Git 提交信息生成器，遵循 Conventional Commits 规范。

STRICT RULES:
1. Format: <type>(<scope>): <description>
2. Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, deps
3. Scope: optional, lowercase, one word (e.g., auth, api, ui)
4. Description: imperative mood, lowercase, no period
5. Max length: 72 characters`;

    // 根据语言提供不同示例 - Few-shot Learning
    const examples =
      language === 'Chinese'
        ? `\n\nExamples (Chinese):
- feat(auth): 添加 JWT token 验证功能
- fix(api): 修复用户接口空响应处理
- docs: 更新 API 文档说明`
        : `\n\nExamples (English):
- feat(auth): add JWT token validation
- fix(api): handle null response in user endpoint
- docs: update API documentation`;

    return languageInstruction + baseRules + examples;
  }

  static buildUserPrompt(diff: string, language: string): string {
    const languageHint =
      language === 'Chinese'
        ? '\n\n请用中文生成提交信息（技术术语保持英文）。'
        : '';

    return `Analyze this git diff and generate ONE commit message:\n\n${diff}\n\nCommit message:${languageHint}`;
  }
}
