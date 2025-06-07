import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IFileSystem } from '../types/filesystem';
import type { IFeatureGenerator } from '../types/generator';
import type { Logger } from '../types/logger';
import { ApiGenerator } from './api';

function createMockFS(): IFileSystem {
  return {
    readFileSync: vi.fn(() => 'template'),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(() => true),
    copyFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(() => []),
  };
}

function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  };
}

function createMockFeatureGen(): IFeatureGenerator {
  return {
    updateFeatureConfig: vi.fn(() => 'config'),
  } as any;
}

describe('ApiGenerator', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGen: IFeatureGenerator;
  let gen: ApiGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen();
    gen = new ApiGenerator(logger, fs, featureGen);
  });

  it('generate writes handler and updates config', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.readFileSync = vi.fn(() => 'template');
    fs.writeFileSync = vi.fn();
    await gen.generate('foo', { name: 'api', method: 'GET', route: '/api', force: true });
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(featureGen.updateFeatureConfig).toHaveBeenCalled();
  });
}); 