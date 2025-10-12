import type { FileSystem, Logger } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CrudGenerator, FeatureDirectoryGenerator } from '../src';
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

describe('CRUD Generation Tests', () => {
  let fs: FileSystem;
  let logger: Logger;
  let featureGenerator: FeatureDirectoryGenerator;
  let crudGenerator: CrudGenerator;

  beforeEach(async () => {
    const setup = createTestSetup();
    fs = setup.fs;
    logger = setup.logger;

    // Initialize generators
    featureGenerator = new FeatureDirectoryGenerator(logger, fs);
    crudGenerator = new CrudGenerator(logger, fs, featureGenerator);

    // Create feature first
    featureGenerator.generate({ path: 'documents' });
  });

  it('should create a complete CRUD set', async () => {
    await crudGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should create CRUD with custom operations', async () => {
    await crudGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      public: ['get', 'getAll'],
      override: ['create', 'update'],
      exclude: ['delete'],
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle duplicate CRUD creation without force', async () => {
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

  it('should overwrite CRUD with force flag', async () => {
    // Create CRUD first time
    await crudGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      override: ['get', 'getAll'],
      force: false,
    });

    // Overwrite with force
    await crudGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      override: ['get', 'getAll'],
      force: true,
    });

    expect(logger.success).toHaveBeenCalledWith(
      expect.stringContaining('Overwrote CRUD file')
    );
  });

  it('should create a feature with all CRUD override operations like the example', async () => {
    // Create CRUD with all override operations (like the temp.wasp.ts example)
    await crudGenerator.generate({
      feature: 'documents',
      dataType: 'Document',
      override: ['get', 'getAll', 'create', 'update', 'delete'],
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });
});
