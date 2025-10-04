import { glob } from 'glob';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    ...glob.sync('src/generators/*.ts', { ignore: 'src/generators/*.test.ts' }),
    ...glob.sync('src/utils/*.ts', { ignore: 'src/utils/*.test.ts' }),
    ...glob.sync('src/types/*.ts'),
  ],
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  target: 'es2022',
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
