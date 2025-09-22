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
vi.mock('../utils/io', () => ({
  ensureDirectoryExists: vi.fn(),
  findWaspRoot: vi.fn().mockReturnValue('/mock/wasp/root'),
  getFeatureTargetDir: vi.fn().mockReturnValue({
    targetDir: '/mock/target/dir',
    importPath: '@src/features/test/_core/server/jobs',
  }),
  getTemplatesDir: vi.fn().mockReturnValue('/mock/templates'),
}));

vi.mock('../utils/strings', () => ({
  capitalise: vi
    .fn()
    .mockImplementation(
      (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
    ),
  hasHelperMethodCall: vi.fn().mockReturnValue(false),
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
    const result = gen.getDefinition(
      'testJob',
      'testWorker',
      'features/test/_core/server/jobs/testWorker',
      '[]',
      '',
      '',
      '{}',
      'features/test/_core/server/jobs/testWorker',
      'testJob'
    );
    expect(typeof result).toBe('string');
  });
});
