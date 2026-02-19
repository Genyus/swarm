import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    globalSetup: ['./tests/utils/global-setup.ts'],
    environment: 'node',
    testTimeout: 30000,
    pool: 'forks',
    include: [
      'src/**/*.test.ts', // Unit tests
      'tests/**/*.test.ts', // Integration tests
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/out/**',
      '**/fixtures/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/tests/**'],
    },
  },
});
