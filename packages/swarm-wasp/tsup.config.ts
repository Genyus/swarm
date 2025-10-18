import { glob } from 'glob';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    ...glob.sync('src/plugins/**/*.ts', { ignore: 'src/plugins/**/*.test.ts' }),
    ...glob.sync('src/base-classes/*.ts', { ignore: 'src/base-classes/*.test.ts' }),
    ...glob.sync('src/types/*.ts'),
    ...glob.sync('src/utils/*.ts', { ignore: 'src/utils/*.test.ts' }),
  ],
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  target: 'es2022',
  platform: 'node',
  external: ['@ingenyus/swarm'],
  outDir: 'dist',
  // Preserve directory structure
  outExtension() {
    return {
      js: '.js',
    };
  },
});
