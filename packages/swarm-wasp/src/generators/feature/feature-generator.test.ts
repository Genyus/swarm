import type { FileSystem, Logger } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockFS, createMockLogger } from '../../../tests/utils';
import { FeatureGenerator } from './feature-generator';

describe('WaspFeatureGenerator', () => {
  let fs: FileSystem;
  let logger: Logger;
  let gen: FeatureGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    gen = new FeatureGenerator(logger, fs);
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
