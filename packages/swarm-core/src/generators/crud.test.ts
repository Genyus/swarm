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
vi.mock(import('../utils/filesystem'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    ensureDirectoryExists: vi.fn(),
    getFeatureTargetDir: vi.fn().mockReturnValue({
      targetDirectory: '/mock/target/dir',
      importDirectory: '@src/features/test/server',
    }),
  };
});

vi.mock(import('../utils/strings'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getPlural: vi.fn().mockImplementation((str: string) => str + 's'),
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

vi.mock(import('../utils/prisma'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    getEntityMetadata: vi.fn().mockResolvedValue({
      name: 'User',
      fields: [],
    }),
  };
});

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

  it.skip('generate writes crud file and updates config', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.readFileSync = vi.fn(() => 'template');
    fs.writeFileSync = vi.fn();
    await gen.generate('foo', { dataType: 'User', force: true });
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(featureGen.updateFeatureConfig).toHaveBeenCalled();
  });

  it.skip('should apply public, override, and exclude flags correctly', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.readFileSync = vi.fn(() => 'template');
    fs.writeFileSync = vi.fn();

    const mockProcessTemplate = vi.fn().mockReturnValue('processed template');
    const mockTemplateUtility = {
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

    expect(mockProcessTemplate).toHaveBeenCalledWith('/mock/template/path', {
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

  it.skip('should handle default flags correctly', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.readFileSync = vi.fn(() => 'template');
    fs.writeFileSync = vi.fn();

    const mockProcessTemplate = vi.fn().mockReturnValue('processed template');
    const mockTemplateUtility = {
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
