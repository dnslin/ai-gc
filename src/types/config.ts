export enum Provider {
  OpenAI = 'openai',
  Claude = 'claude',
  Gemini = 'gemini',
  Custom = 'custom'
}

export enum CommitType {
  Feat = 'feat',
  Fix = 'fix',
  Docs = 'docs',
  Style = 'style',
  Refactor = 'refactor',
  Perf = 'perf',
  Test = 'test',
  Build = 'build',
  Ci = 'ci',
  Chore = 'chore',
  Revert = 'revert',
  Deps = 'deps'
}

export interface AIConfig {
  provider: Provider;
  baseUrl?: string;
  model: string;
  language: 'English' | 'Chinese';
}
