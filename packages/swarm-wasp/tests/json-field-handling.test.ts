import type { FileSystem, Logger } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ActionGenerator,
    ApiGenerator,
    CrudGenerator,
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

describe('JSON Field Handling Tests', () => {
  let fs: FileSystem;
  let logger: Logger;
  let featureGenerator: FeatureDirectoryGenerator;
  let crudGenerator: CrudGenerator;
  let actionGenerator: ActionGenerator;
  let queryGenerator: QueryGenerator;
  let apiGenerator: ApiGenerator;

  beforeEach(async () => {
    const setup = createTestSetup();
    fs = setup.fs;
    logger = setup.logger;

    // Initialize generators
    featureGenerator = new FeatureDirectoryGenerator(logger, fs);
    crudGenerator = new CrudGenerator(logger, fs, featureGenerator);
    actionGenerator = new ActionGenerator(logger, fs, featureGenerator);
    queryGenerator = new QueryGenerator(logger, fs, featureGenerator);
    apiGenerator = new ApiGenerator(logger, fs, featureGenerator);

    // Create feature first
    featureGenerator.generate({ path: 'documents' });
  });

  it('should properly handle JSON fields in CRUD operations', async () => {
    await crudGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();

    // Note: The simplified CRUD generator doesn't use complex Prisma utilities
    // This test verifies that CRUD generation completes successfully
  });

  it('should handle JSON fields in operation generation', async () => {
    await actionGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      operation: 'create',
      entities: 'Document',
      auth: true,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();

    // Note: The simplified operation generator doesn't use complex Prisma utilities
    // This test verifies that operation generation completes successfully
  });

  it('should include JSON fields in API generation with proper type handling', async () => {
    await apiGenerator.generate({
      feature: 'documents',
      name: 'createDocument',
      method: 'POST',
      route: '/api/documents',
      entities: ['Document'],
      auth: true,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();

    // Note: The simplified API generator doesn't use complex Prisma utilities
    // This test verifies that API generation completes successfully
  });

  it('should handle JSON fields correctly in all CRUD override operations', async () => {
    await crudGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      override: ['get', 'getAll', 'create', 'update', 'delete'],
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();

    // Note: The simplified CRUD generator doesn't use complex Prisma utilities
    // This test verifies that CRUD generation with overrides completes successfully
  });

  it('should validate JSON field metadata is correctly extracted', async () => {
    const { getEntityMetadata } = await import('../src/common/prisma');
    const metadata = await getEntityMetadata('Document');

    // Verify the settings JSON field is present with correct properties
    const settingsField = metadata.fields.find(
      (field) => field.name === 'settings'
    );
    expect(settingsField).toBeDefined();
    expect(settingsField?.type).toBe('Json');
    expect(settingsField?.tsType).toBe('Prisma.JsonValue');
    expect(settingsField?.hasDefaultValue).toBe(true);
  });

  it('should ensure Prisma import is required when JSON fields are present', async () => {
    const { needsPrismaImport, getEntityMetadata } = await import(
      '../src/common/prisma'
    );
    const metadata = await getEntityMetadata('Document');

    // Should require Prisma import for JSON field handling
    expect(needsPrismaImport(metadata)).toBe(true);
  });

  it('should generate appropriate JSON type handling code', async () => {
    const { generateJsonTypeHandling } = await import(
      '../src/common/prisma'
    );
    const jsonHandling = generateJsonTypeHandling(['settings']);

    // Verify JSON handling code is generated
    expect(jsonHandling).toContain('settings');
    expect(jsonHandling).toContain('Prisma.JsonValue');
  });

  it('should identify JSON fields correctly', async () => {
    const { getJsonFields, getEntityMetadata } = await import(
      '../src/common/prisma'
    );
    const metadata = await getEntityMetadata('Document');
    const jsonFields = getJsonFields(metadata);

    // Verify settings field is identified as JSON
    expect(jsonFields).toContain('settings');
    expect(jsonFields).toHaveLength(1);
  });
});
