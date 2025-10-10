import type { IFileSystem, Logger } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiGenerator,
  CrudGenerator,
  FeatureDirectoryGenerator,
  JobGenerator,
  OperationGenerator,
  RouteGenerator,
} from '../src';
import { createPrismaMock, createTestSetup } from './utils';

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

describe('Complete Feature Workflow Tests', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let mockFiles: Record<string, string>;
  let featureGenerator: FeatureDirectoryGenerator;
  let routeGenerator: RouteGenerator;
  let apiGenerator: ApiGenerator;
  let jobGenerator: JobGenerator;
  let crudGenerator: CrudGenerator;
  let operationGenerator: OperationGenerator;

  beforeEach(async () => {
    const setup = createTestSetup();
    fs = setup.fs;
    logger = setup.logger;
    mockFiles = setup.mockFiles;

    // Initialize generators
    featureGenerator = new FeatureDirectoryGenerator(logger, fs);
    routeGenerator = new RouteGenerator(logger, fs, featureGenerator);
    apiGenerator = new ApiGenerator(logger, fs, featureGenerator);
    jobGenerator = new JobGenerator(logger, fs, featureGenerator);
    crudGenerator = new CrudGenerator(logger, fs, featureGenerator);
    operationGenerator = new OperationGenerator(logger, fs, featureGenerator);
  });

  it('should create a fully populated feature like the example', async () => {
    featureGenerator.generate({ path: 'documents' });

    // Create route
    await routeGenerator.generate({
      feature: 'documents',
      name: 'Documents',
      path: '/documents',
      force: false,
    });

    // Create API
    await apiGenerator.generate({
      feature: 'documents',
      name: 'searchApi',
      method: 'GET',
      route: '/api/documents/search',
      entities: ['Document'],
      auth: false,
      force: false,
    });

    // Create job
    await jobGenerator.generate({
      feature: 'documents',
      name: 'archiveDocuments',
      entities: ['Document'],
      force: false,
    });

    // Create CRUD
    await crudGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      force: false,
    });

    // Create operations
    await operationGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'get',
      entities: 'Document',
      auth: false,
      force: false,
    });

    await operationGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'getAll',
      entities: 'Document',
      auth: false,
      force: false,
    });

    await operationGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'create',
      entities: 'Document',
      auth: true,
      force: false,
    });

    // Verify all generators were called and files created
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();

    // Verify feature config was updated multiple times (should exist after generators run)
    const actualPath = Object.keys(mockFiles).find((key) =>
      key.includes('documents.wasp.ts')
    );
    expect(actualPath).toBeDefined();
  });

  it('should handle force flag across multiple generators', async () => {
    featureGenerator.generate({ path: 'documents' });

    // Create route
    await routeGenerator.generate({
      feature: 'documents',
      name: 'Documents',
      path: '/documents',
      force: false,
    });

    // Try to create same route again with force
    await routeGenerator.generate({
      feature: 'documents',
      name: 'Documents',
      path: '/documents',
      force: true,
    });

    // Route generator creates files and updates config
    expect(logger.success).toHaveBeenCalled();
  });

  it('should create multiple APIs with different HTTP methods', async () => {
    featureGenerator.generate({ path: 'documents' });

    // Create multiple APIs like in the example
    await apiGenerator.generate({
      feature: 'documents',
      name: 'searchApi',
      method: 'GET',
      route: '/api/documents/search',
      entities: ['Document'],
      auth: false,
      force: false,
    });

    await apiGenerator.generate({
      feature: 'documents',
      name: 'createDocumentApi',
      method: 'POST',
      route: '/api/documents',
      entities: ['Document'],
      auth: true,
      force: false,
    });

    await apiGenerator.generate({
      feature: 'documents',
      name: 'updateDocumentApi',
      method: 'PUT',
      route: '/api/documents/:id',
      entities: ['Document'],
      auth: true,
      force: false,
    });

    await apiGenerator.generate({
      feature: 'documents',
      name: 'deleteDocumentApi',
      method: 'DELETE',
      route: '/api/documents/:id',
      entities: ['Document'],
      auth: true,
      force: false,
    });

    // APIs generate multiple files (handler + config updates)
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should create jobs with and without schedules', async () => {
    featureGenerator.generate({ path: 'documents' });

    // Create scheduled job (like in the example)
    await jobGenerator.generate({
      feature: 'documents',
      name: 'archiveDocuments',
      entities: ['Document'],
      cron: '0 2 * * *',
      args: '{}',
      force: false,
    });

    // Create on-demand job
    await jobGenerator.generate({
      feature: 'documents',
      name: 'processDocument',
      entities: ['Document'],
      force: false,
    });

    // Jobs generate multiple files (job + config updates)
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should handle nested feature paths correctly', async () => {
    // Create parent feature
    featureGenerator.generate({ path: 'documents' });

    // Test that we can create routes in the main feature
    await routeGenerator.generate({
      feature: 'documents',
      path: '/documents/admin/dashboard',
      name: 'AdminDashboard',
      auth: true,
      force: false,
    });

    await routeGenerator.generate({
      feature: 'documents',
      path: '/documents/browse',
      name: 'BrowseDocuments',
      auth: false,
      force: false,
    });

    expect(logger.success).toHaveBeenCalledWith(
      expect.stringContaining('Generated feature: features/documents')
    );
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
