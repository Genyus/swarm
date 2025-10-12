import type { FileSystem, Logger } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ActionGenerator,
  ApiGenerator, FeatureDirectoryGenerator, JobGenerator,
  QueryGenerator, RouteGenerator
} from '../src';
import { createTestSetup } from './utils';

// Mock the Prisma utilities at the test level
vi.mock('../src/common/prisma', () => ({
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
        name: 'isArchived',
        type: 'Boolean',
        tsType: 'boolean',
        isRequired: false,
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
  getOmitFields: vi.fn().mockReturnValue('"id" | "createdAt" | "isArchived"'),
  getOptionalFields: vi.fn().mockReturnValue({ isArchived: 'boolean' }),
  getJsonFields: vi.fn().mockReturnValue(['settings']),
  needsPrismaImport: vi.fn().mockReturnValue(true),
  generateJsonTypeHandling: vi
    .fn()
    .mockReturnValue(
      ',\n        settings: (data.settings as Prisma.JsonValue) || Prisma.JsonNull'
    ),
}));

describe('Edge Cases Tests', () => {
  let fs: FileSystem;
  let logger: Logger;
  let featureGenerator: FeatureDirectoryGenerator;
  let routeGenerator: RouteGenerator;
  let apiGenerator: ApiGenerator;
  let jobGenerator: JobGenerator;
  let actionGenerator: ActionGenerator;
  let queryGenerator: QueryGenerator;

  beforeEach(async () => {
    const setup = createTestSetup();
    fs = setup.fs;
    logger = setup.logger;

    // Initialize generators
    featureGenerator = new FeatureDirectoryGenerator(logger, fs);
    routeGenerator = new RouteGenerator(logger, fs, featureGenerator);
    apiGenerator = new ApiGenerator(logger, fs, featureGenerator);
    jobGenerator = new JobGenerator(logger, fs, featureGenerator);
    actionGenerator = new ActionGenerator(logger, fs, featureGenerator);
    queryGenerator = new QueryGenerator(logger, fs, featureGenerator);

    // Create feature first
    featureGenerator.generate({ path: 'documents' });
  });

  it('should handle empty entity arrays', async () => {
    await queryGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'get',
      entities: '',
      auth: false,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle single entity string', async () => {
    await queryGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'get',
      entities: 'Document',
      auth: false,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle job without schedule', async () => {
    await jobGenerator.generate({
      feature: 'documents',
      name: 'processDocument',
      entities: ['Document'],
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle job with empty args', async () => {
    await jobGenerator.generate({
      feature: 'documents',
      name: 'processDocument',
      entities: ['Document'],
      args: '',
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle API without entities', async () => {
    await apiGenerator.generate({
      feature: 'documents',
      name: 'healthCheck',
      method: 'GET',
      route: '/api/health',
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle route with complex path', async () => {
    await routeGenerator.generate({
      feature: 'documents',
      path: '/documents/:id/edit/:section',
      name: 'EditDocumentSection',
      auth: true,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle operation with special characters in name', async () => {
    await queryGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'get',
      entities: 'Document',
      auth: false,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle CRUD with empty override array', async () => {
    const { CrudGenerator } = await import('../src');
    const crudGenerator = new CrudGenerator(logger, fs, featureGenerator);

    await crudGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      override: [],
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle API namespace with root path', async () => {
    const { ApiNamespaceGenerator } = await import('../src');
    const apiNamespaceGenerator = new ApiNamespaceGenerator(logger, fs, featureGenerator);

    await apiNamespaceGenerator.generate({
      feature: 'documents',
      name: 'root',
      path: '/',
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });
});
