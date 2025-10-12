import type { FileSystem, Logger } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ActionGenerator,
  FeatureDirectoryGenerator,
  QueryGenerator,
} from '../src';
import { createPrismaMock, createTestSetup } from './utils';

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

describe('Operation Generation Tests', () => {
  let fs: FileSystem;
  let logger: Logger;
  let featureGenerator: FeatureDirectoryGenerator;
  let actionGenerator: ActionGenerator;
  let queryGenerator: QueryGenerator;

  beforeEach(async () => {
    const setup = createTestSetup();
    fs = setup.fs;
    logger = setup.logger;

    // Initialize generators
    featureGenerator = new FeatureDirectoryGenerator(logger, fs);
    actionGenerator = new ActionGenerator(logger, fs, featureGenerator);
    queryGenerator = new QueryGenerator(logger, fs, featureGenerator);

    // Create feature first
    featureGenerator.generate({ path: 'documents' });
  });

  it('should create a query operation', async () => {
    await queryGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'get',
      entities: 'Document',
      auth: false,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    // Query generator creates query file and updates config
    expect(logger.success).toHaveBeenCalled();
  });

  it('should create an action operation', async () => {
    await actionGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'create',
      entities: 'Document',
      auth: true,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    // Action generator creates action file and updates config
    expect(logger.success).toHaveBeenCalled();
  });

  it('should create multiple entity operation', async () => {
    await queryGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'getAll',
      entities: 'Document,User',
      auth: false,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    // Query generator creates query file and updates config
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle duplicate operation creation without force', async () => {
    // Create query first time
    await queryGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'get',
      entities: 'Document',
      auth: false,
      force: false,
    });

    // Try to create again without force - should throw error
    await expect(
      queryGenerator.generate({
        feature: 'documents',
        dataType: 'Document',
        operation: 'get',
        entities: 'Document',
        auth: false,
        force: false,
      })
    ).rejects.toThrow('Operation file already exists');
  });

  it('should overwrite operation with force flag', async () => {
    // Create query first time
    await queryGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'get',
      entities: 'Document',
      auth: false,
      force: false,
    });

    // Overwrite with force
    await queryGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'get',
      entities: 'Document',
      auth: false,
      force: true,
    });

    // Query generator creates files and updates config
    expect(logger.success).toHaveBeenCalled();
  });

  it('should create both queries and actions for the same entity', async () => {
    // Create queries (like in the example)
    await queryGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'get',
      entities: 'Document',
      auth: false,
      force: false,
    });

    await queryGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'getAll',
      entities: 'Document',
      auth: false,
      force: false,
    });

    // Create actions (like in the example)
    await actionGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'create',
      entities: 'Document',
      auth: true,
      force: false,
    });

    await actionGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'update',
      entities: 'Document',
      auth: true,
      force: false,
    });

    await actionGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'delete',
      entities: 'Document',
      auth: true,
      force: false,
    });

    // Operations generate multiple files (action/query + config updates)
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should handle multiple entities in operations', async () => {
    await queryGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'getAll',
      entities: 'Document,User,Category',
      auth: false,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    // Query generator creates query file and updates config
    expect(logger.success).toHaveBeenCalled();
  });
});
