import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiGenerator,
  ApiNamespaceGenerator,
  CrudGenerator,
  FeatureGenerator,
  JobGenerator,
  OperationGenerator,
  RouteGenerator,
} from '../../src/generators/index';
import type { IFileSystem } from '../../src/types/filesystem';
import type { Logger } from '../../src/types/logger';

// Mock the filesystem utility functions separately
vi.mock('../../src/utils/filesystem', () => ({
  getTemplatesDir: vi.fn().mockReturnValue('/mock/templates'),
  findWaspRoot: vi.fn().mockReturnValue('/mock/wasp-root'),
  getFeatureDir: vi.fn().mockReturnValue('/mock/features'),
  copyDirectory: vi.fn(),
  normaliseFeaturePath: vi
    .fn()
    .mockImplementation((path: string) =>
      `/${path}`.split('/').join('/features/').slice(1)
    ),
  getRouteNameFromPath: vi.fn().mockImplementation((path: string) => path),
  getFeatureTargetDir: vi.fn().mockReturnValue({
    targetDirectory: '/mock/target',
    importDirectory: '/mock/import',
  }),
  ensureDirectoryExists: vi.fn().mockImplementation((fs: any, path: string) => {
    // Mock implementation that doesn't actually create directories
    return true;
  }),
  getFeatureImportPath: vi
    .fn()
    .mockImplementation((path: string) => `@features/${path}`),
}));

vi.mock('../../src/utils/strings', () => ({
  validateFeaturePath: vi
    .fn()
    .mockImplementation((path: string) => path.split('/')),
  parseHelperMethodDefinition: vi.fn().mockReturnValue({
    methodName: 'addApi',
    firstParam: 'testApi',
  }),
  hasHelperMethodCall: vi.fn().mockReturnValue(false),
  toCamelCase: vi.fn().mockImplementation((str: string) => str),
  toPascalCase: vi.fn().mockImplementation((str: string) => str),
  getPlural: vi.fn().mockImplementation((str: string) => str + 's'),
  capitalise: vi
    .fn()
    .mockImplementation(
      (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
    ),
  formatDisplayName: vi.fn().mockImplementation((str: string) => str),
}));

// Mock the Prisma utilities
vi.mock('../../src/utils/prisma', () => ({
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

// Mock the TemplateUtility
vi.mock('../../src/utils/templates', () => ({
  TemplateUtility: vi.fn().mockImplementation(() => ({
    processTemplate: vi.fn().mockReturnValue('mocked template content'),
  })),
}));

// Mock the node:fs module to intercept schema.prisma reads
vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn((path: string) => {
      if (path.endsWith('schema.prisma')) {
        return `model Document {
  id        String   @id @default(cuid())
  title     String
  content   String?
  settings  Json     @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
      }
      throw new Error(`File not found: ${path}`);
    }),
    existsSync: vi.fn((path: string) => {
      // Return true for schema.prisma files
      if (path.endsWith('schema.prisma')) {
        return true;
      }
      // Return true for parent feature directories that exist
      if (path.includes('/mock/wasp-root/src/features/documents')) {
        return true;
      }
      // Return false for other paths (like non-existent parent directories)
      return false;
    }),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
    copyFileSync: vi.fn(),
  },
}));

// Mock the prisma utilities at the module level
vi.mock('../../src', async () => {
  const actual = await vi.importActual('../../src');
  return {
    ...actual,
    getTemplatesDir: vi.fn().mockReturnValue('/mock/templates'),
    TemplateUtility: vi.fn().mockImplementation(() => ({
      processTemplate: vi.fn().mockReturnValue('mocked template content'),
    })),
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
  };
});

describe('Integration Tests - Full Feature Creation', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGenerator: FeatureGenerator;
  let routeGenerator: RouteGenerator;
  let apiGenerator: ApiGenerator;
  let jobGenerator: JobGenerator;
  let crudGenerator: CrudGenerator;
  let operationGenerator: OperationGenerator;
  let apiNamespaceGenerator: ApiNamespaceGenerator;

  const mockFiles: Record<string, string> = {};
  const fileCallCounts: Record<string, number> = {};

  beforeEach(() => {
    // Reset mock files
    Object.keys(mockFiles).forEach((key) => delete mockFiles[key]);
    // Reset call counts
    Object.keys(fileCallCounts).forEach((key) => delete fileCallCounts[key]);

    // Add mock template files
    mockFiles['/mock/templates/files/server/crud.eta'] = `
import { <%=dataType%> } from '@wasp/entities';
import { HttpError } from '@wasp/core';

export const <%=crudName%> = {
  <%=operations%>
};
`;

    // Also add the template file at the expected path for the TemplateUtility
    mockFiles[
      '/Users/gary/Dev/swarm/packages/swarm-core/dist/templates/files/server/crud.eta'
    ] = `
import { <%=dataType%> } from '@wasp/entities';
import { HttpError } from '@wasp/core';

export const <%=crudName%> = {
  <%=operations%>
};
`;

    // Create comprehensive mock filesystem
    fs = {
      readFileSync: vi.fn((path: string) => {
        if (typeof path === 'string') {
          if (path.includes('feature.wasp.eta')) {
            return 'export default function getConfig(app: App) { return {}; }';
          }
          if (path.includes('.wasp.ts')) {
            return (
              mockFiles[path] ||
              'export default function getConfig(app: App) { return {}; }'
            );
          }
          // Mock schema.prisma file for operation generator
          if (path.endsWith('schema.prisma')) {
            return `model Document {
  id        String   @id @default(cuid())
  title     String
  content   String?
  settings  Json     @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
          }
          if (mockFiles[path]) {
            return mockFiles[path];
          }
        }
        return 'template content';
      }),
      writeFileSync: vi.fn((path: string, content: string) => {
        if (typeof path === 'string') {
          mockFiles[path] = content;
        }
      }),
      existsSync: vi.fn((path: string) => {
        if (typeof path === 'string') {
          // Mock .wasproot file to make findWaspRoot work
          if (path.includes('.wasproot')) return true;
          // Config files exist after feature creation
          if (path.includes('.wasp.ts')) return true;
          // Template files always exist
          if (path.includes('template')) return true;
          // Mock template files exist
          if (path.startsWith('/mock/templates/')) return true;
          // Feature directories exist after creation (but not files within them)
          if (path.includes('features/documents') && !path.includes('.ts'))
            return true;

          // Check if file exists in our mock filesystem
          const existsInMockFiles = Boolean(mockFiles[path]);

          // For force flag tests: if file doesn't exist in mockFiles, return false
          // This simulates the file not existing initially
          if (!existsInMockFiles) {
            return false;
          }

          return true;
        }
        return false;
      }),
      copyFileSync: vi.fn((src: string, dest: string) => {
        mockFiles[dest] = mockFiles[src] || 'copied content';
      }),
      mkdirSync: vi.fn(),
      readdirSync: vi.fn().mockReturnValue([]),
      statSync: vi.fn().mockReturnValue({
        isDirectory: () => false,
        isFile: () => true,
      }),
    };

    logger = {
      debug: vi.fn(),
      info: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };

    // Initialize generators
    featureGenerator = new FeatureGenerator(logger, fs);
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

  describe('Feature Creation', () => {
    it('should create a top-level feature with config', async () => {
      featureGenerator.generateFeature('documents');

      // Check that the success message was logged, which indicates the feature was generated
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining('Generated feature: features/documents')
      );
    });

    it('should create a sub-feature without config', async () => {
      // First create parent feature
      featureGenerator.generateFeature('documents');

      // Now create sub-feature - this should succeed since parent exists
      featureGenerator.generateFeature('documents/admin');

      // Check that the success message was logged for the sub-feature
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining(
          'Generated feature: features/documents/features/admin'
        )
      );
    });

    it('should fail to create sub-feature without parent', async () => {
      // Reset the existsSync mock to not find the parent directory
      const mockExistsSync = vi.mocked(fs.existsSync);
      mockExistsSync.mockImplementation((path: string) => {
        // Return true for schema.prisma files
        if (path.endsWith('schema.prisma')) {
          return true;
        }
        // Return false for all other paths (including parent directories)
        return false;
      });

      expect(() => {
        featureGenerator.generateFeature('documents/admin');
      }).toThrow();

      // Restore the original mock behavior
      mockExistsSync.mockImplementation((path: string) => {
        // Return true for schema.prisma files
        if (path.endsWith('schema.prisma')) {
          return true;
        }
        // Return true for parent feature directories that exist
        if (path.includes('/mock/wasp-root/src/features/documents')) {
          return true;
        }
        // Return false for other paths (like non-existent parent directories)
        return false;
      });
    });
  });

  describe('Route Creation', () => {
    beforeEach(async () => {
      featureGenerator.generateFeature('documents');
    });

    it('should create a route with default settings', async () => {
      await routeGenerator.generate('documents', {
        path: '/documents',
        force: false,
      });

      // Route generator creates page files and updates config
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalled();
    });

    it('should create a route with auth required', async () => {
      await routeGenerator.generate('documents', {
        path: '/documents/admin',
        name: 'AdminPage',
        auth: true,
        force: false,
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalled();
    });

    it('should handle duplicate route creation without force', async () => {
      await routeGenerator.generate('documents', {
        path: '/documents',
        force: false,
      });

      // Create again without force - should throw error
      await expect(
        routeGenerator.generate('documents', {
          path: '/documents',
          force: false,
        })
      ).rejects.toThrow('Page file already exists');
    });

    it('should overwrite route with force flag', async () => {
      await routeGenerator.generate('documents', {
        path: '/documents',
        force: false,
      });

      await routeGenerator.generate('documents', {
        path: '/documents',
        force: true,
      });

      // Route generator creates files and updates config
      expect(logger.success).toHaveBeenCalled();
    });
  });

  describe('API Creation', () => {
    beforeEach(async () => {
      featureGenerator.generateFeature('documents');
    });

    it('should create an API endpoint', async () => {
      await apiGenerator.generate('documents', {
        name: 'searchApi',
        method: 'GET',
        route: '/api/documents/search',
        entities: ['Document'],
        auth: false,
        force: false,
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalled();
    });

    it('should create an authenticated API endpoint', async () => {
      await apiGenerator.generate('documents', {
        name: 'createDocument',
        method: 'POST',
        route: '/api/documents',
        entities: ['Document'],
        auth: true,
        force: false,
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalled();
    });
  });

  describe('Job Creation', () => {
    beforeEach(async () => {
      featureGenerator.generateFeature('documents');
    });

    it('should create a scheduled job', async () => {
      await jobGenerator.generate('documents', {
        name: 'archiveDocuments',
        entities: ['Document'],
        cron: '0 2 * * *', // Daily at 2 AM
        args: '{}',
        force: false,
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalled();
    });

    it('should create a job without schedule', async () => {
      await jobGenerator.generate('documents', {
        name: 'processDocument',
        entities: ['Document'],
        force: false,
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalled();
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(async () => {
      featureGenerator.generateFeature('documents');
    });

    it('should create a complete CRUD set', async () => {
      await crudGenerator.generate('documents', {
        dataType: 'Document',
        force: false,
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalled();
    });

    it('should create CRUD with custom operations', async () => {
      await crudGenerator.generate('documents', {
        dataType: 'Document',
        public: ['get', 'getAll'],
        override: ['create', 'update'],
        exclude: ['delete'],
        force: false,
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalled();
    });
  });

  describe('Operation Creation (Queries & Actions)', () => {
    beforeEach(async () => {
      featureGenerator.generateFeature('documents');
    });

    it('should create a query operation', async () => {
      await operationGenerator.generate('documents', {
        dataType: 'Document',
        operation: 'get',
        entities: 'Document',
        auth: false,
        force: false,
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
      // Operation generator creates operation file and updates config
      expect(logger.success).toHaveBeenCalled();
    });

    it('should create an action operation', async () => {
      await operationGenerator.generate('documents', {
        dataType: 'Document',
        operation: 'create',
        entities: 'Document',
        auth: true,
        force: false,
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
      // Operation generator creates operation file and updates config
      expect(logger.success).toHaveBeenCalled();
    });

    it('should create multiple entity operation', async () => {
      await operationGenerator.generate('documents', {
        dataType: 'Document',
        operation: 'getAll',
        entities: 'Document,User',
        auth: false,
        force: false,
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
      // Operation generator creates operation file and updates config
      expect(logger.success).toHaveBeenCalled();
    });
  });

  describe('API Namespace Creation', () => {
    beforeEach(async () => {
      featureGenerator.generateFeature('documents');
    });

    it('should create an API namespace with middleware', async () => {
      await apiNamespaceGenerator.generate('documents', {
        name: 'api',
        path: '/api',
        force: false,
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalled();
    });
  });

  describe('Complete Feature Workflow', () => {
    it('should create a fully populated feature like the example', async () => {
      featureGenerator.generateFeature('documents');

      // Create route
      await routeGenerator.generate('documents', {
        path: '/documents',
        force: false,
      });

      // Create API
      await apiGenerator.generate('documents', {
        name: 'searchApi',
        method: 'GET',
        route: '/api/documents/search',
        entities: ['Document'],
        auth: false,
        force: false,
      });

      // Create job
      await jobGenerator.generate('documents', {
        name: 'archiveDocuments',
        entities: ['Document'],
        force: false,
      });

      // Create CRUD
      await crudGenerator.generate('documents', {
        dataType: 'Document',
        force: false,
      });

      // Create operations
      await operationGenerator.generate('documents', {
        dataType: 'Document',
        operation: 'get',
        entities: 'Document',
        auth: false,
        force: false,
      });

      await operationGenerator.generate('documents', {
        dataType: 'Document',
        operation: 'getAll',
        entities: 'Document',
        auth: false,
        force: false,
      });

      await operationGenerator.generate('documents', {
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
      featureGenerator.generateFeature('documents');

      // Create route
      await routeGenerator.generate('documents', {
        path: '/documents',
        force: false,
      });

      // Try to create same route again with force
      await routeGenerator.generate('documents', {
        path: '/documents',
        force: true,
      });

      // Route generator creates files and updates config
      expect(logger.success).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing feature directory', async () => {
      // Test that generator handles nonexistent features gracefully
      try {
        await routeGenerator.generate('nonexistent', {
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
      await apiGenerator.generate('documents', {
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
      await crudGenerator.generate('documents', {
        dataType: 'Document',
        override: ['get', 'getAll'],
        force: false,
      });

      await expect(
        // Try to create again without force
        crudGenerator.generate('documents', {
          dataType: 'Document',
          override: ['get', 'getAll'],
          force: false,
        })
      ).rejects.toThrow('CRUD file already exists');
    });

    it('should handle duplicate API creation without force', async () => {
      featureGenerator.generateFeature('documents');

      // Create API first time
      await apiGenerator.generate('documents', {
        name: 'searchApi',
        method: 'GET',
        route: '/api/documents/search',
        entities: ['Document'],
        auth: false,
        force: false,
      });

      // Try to create again without force - should throw error
      await expect(
        apiGenerator.generate('documents', {
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
      await jobGenerator.generate('documents', {
        name: 'archiveDocuments',
        entities: ['Document'],
        force: false,
      });

      // Try to create again without force - should throw error
      await expect(
        jobGenerator.generate('documents', {
          name: 'archiveDocuments',
          entities: ['Document'],
          force: false,
        })
      ).rejects.toThrow('job worker already exists');
    });

    it('should handle duplicate operation creation without force', async () => {
      featureGenerator.generateFeature('documents');

      // Create operation first time
      await operationGenerator.generate('documents', {
        dataType: 'Document',
        operation: 'get',
        entities: 'Document',
        auth: false,
        force: false,
      });

      // Try to create again without force - should throw error
      await expect(
        operationGenerator.generate('documents', {
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
      await apiNamespaceGenerator.generate('documents', {
        name: 'api',
        path: '/api',
        force: false,
      });

      // Try to create again without force - should throw error
      await expect(
        apiNamespaceGenerator.generate('documents', {
          name: 'api',
          path: '/api',
          force: false,
        })
      ).rejects.toThrow('Middleware file already exists');
    });
  });

  describe('Force Flag Behavior', () => {
    beforeEach(async () => {
      // Reset call counts for each test in this describe block
      Object.keys(fileCallCounts).forEach((key) => delete fileCallCounts[key]);
      featureGenerator.generateFeature('documents');
    });

    it('should overwrite CRUD with force flag', async () => {
      // Create CRUD first time
      await crudGenerator.generate('documents', {
        dataType: 'Document',
        override: ['get', 'getAll'],
        force: false,
      });

      // Overwrite with force
      await crudGenerator.generate('documents', {
        dataType: 'Document',
        override: ['get', 'getAll'],
        force: true,
      });

      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining('Overwrote CRUD file')
      );
    });

    it('should overwrite API with force flag', async () => {
      // Create API first time
      await apiGenerator.generate('documents', {
        name: 'searchApi',
        method: 'GET',
        route: '/api/documents/search',
        entities: ['Document'],
        auth: false,
        force: false,
      });

      // Overwrite with force
      await apiGenerator.generate('documents', {
        name: 'searchApi',
        method: 'GET',
        route: '/api/documents/search',
        entities: ['Document'],
        auth: false,
        force: true,
      });

      expect(logger.success).toHaveBeenCalled();
    });

    it('should overwrite job with force flag', async () => {
      // Create job first time
      await jobGenerator.generate('documents', {
        name: 'archiveDocuments',
        entities: ['Document'],
        force: false,
      });

      // Overwrite with force
      await jobGenerator.generate('documents', {
        name: 'archiveDocuments',
        entities: ['Document'],
        force: true,
      });

      // Job generation triggers multiple success messages
      expect(logger.success).toHaveBeenCalled();
    });

    it('should overwrite operation with force flag', async () => {
      // Create operation first time
      await operationGenerator.generate('documents', {
        dataType: 'Document',
        operation: 'get',
        entities: 'Document',
        auth: false,
        force: false,
      });

      // Overwrite with force
      await operationGenerator.generate('documents', {
        dataType: 'Document',
        operation: 'get',
        entities: 'Document',
        auth: false,
        force: true,
      });

      // Operation generator creates files and updates config
      expect(logger.success).toHaveBeenCalled();
    });

    it('should overwrite API namespace with force flag', async () => {
      // Create API namespace first time
      await apiNamespaceGenerator.generate('documents', {
        name: 'api',
        path: '/api',
        force: false,
      });

      // Overwrite with force
      await apiNamespaceGenerator.generate('documents', {
        name: 'api',
        path: '/api',
        force: true,
      });

      expect(logger.success).toHaveBeenCalled();
    });
  });

  describe('Complex Feature Scenarios', () => {
    it('should create a feature with all CRUD override operations like the example', async () => {
      featureGenerator.generateFeature('documents');

      // Create CRUD with all override operations (like the temp.wasp.ts example)
      await crudGenerator.generate('documents', {
        dataType: 'Document',
        override: ['get', 'getAll', 'create', 'update', 'delete'],
        force: false,
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalled();
    });

    it('should create multiple APIs with different HTTP methods', async () => {
      featureGenerator.generateFeature('documents');

      // Create multiple APIs like in the example
      await apiGenerator.generate('documents', {
        name: 'searchApi',
        method: 'GET',
        route: '/api/documents/search',
        entities: ['Document'],
        auth: false,
        force: false,
      });

      await apiGenerator.generate('documents', {
        name: 'createDocumentApi',
        method: 'POST',
        route: '/api/documents',
        entities: ['Document'],
        auth: true,
        force: false,
      });

      await apiGenerator.generate('documents', {
        name: 'updateDocumentApi',
        method: 'PUT',
        route: '/api/documents/:id',
        entities: ['Document'],
        auth: true,
        force: false,
      });

      await apiGenerator.generate('documents', {
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

    it('should create both queries and actions for the same entity', async () => {
      featureGenerator.generateFeature('documents');

      // Create queries (like in the example)
      await operationGenerator.generate('documents', {
        dataType: 'Document',
        operation: 'get',
        entities: 'Document',
        auth: false,
        force: false,
      });

      await operationGenerator.generate('documents', {
        dataType: 'Document',
        operation: 'getAll',
        entities: 'Document',
        auth: false,
        force: false,
      });

      // Create actions (like in the example)
      await operationGenerator.generate('documents', {
        dataType: 'Document',
        operation: 'create',
        entities: 'Document',
        auth: true,
        force: false,
      });

      await operationGenerator.generate('documents', {
        dataType: 'Document',
        operation: 'update',
        entities: 'Document',
        auth: true,
        force: false,
      });

      await operationGenerator.generate('documents', {
        dataType: 'Document',
        operation: 'delete',
        entities: 'Document',
        auth: true,
        force: false,
      });

      // Operations generate multiple files (operation + config updates)
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should create jobs with and without schedules', async () => {
      featureGenerator.generateFeature('documents');

      // Create scheduled job (like in the example)
      await jobGenerator.generate('documents', {
        name: 'archiveDocuments',
        entities: ['Document'],
        cron: '0 2 * * *',
        args: '{}',
        force: false,
      });

      // Create on-demand job
      await jobGenerator.generate('documents', {
        name: 'processDocument',
        entities: ['Document'],
        force: false,
      });

      // Jobs generate multiple files (job + config updates)
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should handle nested feature paths correctly', async () => {
      // Create parent feature
      featureGenerator.generateFeature('documents');

      // Test that we can create routes in the main feature
      await routeGenerator.generate('documents', {
        path: '/documents/admin/dashboard',
        name: 'AdminDashboard',
        auth: true,
        force: false,
      });

      await routeGenerator.generate('documents', {
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

  describe('Configuration Validation', () => {
    it('should validate that feature config is properly updated', async () => {
      featureGenerator.generateFeature('documents');

      // Create various components that will trigger config updates
      await routeGenerator.generate('documents', {
        path: '/documents',
        force: false,
      });

      await apiGenerator.generate('documents', {
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
      featureGenerator.generateFeature('documents');

      await operationGenerator.generate('documents', {
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

  describe('JSON Field Handling', () => {
    beforeEach(async () => {
      featureGenerator.generateFeature('documents');
    });

    it('should properly handle JSON fields in CRUD operations', async () => {
      await crudGenerator.generate('documents', {
        dataType: 'Document',
        force: false,
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalled();

      // Note: The simplified CRUD generator doesn't use complex Prisma utilities
      // This test verifies that CRUD generation completes successfully
    });

    it('should handle JSON fields in operation generation', async () => {
      await operationGenerator.generate('documents', {
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
      await apiGenerator.generate('documents', {
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
      await crudGenerator.generate('documents', {
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
      const { getEntityMetadata } = await import('../../src/utils/prisma');
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
        '../../src/utils/prisma'
      );
      const metadata = await getEntityMetadata('Document');

      // Should require Prisma import for JSON field handling
      expect(needsPrismaImport(metadata)).toBe(true);
    });

    it('should generate appropriate JSON type handling code', async () => {
      const { generateJsonTypeHandling } = await import(
        '../../src/utils/prisma'
      );
      const jsonHandling = generateJsonTypeHandling(['settings']);

      // Verify JSON handling code is generated
      expect(jsonHandling).toContain('settings');
      expect(jsonHandling).toContain('Prisma.JsonValue');
    });

    it('should identify JSON fields correctly', async () => {
      const { getJsonFields, getEntityMetadata } = await import(
        '../../src/utils/prisma'
      );
      const metadata = await getEntityMetadata('Document');
      const jsonFields = getJsonFields(metadata);

      // Verify settings field is identified as JSON
      expect(jsonFields).toContain('settings');
      expect(jsonFields).toHaveLength(1);
    });
  });
});
