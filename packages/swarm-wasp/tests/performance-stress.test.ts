import type { IFileSystem, Logger } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiGenerator,
  FeatureDirectoryGenerator,
  JobGenerator,
  OperationGenerator,
  RouteGenerator,
} from '../src';
import { ActionOperation, QueryOperation } from '../src/types/constants';
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

describe('Performance and Stress Tests', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGenerator: FeatureDirectoryGenerator;
  let routeGenerator: RouteGenerator;
  let apiGenerator: ApiGenerator;
  let jobGenerator: JobGenerator;
  let operationGenerator: OperationGenerator;

  beforeEach(async () => {
    const setup = createTestSetup();
    fs = setup.fs;
    logger = setup.logger;

    // Initialize generators
    featureGenerator = new FeatureDirectoryGenerator(logger, fs);
    routeGenerator = new RouteGenerator(logger, fs, featureGenerator);
    apiGenerator = new ApiGenerator(logger, fs, featureGenerator);
    jobGenerator = new JobGenerator(logger, fs, featureGenerator);
    operationGenerator = new OperationGenerator(logger, fs, featureGenerator);

    // Create feature first
    featureGenerator.generate({ path: 'documents' });
  });

  it('should handle multiple rapid API generations', async () => {
    const promises = [];

    for (let i = 0; i < 5; i++) {
      promises.push(
        apiGenerator.generate({
          feature: 'documents',
          name: `api${i}`,
          method: 'GET',
          route: `/api/test${i}`,
          entities: ['Document'],
          auth: false,
          force: false,
        })
      );
    }

    await Promise.all(promises);

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle multiple rapid route generations', async () => {
    const promises = [];

    for (let i = 0; i < 5; i++) {
      promises.push(
        routeGenerator.generate({
          feature: 'documents',
          path: `/test${i}`,
          name: `TestPage${i}`,
          auth: false,
          force: false,
        })
      );
    }

    await Promise.all(promises);

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle multiple rapid operation generations', async () => {
    const promises = [];
    const operations: (ActionOperation | QueryOperation)[] = [
      'get',
      'getAll',
      'create',
      'update',
      'delete',
    ];

    for (let i = 0; i < 5; i++) {
      promises.push(
        operationGenerator.generate({
          feature: 'documents',
          dataType: 'Document',
          operation: operations[i],
          entities: 'Document',
          auth: false,
          force: false,
        })
      );
    }

    await Promise.all(promises);

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle multiple rapid job generations', async () => {
    const promises = [];

    for (let i = 0; i < 5; i++) {
      promises.push(
        jobGenerator.generate({
          feature: 'documents',
          name: `job${i}`,
          entities: ['Document'],
          force: false,
        })
      );
    }

    await Promise.all(promises);

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle mixed generator types in parallel', async () => {
    const promises = [
      routeGenerator.generate({
        feature: 'documents',
        name: 'Documents',
        path: '/test',
        force: false,
      }),
      apiGenerator.generate({
        feature: 'documents',
        name: 'testApi',
        method: 'GET',
        route: '/api/test',
        entities: ['Document'],
        auth: false,
        force: false,
      }),
      jobGenerator.generate({
        feature: 'documents',
        name: 'testJob',
        entities: ['Document'],
        force: false,
      }),
      operationGenerator.generate({
        feature: 'documents',
        dataType: 'Document',
        operation: 'get',
        entities: 'Document',
        auth: false,
        force: false,
      }),
    ];

    await Promise.all(promises);

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle large number of entities in operations', async () => {
    const entities = Array.from({ length: 20 }, (_, i) => `Entity${i}`).join(
      ','
    );

    await operationGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'getAll',
      entities,
      auth: false,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle complex CRUD operations efficiently', async () => {
    const { CrudGenerator } = await import('../src');
    const crudGenerator = new CrudGenerator(logger, fs, featureGenerator);

    await crudGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      override: ['get', 'getAll', 'create', 'update', 'delete'],
      public: ['get', 'getAll'],
      exclude: [],
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });
});
