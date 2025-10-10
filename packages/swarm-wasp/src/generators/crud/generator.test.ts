import type { IFileSystem, Logger } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../tests/utils';
import type { IFeatureDirectoryGenerator } from '../../interfaces/feature-directory-generator';
import { CrudGenerator } from './generator';

describe('CrudGenerator', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGen: IFeatureDirectoryGenerator;
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
    await gen.generate({ feature: 'foo', dataType: 'User', force: true });
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(featureGen.generate).toHaveBeenCalled();
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
    await gen.generate({
      feature: 'foo',
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
    await gen.generate({
      feature: 'foo',
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
