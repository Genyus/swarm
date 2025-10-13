import type { FileSystem, Logger } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ActionGenerator,
    ApiGenerator, FeatureDirectoryGenerator,
    QueryGenerator, RouteGenerator
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

describe('Configuration Validation Tests', () => {
  let fs: FileSystem;
  let logger: Logger;
  let mockFiles: Record<string, string>;
  let featureGenerator: FeatureDirectoryGenerator;
  let routeGenerator: RouteGenerator;
  let apiGenerator: ApiGenerator;
  let actionGenerator: ActionGenerator;
  let queryGenerator: QueryGenerator;

  beforeEach(async () => {
    const setup = createTestSetup();
    fs = setup.fs;
    logger = setup.logger;
    mockFiles = setup.mockFiles;

    // Initialize generators
    featureGenerator = new FeatureDirectoryGenerator(logger, fs);
    routeGenerator = new RouteGenerator(logger, fs, featureGenerator);
    apiGenerator = new ApiGenerator(logger, fs, featureGenerator);
    actionGenerator = new ActionGenerator(logger, fs, featureGenerator);
    queryGenerator = new QueryGenerator(logger, fs, featureGenerator);

    // Create feature first
    featureGenerator.generate({ path: 'documents' });
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
    await queryGenerator.generate({
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
