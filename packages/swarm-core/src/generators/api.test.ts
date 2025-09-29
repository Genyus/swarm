import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../tests/utils';
import type { IFileSystem } from '../types/filesystem';
import type { IFeatureGenerator } from '../types/generator';
import type { Logger } from '../types/logger';
import { ApiGenerator } from './api';

// Mock the io and templates utilities
vi.mock(import('../utils/filesystem'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    ensureDirectoryExists: vi.fn(),
    getFeatureTargetDir: vi.fn().mockReturnValue({
      targetDirectory: '/mock/target/dir',
      importDirectory: '@src/features/test/_core/server/apis',
    }),
  };
});

vi.mock(import('../utils/strings'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    toCamelCase: vi.fn().mockImplementation((str: string) => str),
    toPascalCase: vi.fn().mockImplementation((str: string) => str),
    hasHelperMethodCall: vi.fn().mockReturnValue(false),
  };
});

vi.mock(import('../utils/templates'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    TemplateUtility: vi.fn().mockImplementation(() => ({
      processTemplate: vi.fn().mockReturnValue('processed template content'),
    })),
  };
});

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
    await gen.generate('foo', {
      name: 'api',
      method: 'GET',
      route: '/api',
      force: true,
    });
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(featureGen.updateFeatureConfig).toHaveBeenCalled();
  });

  it('getConfigDefinition returns processed template', () => {
    const result = (gen as any).getConfigDefinition(
      'testApi',
      'test',
      ['User'],
      'GET',
      '/api/test',
      'features/test/_core/server/apis/test',
      false,
      'features/test/_core/server/apis/test'
    );
    expect(typeof result).toBe('string');
  });
});
