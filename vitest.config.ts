import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90
      },
      include: ['src/**/*.ts'],
      exclude: ['test/**', 'dist/**', '**/*.test.ts']
    },
    setupFiles: ['test/helpers/mockVSCode.ts']
  }
});
