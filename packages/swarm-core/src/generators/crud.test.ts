import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../tests/utils';
import type { IFileSystem } from '../types/filesystem';
import type { IFeatureGenerator } from '../types/generator';
import type { Logger } from '../types/logger';
import { CrudGenerator } from './crud';

// Mock the utilities
vi.mock('../utils/io', () => ({
  ensureDirectoryExists: vi.fn(),
  getFeatureTargetDir: vi.fn().mockReturnValue({
    targetDir: '/mock/target/dir',
    importPath: '@src/features/test/_core/server',
  }),
}));

vi.mock('../utils/strings', () => ({
  getPlural: vi.fn().mockImplementation((str: string) => str + 's'),
  hasHelperMethodCall: vi.fn().mockReturnValue(false),
}));

vi.mock('../utils/templates', () => ({
  TemplateUtility: vi.fn().mockImplementation(() => ({
    getFileTemplatePath: vi.fn().mockReturnValue('/mock/template/path'),
    getConfigTemplatePath: vi
      .fn()
      .mockReturnValue('/mock/config/template/path'),
    processTemplate: vi.fn().mockReturnValue('processed template content'),
  })),
}));

vi.mock('../utils/prisma', () => ({
  getEntityMetadata: vi.fn().mockResolvedValue({
    name: 'User',
    fields: [],
  }),
}));

describe('CrudGenerator', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGen: IFeatureGenerator;
  let gen: CrudGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen();
    gen = new CrudGenerator(logger, fs, featureGen);
  });

  it('generate writes crud file and updates config', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.readFileSync = vi.fn(() => 'template');
    fs.writeFileSync = vi.fn();
    await gen.generate('foo', { dataType: 'User', force: true });
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(featureGen.updateFeatureConfig).toHaveBeenCalled();
  });

  it('should apply public, override, and exclude flags correctly', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.readFileSync = vi.fn(() => 'template');
    fs.writeFileSync = vi.fn();

    const mockProcessTemplate = vi.fn().mockReturnValue('processed template');
    const mockTemplateUtility = {
      getFileTemplatePath: vi.fn().mockReturnValue('/mock/template/path'),
      processTemplate: mockProcessTemplate,
    };

    (
      gen as unknown as { templateUtility: typeof mockTemplateUtility }
    ).templateUtility = mockTemplateUtility;
    await gen.generate('foo', {
      dataType: 'User',
      force: true,
      public: ['get', 'getAll'],
      override: ['create'],
      exclude: ['delete'],
    });

    expect(mockProcessTemplate).toHaveBeenCalledWith('template', {
      crudName: 'Users',
      dataType: 'User',
      operations: expect.any(String),
    });

    const callArgs = mockProcessTemplate.mock.calls[0][1];
    const operationsObj = JSON.parse(callArgs.operations);

    expect(operationsObj).toHaveProperty('get');
    expect(operationsObj).toHaveProperty('getAll');
    expect(operationsObj).toHaveProperty('create');
    expect(operationsObj).toHaveProperty('update', {});
    expect(operationsObj).not.toHaveProperty('delete');
    expect(operationsObj.get).toEqual({ isPublic: true });
    expect(operationsObj.getAll).toEqual({ isPublic: true });
    expect(operationsObj.create).toHaveProperty('overrideFn');
    expect(operationsObj.create.overrideFn).toContain('import { createUser }');
  });

  it('should handle default flags correctly', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.readFileSync = vi.fn(() => 'template');
    fs.writeFileSync = vi.fn();

    const mockProcessTemplate = vi.fn().mockReturnValue('processed template');
    const mockTemplateUtility = {
      getFileTemplatePath: vi.fn().mockReturnValue('/mock/template/path'),
      processTemplate: mockProcessTemplate,
    };

    (
      gen as unknown as { templateUtility: typeof mockTemplateUtility }
    ).templateUtility = mockTemplateUtility;
    await gen.generate('foo', {
      dataType: 'User',
      force: true,
    });

    const callArgs = mockProcessTemplate.mock.calls[0][1];
    const operationsObj = JSON.parse(callArgs.operations);

    expect(operationsObj).toHaveProperty('get', {});
    expect(operationsObj).toHaveProperty('getAll', {});
    expect(operationsObj).toHaveProperty('create', {});
    expect(operationsObj).toHaveProperty('update', {});
    expect(operationsObj).toHaveProperty('delete', {});
  });

  it('getDefinition returns processed template', () => {
    const result = gen.getDefinition('testCrud', 'User', {
      get: {},
      getAll: {},
      create: {},
      update: {},
      delete: {},
    });
    expect(typeof result).toBe('string');
  });
});
