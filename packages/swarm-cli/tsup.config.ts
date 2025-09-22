import { glob } from 'glob';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/cli/index.ts',
    ...glob.sync('src/cli/commands/*.command.ts'),
    ...glob.sync('src/types/*.ts'),
  ],
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  target: 'es2020',
  platform: 'node',
  external: ['signale', '@prisma/client'],
  outDir: 'dist',
  // Preserve directory structure
  outExtension() {
    return {
      js: '.js',
    };
  },
});
