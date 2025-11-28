import { describe, it, expect } from 'vitest';
import { PromptBuilder } from '@/services/ai/PromptBuilder';

describe('PromptBuilder', () => {
  describe('buildSystemPrompt', () => {
    it('should generate English prompt by default', () => {
      const prompt = PromptBuilder.buildSystemPrompt('English');

      expect(prompt).toMatch(/^Generate commit messages in English/);
      expect(prompt).toContain('Conventional Commits');
      expect(prompt).toContain('feat, fix, docs');
      expect(prompt).toContain('Examples (English)');
      expect(prompt).toContain('feat(auth): add JWT token validation');
    });

    it('should generate Chinese prompt with language instruction at start', () => {
      const prompt = PromptBuilder.buildSystemPrompt('Chinese');

      // 验证中文指令在开头
      expect(prompt).toMatch(/^你必须用中文生成提交信息/);
      expect(prompt).toContain('技术术语（如 feat、fix、refactor 等 type 和 scope）保持英文');

      // 验证包含中文示例
      expect(prompt).toContain('Examples (Chinese)');
      expect(prompt).toContain('feat(auth): 添加 JWT token 验证功能');
      expect(prompt).toContain('fix(api): 修复用户接口空响应处理');
      expect(prompt).toContain('docs: 更新 API 文档说明');
    });

    it('should include format rules', () => {
      const prompt = PromptBuilder.buildSystemPrompt('English');

      expect(prompt).toContain('<type>(<scope>): <description>');
      expect(prompt).toContain('imperative mood');
      expect(prompt).toContain('Max length: 72 characters');
    });
  });

  describe('buildUserPrompt', () => {
    it('should include diff content', () => {
      const diff = '+ add new feature\n- remove old code';
      const prompt = PromptBuilder.buildUserPrompt(diff, 'English');

      expect(prompt).toContain(diff);
      expect(prompt).toContain('Analyze this git diff');
      expect(prompt).toContain('Commit message:');
      expect(prompt).not.toContain('请用中文');
    });

    it('should add Chinese language hint', () => {
      const diff = '+ add new feature\n- remove old code';
      const prompt = PromptBuilder.buildUserPrompt(diff, 'Chinese');

      expect(prompt).toContain(diff);
      expect(prompt).toContain('请用中文生成提交信息');
      expect(prompt).toContain('技术术语保持英文');
    });

    it('should handle empty diff', () => {
      const prompt = PromptBuilder.buildUserPrompt('', 'English');

      expect(prompt).toContain('Analyze this git diff');
    });
  });
});
