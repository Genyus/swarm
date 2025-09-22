import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      'wasp-config': path.resolve(__dirname, './src/stubs/wasp-config/index.ts'),
    },
  },
});
