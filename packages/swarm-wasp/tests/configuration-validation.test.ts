import type { IFileSystem, Logger } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiGenerator, FeatureDirectoryGenerator, OperationGenerator, RouteGenerator } from '../src';
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

describe('Configuration Validation Tests', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let mockFiles: Record<string, string>;
  let featureGenerator: FeatureDirectoryGenerator;
  let routeGenerator: RouteGenerator;
  let apiGenerator: ApiGenerator;
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
    operationGenerator = new OperationGenerator(logger, fs, featureGenerator);

    // Create feature first
    featureGenerator.generateFeature('documents');
  });

  it('should validate that feature config is properly updated', async () => {
    // Create various components that will trigger config updates
    await routeGenerator.generate({
      feature: 'documents',
      name: 'Documents',
      path: '/documents',
      force: false,
    });

    await apiGenerator.generate({
      feature: 'documents',
      name: 'searchApi',
      method: 'GET',
      route: '/api/documents/search',
      entities: ['Document'],
      auth: false,
      force: false,
    });

    // Verify config file exists and was updated (should exist after generators run)
    const actualPath = Object.keys(mockFiles).find((key) =>
      key.includes('documents.wasp.ts')
    );
    expect(actualPath).toBeDefined();
    // Config updates trigger success messages
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle multiple entities in operations', async () => {
    await operationGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'getAll',
      entities: 'Document,User,Category',
      auth: false,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    // Operation generator creates operation file and updates config
    expect(logger.success).toHaveBeenCalled();
  });
});
