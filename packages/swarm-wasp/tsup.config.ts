import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false, // We'll generate .d.ts files separately
  sourcemap: true,
  clean: true,
  target: 'es2022',
  outDir: 'dist',
  splitting: false,
  treeshake: true,
});
