# AI Git Commit

[![VS Code](https://img.shields.io/visual-studio-marketplace/v/aigc-dnslin.ariso-commit)](https://marketplace.visualstudio.com/items?itemName=aigc-dnslin.ariso-commit)

AI Git Commit 是一个 VS Code 扩展，利用大语言模型（LLM）自动生成符合 [Conventional Commits](https://www.conventionalcommits.org/) 规范的 Git 提交信息。

## 功能特性

- ✨ **智能生成**: 分析暂存区代码变更，自动生成精准的提交信息
- 📏 **规范遵循**: 严格遵循 Conventional Commits 格式 (`<type>(<scope>): <description>`)
- 🌐 **多语言支持**: 支持英文和中文提交信息，技术术语始终保持英文
- 🤖 **多 Provider 支持**: OpenAI、Claude、Gemini 以及自定义 API
- ⚡ **智能截断**: 自动处理大型 diff，避免 Token 溢出
- 🔐 **安全存储**: 使用 VS Code SecretStorage 加密存储 API Key + Settings UI 便捷管理

## 使用方式

### 1. 安装扩展

从 VS Code Marketplace 搜索并安装 `AI Git Commit`。

### 2. 配置 AI Provider

在 VS Code 设置中配置以下选项:

```json
{
  "aiCommit.provider": "openai", // 选择 Provider: openai | claude | gemini | custom
  "aiCommit.model": "gpt-4", // 模型名称(可选,默认使用推荐模型)
  "aiCommit.baseUrl": "", // 自定义 API 地址(可选)
  "aiCommit.language": "English" // 语言: English | Chinese
}
```

### 3. 配置 API Key

**方式一:VS Code Settings UI(推荐)**

1. 打开 VS Code 设置(`Ctrl+,` / `Cmd+,`)
2. 搜索 `aiCommit.apiKey`
3. 根据使用的 Provider 填入对应的 API Key:
   - `aiCommit.openai.apiKey`: OpenAI API Key
   - `aiCommit.claude.apiKey`: Claude API Key
   - `aiCommit.gemini.apiKey`: Gemini API Key
   - `aiCommit.custom.apiKey`: 自定义 API Key

**方式二:自动提示**

首次使用时,如果检测到 API Key 未配置,扩展会显示通知并提供跳转到设置的按钮。

**安全提示**
- ⚠️ API Key 会同步加密存储到 VS Code Secrets
- ⚠️ 不要将 workspace settings.json 提交到版本控制系统
- ⚠️ 建议在 User Settings 而非 Workspace Settings 中配置

**已有用户升级说明**

如果你之前已通过弹窗配置过 API Key,扩展会自动迁移到 Settings UI,无需重新输入。

### 4. 生成提交信息

1. 在 VS Code 中暂存你的代码变更
2. 点击 SCM 视图中的 ✨ 图标按钮
3. 或使用命令面板执行 `AI: 生成 Git 提交信息`
4. AI 将自动分析变更并填充提交信息到输入框

## 支持的 Commit Types

- `feat`: 新增功能
- `fix`: 修复 Bug
- `docs`: 文档修改
- `style`: 代码格式调整（不影响逻辑）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统或外部依赖更改
- `ci`: CI 配置更改
- `chore`: 构建过程或辅助工具变动
- `revert`: 版本回滚
- `deps`: 依赖项更新

## Provider 配置示例

### OpenAI

```json
{
  "aiCommit.provider": "openai",
  "aiCommit.model": "gpt-4",
  "aiCommit.baseUrl": "" // 或使用代理: "https://your-proxy.com"
}
```

### Claude

```json
{
  "aiCommit.provider": "claude",
  "aiCommit.model": "claude-3-5-sonnet-20241022"
}
```

### Gemini

```json
{
  "aiCommit.provider": "gemini",
  "aiCommit.model": "gemini-1.5-pro"
}
```

### 自定义 (OpenAI 兼容 API)

```json
{
  "aiCommit.provider": "custom",
  "aiCommit.baseUrl": "https://your-custom-api.com",
  "aiCommit.model": "your-model-name"
}
```

## 智能截断机制

当暂存区 diff 超过 10,000 行时：

1. 扩展会提示用户分批提交以获得更准确的描述
2. 如果用户选择继续，自动截断到前 5,000 行
3. 生成的提交信息会添加 `(部分变更)` 标记

## 技术术语处理

无论配置为何种语言，技术术语始终保持英文：

- **英文**: `feat(auth): add JWT validation`
- **中文**: `feat(auth): 添加 JWT 验证`（"JWT" 保持英文）

## 开发

### 环境要求

- Node.js >= 18
- pnpm >= 10

### 安装依赖

```bash
pnpm install
```

### 编译

```bash
pnpm run compile
```

### 运行测试

```bash
pnpm test
pnpm test:coverage  # 查看覆盖率报告
```

### 调试

按 `F5` 在 VS Code Extension Development Host 中启动调试。

## 许可证

MIT

## 反馈与贡献

欢迎提交 Issue 和 Pull Request！

- Issue: [GitHub Issues](https://github.com/dnslin/ai-gc/issues)
- PR: [GitHub Pull Requests](https://github.com/dnslin/ai-gc/pulls)
