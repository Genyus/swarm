import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../test/utils';
import type { IFileSystem } from '../types/filesystem';
import type { IFeatureGenerator } from '../types/generator';
import type { Logger } from '../types/logger';
import { RouteGenerator } from './route';

// Mock the io and templates utilities
vi.mock('../utils/io', () => ({
  ensureDirectoryExists: vi.fn(),
  getFeatureTargetDir: vi.fn().mockReturnValue({
    targetDir: '/mock/target/dir',
    importPath: '@src/features/test/_core/client/pages',
  }),
  getTemplatesDir: vi.fn().mockReturnValue('/mock/templates'),
}));

vi.mock('../utils/templates', () => ({
  getFileTemplatePath: vi.fn().mockReturnValue('/mock/template/path'),
  processTemplate: vi.fn().mockReturnValue('processed template content'),
}));

describe('RouteGenerator', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGen: IFeatureGenerator;
  let gen: RouteGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen();
    gen = new RouteGenerator(logger, fs, featureGen);
  });

  it('generate writes route file and updates config', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.readFileSync = vi.fn(() => 'template');
    fs.writeFileSync = vi.fn();
    await gen.generate('foo', { name: 'route', path: '/foo', force: true });
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(featureGen.updateFeatureConfig).toHaveBeenCalled();
  });
});
