import type { FileSystem } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockFS, createTestGenerator } from '../../../tests/utils';
import { FeatureGenerator } from './feature-generator';
import { schema } from './schema';

describe('WaspFeatureGenerator', () => {
  let fs: FileSystem;
  let gen: FeatureGenerator;

  beforeEach(async () => {
    fs = createMockFS();
    gen = await createTestGenerator(FeatureGenerator, schema, {
      fileSystem: fs,
    });
  });

  it('generate creates feature directory structure and regenerates the barrel', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.mkdirSync = vi.fn();
    fs.copyFileSync = vi.fn();
    // The barrel generator scans src/features; return no existing features.
    fs.readdirSync = vi.fn(() => []);
    fs.writeFileSync = vi.fn();

    await gen.generate({ target: 'test-feature' });

    expect(fs.existsSync).toHaveBeenCalled();
    // The features barrel (src/features/index.wasp.ts) is (re)written.
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('index.wasp.ts'),
      expect.stringContaining('featureSpecs')
    );
  });
});
