import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../tests/utils';
import type { IFileSystem } from '../types/filesystem';
import type { IFeatureGenerator } from '../types/generator';
import type { Logger } from '../types/logger';
import { ApiNamespaceGenerator } from './apinamespace';

// Mock the utilities
vi.mock('../utils/io', () => ({
  ensureDirectoryExists: vi.fn(),
  getFeatureTargetDir: vi.fn().mockReturnValue({
    targetDir: '/mock/target/dir',
    importPath: '@src/features/test/_core/server/middleware',
  }),
}));

vi.mock('../utils/strings', () => ({
  toCamelCase: vi.fn().mockImplementation((str: string) => str),
  hasApiNamespaceDefinition: vi.fn().mockReturnValue(false),
}));

vi.mock('../utils/templates', () => ({
  TemplateUtility: vi.fn().mockImplementation(() => ({
    processTemplate: vi.fn().mockReturnValue('processed template content'),
    getFileTemplatePath: vi.fn().mockReturnValue('/mock/template/path'),
    getConfigTemplatePath: vi
      .fn()
      .mockReturnValue('/mock/config/template/path'),
  })),
  getFileTemplatePath: vi.fn().mockReturnValue('/mock/template/path'),
  processTemplate: vi.fn().mockReturnValue('processed template content'),
}));

describe('ApiNamespaceGenerator', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGen: IFeatureGenerator;
  let gen: ApiNamespaceGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen();
    gen = new ApiNamespaceGenerator(logger, fs, featureGen);
  });

  it('generate writes middleware file and updates config', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.readFileSync = vi.fn(() => 'template');
    fs.writeFileSync = vi.fn();
    await gen.generate('foo', { name: 'ns', path: '/api', force: true });
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(featureGen.updateFeatureConfig).toHaveBeenCalled();
  });

  it('getDefinition returns processed template', () => {
    const result = gen.getDefinition(
      'testNamespace',
      'features/test/_core/server/middleware/testMiddleware',
      '/api/test'
    );
    expect(typeof result).toBe('string');
  });
});
