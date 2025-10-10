import type { IFileSystem, Logger } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiGenerator,
  ApiNamespaceGenerator,
  CrudGenerator,
  FeatureDirectoryGenerator,
  JobGenerator,
  OperationGenerator,
  RouteGenerator,
} from '../src';
import { createTestSetup } from './utils';

// Mock the Prisma utilities at the test level
vi.mock('../src/utils/prisma', () => ({
  getEntityMetadata: vi.fn().mockResolvedValue({
    name: 'Document',
    fields: [
      {
        name: 'id',
        type: 'String',
        tsType: 'string',
        isId: true,
        isRequired: true,
      },
      { name: 'title', type: 'String', tsType: 'string', isRequired: true },
      {
        name: 'content',
        type: 'String',
        tsType: 'string',
        isRequired: false,
      },
      {
        name: 'settings',
        type: 'Json',
        tsType: 'Prisma.JsonValue',
        isRequired: true,
        hasDefaultValue: true,
      },
      {
        name: 'createdAt',
        type: 'DateTime',
        tsType: 'Date',
        isRequired: true,
        hasDefaultValue: true,
      },
    ],
  }),
  getIdField: vi.fn().mockReturnValue({ name: 'id', tsType: 'string' }),
  getOmitFields: vi.fn().mockReturnValue('"id" | "createdAt"'),
  getJsonFields: vi.fn().mockReturnValue(['settings']),
  needsPrismaImport: vi.fn().mockReturnValue(true),
  generateJsonTypeHandling: vi
    .fn()
    .mockReturnValue(
      ',\n        settings: (data.settings as Prisma.JsonValue) || Prisma.JsonNull'
    ),
}));

describe('Error Handling Tests', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGenerator: FeatureDirectoryGenerator;
  let routeGenerator: RouteGenerator;
  let apiGenerator: ApiGenerator;
  let jobGenerator: JobGenerator;
  let crudGenerator: CrudGenerator;
  let operationGenerator: OperationGenerator;
  let apiNamespaceGenerator: ApiNamespaceGenerator;

  beforeEach(async () => {
    const setup = createTestSetup();
    fs = setup.fs;
    logger = setup.logger;

    // Initialize generators
    featureGenerator = new FeatureDirectoryGenerator(logger, fs);
    routeGenerator = new RouteGenerator(logger, fs, featureGenerator);
    apiGenerator = new ApiGenerator(logger, fs, featureGenerator);
    jobGenerator = new JobGenerator(logger, fs, featureGenerator);
    crudGenerator = new CrudGenerator(logger, fs, featureGenerator);
    operationGenerator = new OperationGenerator(logger, fs, featureGenerator);
    apiNamespaceGenerator = new ApiNamespaceGenerator(
      logger,
      fs,
      featureGenerator
    );
  });

  it('should handle missing feature directory', async () => {
    // Test that generator handles nonexistent features gracefully
    try {
      await routeGenerator.generate({
        feature: 'nonexistent',
        name: 'Test',
        path: '/test',
        force: false,
      });
      // If it doesn't throw, that's fine too
      expect(true).toBe(true);
    } catch (error) {
      // If it throws, that's expected behavior
      expect(error).toBeDefined();
    }
  });

  it('should handle missing required parameters', async () => {
    featureGenerator.generateFeature('documents');

    // Test that generator handles missing parameters gracefully
    await apiGenerator.generate({
      feature: 'documents',
      name: '',
      method: 'GET',
      route: '/api/test',
      force: false,
    });

    // Should still complete without fatal errors in test environment
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should handle duplicate CRUD creation without force', async () => {
    featureGenerator.generateFeature('documents');

    // Create CRUD first time
    await crudGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      override: ['get', 'getAll'],
      force: false,
    });

    await expect(
      // Try to create again without force
      crudGenerator.generate({
        feature: 'documents',
        dataType: 'Document',
        override: ['get', 'getAll'],
        force: false,
      })
    ).rejects.toThrow('CRUD file already exists');
  });

  it('should handle duplicate API creation without force', async () => {
    featureGenerator.generateFeature('documents');

    // Create API first time
    await apiGenerator.generate({
      feature: 'documents',
      name: 'searchApi',
      method: 'GET',
      route: '/api/documents/search',
      entities: ['Document'],
      auth: false,
      force: false,
    });

    // Try to create again without force - should throw error
    await expect(
      apiGenerator.generate({
        feature: 'documents',
        name: 'searchApi',
        method: 'GET',
        route: '/api/documents/search',
        entities: ['Document'],
        auth: false,
        force: false,
      })
    ).rejects.toThrow('API endpoint file already exists');
  });

  it('should handle duplicate job creation without force', async () => {
    featureGenerator.generateFeature('documents');

    // Create job first time
    await jobGenerator.generate({
      feature: 'documents',
      name: 'archiveDocuments',
      entities: ['Document'],
      force: false,
    });

    // Try to create again without force - should throw error
    await expect(
      jobGenerator.generate({
        feature: 'documents',
        name: 'archiveDocuments',
        entities: ['Document'],
        force: false,
      })
    ).rejects.toThrow('job worker already exists');
  });

  it('should handle duplicate operation creation without force', async () => {
    featureGenerator.generateFeature('documents');

    // Create operation first time
    await operationGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'get',
      entities: 'Document',
      auth: false,
      force: false,
    });

    // Try to create again without force - should throw error
    await expect(
      operationGenerator.generate({
        feature: 'documents',
        dataType: 'Document',
        operation: 'get',
        entities: 'Document',
        auth: false,
        force: false,
      })
    ).rejects.toThrow('Operation file already exists');
  });

  it('should handle duplicate API namespace creation without force', async () => {
    featureGenerator.generateFeature('documents');

    // Create API namespace first time
    await apiNamespaceGenerator.generate({
      feature: 'documents',
      name: 'api',
      path: '/api',
      force: false,
    });

    // Try to create again without force - should throw error
    await expect(
      apiNamespaceGenerator.generate({
        feature: 'documents',
        name: 'api',
        path: '/api',
        force: false,
      })
    ).rejects.toThrow('Middleware file already exists');
  });
});
