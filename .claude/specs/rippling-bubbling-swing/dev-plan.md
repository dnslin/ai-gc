# AI Git Commit - 开发计划

## 概述

开发一个 VS Code 扩展，利用 LLM 分析 Git 暂存区代码变更，自动生成符合 Conventional Commits 规范的提交信息。

## 任务拆解

### 任务 1: 基础设施搭建

- **ID**: task-1
- **描述**: 创建项目结构、配置 TypeScript/Vitest/ESLint/Prettier 环境、定义核心类型接口、搭建 VS Code 扩展入口骨架
- **文件范围**:
  - 根目录配置文件: `package.json`, `tsconfig.json`, `vitest.config.ts`, `.eslintrc.json`, `.prettierrc`, `esbuild.js`
  - VS Code 配置: `.vscode/launch.json`, `.vscode/settings.json`, `.vscode/extensions.json`
  - 入口文件: `src/extension.ts`
  - 类型定义: `src/types/config.ts`, `src/types/git.ts`
- **依赖**: 无
- **测试命令**: `pnpm run compile && pnpm run lint`
- **测试重点**:
  - TypeScript 编译无错误
  - ESLint 规则校验通过
  - 扩展入口 `activate/deactivate` 函数正确导出
  - 类型定义完整性（AIConfig, GitDiff 等接口）

---

### 任务 2: AI 服务层开发

- **ID**: task-2
- **描述**: 实现多 Provider AI 服务抽象层（IAIService 接口）、工厂模式创建器（AIServiceFactory）、具体 Provider 实现（OpenAI/Claude/Gemini）、Prompt 构建器（PromptBuilder）
- **文件范围**:
  - `src/services/ai/IAIService.ts`
  - `src/services/ai/AIServiceFactory.ts`
  - `src/services/ai/OpenAIService.ts`
  - `src/services/ai/ClaudeService.ts`
  - `src/services/ai/GeminiService.ts`
  - `src/services/ai/PromptBuilder.ts`
  - `test/unit/services/OpenAIService.test.ts`
  - `test/unit/services/ClaudeService.test.ts`
  - `test/unit/services/GeminiService.test.ts`
  - `test/unit/services/AIServiceFactory.test.ts`
  - `test/unit/services/PromptBuilder.test.ts`
  - `test/fixtures/api-responses/*.json`
- **依赖**: 依赖 task-1
- **测试命令**: `pnpm vitest run src/services/ai --coverage --reporter=verbose`
- **测试重点**:
  - Mock Axios 请求，验证 API 请求构造正确性（headers、body、endpoint）
  - 测试 API 响应解析（正常响应、错误状态码 401/500、超时）
  - Prompt 多语言生成测试（英文/中文，技术术语保留英文）
  - 工厂模式切换不同 Provider（验证实例类型）
  - 边界条件：空 diff、超长 diff、特殊字符处理

---

### 任务 3: Git 服务层开发

- **ID**: task-3
- **描述**: 实现 Git 操作服务（获取暂存区 diff、填充 SCM 输入框）、Diff 截断策略处理器（DiffProcessor）
- **文件范围**:
  - `src/services/git/GitService.ts`
  - `src/utils/diffProcessor.ts`
  - `test/unit/services/GitService.test.ts`
  - `test/unit/utils/diffProcessor.test.ts`
  - `test/fixtures/diff-samples/small.diff`
  - `test/fixtures/diff-samples/large.diff`
  - `test/fixtures/diff-samples/huge.diff`
- **依赖**: 依赖 task-1
- **测试命令**: `pnpm vitest run src/services/git src/utils/diffProcessor --coverage --reporter=verbose`
- **测试重点**:
  - Mock VS Code Git API（`vscode.extensions.getExtension('vscode.git')`）
  - 测试 diff 获取：空 diff、正常 diff、二进制文件 diff
  - Diff 截断逻辑：≤10k 行直接返回、>10k 行截断到 5k 行并标记 "(部分变更)"
  - 行数统计准确性（处理不同换行符 \n、\r\n）
  - SCM 输入框填充测试（验证 `repo.inputBox.value` 赋值）

---

### 任务 4: 配置管理与控制器

- **ID**: task-4
- **描述**: 实现配置管理服务（读取 settings.json 配置、SecretStorage 加密存储 API Key）、业务协调控制器（CommitController 编排 Git + AI 服务）、命令注册（generateCommit 命令）、错误处理与日志工具
- **文件范围**:
  - `src/services/config/ConfigManager.ts`
  - `src/controllers/CommitController.ts`
  - `src/commands/generateCommit.ts`
  - `src/utils/errorHandler.ts`
  - `src/utils/logger.ts`
  - `test/unit/services/ConfigManager.test.ts`
  - `test/unit/controllers/CommitController.test.ts`
  - `test/helpers/mockVSCode.ts`
- **依赖**: 依赖 task-2, task-3
- **测试命令**: `pnpm vitest run src/controllers src/services/config src/utils --coverage --reporter=verbose`
- **测试重点**:
  - Mock VS Code API（`workspace.getConfiguration`, `context.secrets.store/get`）
  - 配置读取优先级测试（默认配置 < settings.json < 环境变量）
  - API Key 加密存储/读取流程
  - CommitController 完整流程：获取 diff → 调用 AI 服务 → 填充 SCM（集成前面的 mock）
  - 错误处理覆盖：空 diff 提示、API 401/500 提示、网络超时、用户取消操作
  - 日志输出验证（info/warn/error 级别）

---

### 任务 5: 集成测试与文档

- **ID**: task-5
- **描述**: 编写端到端集成测试（完整流程测试）、测试辅助工具（mockVSCode、testUtils）、用户文档（README 使用指南、CHANGELOG）、覆盖率验证
- **文件范围**:
  - `test/integration/e2e.test.ts`
  - `test/helpers/mockVSCode.ts`
  - `test/helpers/testUtils.ts`
  - `README.md`
  - `CHANGELOG.md`
  - `.vscodeignore`
- **依赖**: 依赖 task-4
- **测试命令**: `pnpm vitest run --coverage --reporter=verbose && pnpm vitest run test/integration`
- **测试重点**:
  - 端到端场景：正常流程（获取 diff → AI 生成 → 填充成功）
  - 异常场景：空 diff、API 失败重试、网络超时、用户取消
  - 多 Provider 切换测试（OpenAI → Claude → Gemini）
  - 大文件截断流程测试（>10k 行 diff）
  - 覆盖率报告验证（lines/functions/branches/statements ≥ 90%）

---

## 验收标准

- [ ] 所有 TypeScript 编译无错误，ESLint 检查通过
- [ ] 支持 OpenAI/Claude/Gemini 三种 AI Provider，可通过配置切换
- [ ] Git 暂存区 diff 获取正确，>10k 行时执行截断策略并标记
- [ ] 生成的 commit message 符合 Conventional Commits 规范（格式正确、最大 72 字符）
- [ ] 多语言环境下技术术语保持英文（中文场景测试通过）
- [ ] API Key 通过 SecretStorage 加密存储，配置项通过 settings.json 管理
- [ ] 错误处理完善：空 diff 提示、API 401/500 错误提示、网络超时提示、用户取消操作支持
- [ ] 所有单元测试通过，代码覆盖率 ≥ 90%（lines/functions/branches/statements）
- [ ] 集成测试覆盖完整流程和异常场景
- [ ] README 包含安装说明、配置指南、使用示例

---

## 技术要点

### 核心技术决策
- **Diff 截断策略**: >10k 行弹窗提示，用户坚持则截断到 5k 行并标记 "(部分变更)"
- **术语处理**: 多语言环境下技术术语保持英文（如 `feat`, `refactor` 等）
- **流式输出**: 初始版本不实现，使用一次性请求（后续版本可扩展）
- **测试框架**: Vitest（ESM 友好，速度快）+ V8 Coverage Provider
- **API 安全**: 使用 VS Code SecretStorage 存储 API Key，不存储明文

### 关键约束
- VS Code API 版本锁定 `^1.85.0`（避免 Git API 变更导致扩展失效）
- API 请求超时设置 30 秒（Axios timeout 配置）
- Commit message 最大长度 72 字符（Conventional Commits 规范）
- 覆盖率阈值配置：`thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 }`

### 风险缓解
- **大型仓库 diff 过大**: 10k 行阈值 + 5k 行截断
- **API 响应超时**: 30s 超时 + 用户可取消
- **AI 生成格式不合规**: 正则校验 + 重试机制（最多 2 次）
- **用户无 API Key**: 首次运行引导配置流程
