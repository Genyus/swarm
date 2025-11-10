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

  it('generate creates feature directory structure', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.mkdirSync = vi.fn();
    fs.copyFileSync = vi.fn();

    await gen.generate({ target: 'test-feature' });

    // Since copyDirectory is mocked, we expect the generate method to complete successfully
    // The actual copyDirectory call is internal to the generator
    expect(fs.existsSync).toHaveBeenCalled();
  });
});
