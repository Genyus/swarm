import type { FileSystem, Logger, SwarmGenerator } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../tests/utils';
import { schema as featureSchema } from '../feature/schema';
import { CrudGenerator } from './crud-generator';

describe('CrudGenerator', () => {
  let fs: FileSystem;
  let logger: Logger;
  let featureGen: SwarmGenerator<typeof featureSchema>;
  let gen: CrudGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen(featureSchema);
    gen = new CrudGenerator(logger, fs, featureGen);
  });

  it('buildOperations should handle public, override, and exclude flags correctly', () => {
    const operations = (gen as any).buildOperations({
      public: ['get', 'getAll'],
      override: ['create'],
      exclude: ['delete'],
    });

    expect(operations).toHaveProperty('get');
    expect(operations).toHaveProperty('getAll');
    expect(operations).toHaveProperty('create');
    expect(operations).toHaveProperty('update', {});
    expect(operations).not.toHaveProperty('delete');
    expect(operations.get).toEqual({ isPublic: true });
    expect(operations.getAll).toEqual({ isPublic: true });
    expect(operations.create).toHaveProperty('override', true);
  });

  it('buildOperations should handle default flags correctly', () => {
    const operations = (gen as any).buildOperations({});

    expect(operations).toHaveProperty('get', {});
    expect(operations).toHaveProperty('getAll', {});
    expect(operations).toHaveProperty('create', {});
    expect(operations).toHaveProperty('update', {});
    expect(operations).toHaveProperty('delete', {});
  });

  it('getDefinition returns processed template', async () => {
    // Mock the template utility
    (gen as any).templateUtility = {
      processTemplate: vi.fn(
        () => 'app.addCrud("testCrud", { operations: {...} });'
      ),
      resolveTemplatePath: vi.fn(
        (templateName) => `/mock/templates/${templateName}`
      ),
    };

    // Mock the getTemplatePath method to return a resolved promise
    (gen as any).getTemplatePath = vi.fn(() =>
      Promise.resolve('/mock/templates/config/crud.eta')
    );

    const result = await gen.getDefinition('testCrud', 'User', {
      get: {},
      getAll: {},
      create: {},
      update: {},
      delete: {},
    });
    expect(typeof result).toBe('string');
  });
});
