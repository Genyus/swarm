import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../tests/utils';
import type { IFileSystem } from '../types/filesystem';
import type { IFeatureGenerator } from '../types/generator';
import type { Logger } from '../types/logger';
import { JobGenerator } from './job';

// Mock the utilities
vi.mock(import('../utils/filesystem'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    ensureDirectoryExists: vi.fn(),
    findWaspRoot: vi.fn().mockReturnValue('/mock/wasp/root'),
    getFeatureTargetDir: vi.fn().mockReturnValue({
      targetDirectory: '/mock/target/dir',
      importDirectory: '@src/features/test/_core/server/jobs',
    }),
    getTemplatesDir: vi.fn().mockReturnValue('/mock/templates'),
  };
});

vi.mock(import('../utils/strings'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    capitalise: vi
      .fn()
      .mockImplementation(
        (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
      ),
    hasHelperMethodCall: vi.fn().mockReturnValue(false),
    validateFeaturePath: vi.fn().mockReturnValue(['test']),
  };
});

vi.mock(import('../utils/templates'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    TemplateUtility: vi.fn().mockImplementation(() => ({
      processTemplate: vi.fn().mockReturnValue('processed template content'),
    })),
    processTemplate: vi.fn().mockReturnValue('processed template content'),
  };
});

describe('JobGenerator', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGen: IFeatureGenerator;
  let gen: JobGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen();
    gen = new JobGenerator(logger, fs, featureGen);
  });

  it('generate writes worker file and updates config', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.readFileSync = vi.fn(() => 'template');
    fs.writeFileSync = vi.fn();
    await gen.generate('foo', { name: 'Job', force: true });
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(featureGen.updateFeatureConfig).toHaveBeenCalled();
  });

  it('getDefinition returns processed template', () => {
    const result = gen.getDefinition('testJob', [], '', '{}');
    expect(typeof result).toBe('string');
  });
});
