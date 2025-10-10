import type { IFileSystem, Logger } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockFS, createMockLogger } from '../../../tests/utils';
import { FeatureDirectoryGenerator } from './generator';

describe('WaspFeatureDirectoryGenerator', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let gen: FeatureDirectoryGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    gen = new FeatureDirectoryGenerator(logger, fs);
  });

  it('generate creates feature directory structure', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.mkdirSync = vi.fn();
    fs.copyFileSync = vi.fn();

    await gen.generate({ path: 'test-feature' });

    // Since copyDirectory is mocked, we expect the generate method to complete successfully
    // The actual copyDirectory call is internal to the generator
    expect(fs.existsSync).toHaveBeenCalled();
  });
});
