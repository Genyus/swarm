import type { FileSystem, Logger } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ActionGenerator,
    FeatureDirectoryGenerator,
    QueryGenerator,
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
  getIdFields: vi.fn().mockReturnValue(['id']),
  getRequiredFields: vi.fn().mockReturnValue(['title']),
  getOptionalFields: vi.fn().mockReturnValue(['content']),
  getJsonFields: vi.fn().mockReturnValue(['settings']),
  generatePickType: vi
    .fn()
    .mockImplementation(
      (modelName: string, fields: string[]) =>
        fields.length
          ? `Pick<${modelName}, ${fields.map((f) => `"${f}"`).join(' | ')}>`
          : ''
    ),
  generateOmitType: vi
    .fn()
    .mockImplementation(
      (modelName: string, fields: string[]) =>
        fields.length
          ? `Omit<${modelName}, ${fields.map((f) => `"${f}"`).join(' | ')}>`
          : modelName
    ),
  generatePartialType: vi
    .fn()
    .mockImplementation((typeString: string) =>
      typeString ? `Partial<${typeString}>` : ''
    ),
  generateIntersectionType: vi.fn().mockImplementation((type1: string, type2: string) => {
    if (!type1 && !type2) return '';
    if (!type1) return type2;
    if (!type2) return type1;
    return `${type1} & ${type2}`;
  }),
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
