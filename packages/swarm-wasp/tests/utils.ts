import type { ExtendedSchema, FileSystem, Logger, SwarmGenerator } from '@ingenyus/swarm-core';
import { Stats } from 'node:fs';
import { vi } from 'vitest';

// Mock the filesystem utility functions separately
vi.mock('@ingenyus/swarm-core/utils/filesystem', () => ({
  getTemplatesDir: vi.fn().mockReturnValue('/mock/templates'),
  findWaspRoot: vi
    .fn()
    .mockImplementation((_fileSystem: FileSystem, _startDir?: string) => {
      // Mock implementation that doesn't use the passed parameters
      return '/mock/wasp-root';
    }),
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
  ensureDirectoryExists: vi.fn().mockImplementation((_fs: FileSystem, _path: string) => {
    // Mock implementation that doesn't actually create directories
    return true;
  }),
  getFeatureImportPath: vi
    .fn()
    .mockImplementation((path: string) => `@features/${path}`),
}));

vi.mock('@ingenyus/swarm-core', () => ({
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

// Mock the TemplateUtility from the local utils
vi.mock('../src/utils/templates', () => ({
  TemplateUtility: vi.fn().mockImplementation((fileSystem: FileSystem) => ({
    processTemplate: vi.fn(
      (templatePath: string, replacements: Record<string, unknown>) => {
        // Get the template content from the mock filesystem
        const templateContent = fileSystem.readFileSync(templatePath, 'utf8');

        // Simple template processing - replace placeholders
        let processedContent = templateContent as string;
        Object.keys(replacements).forEach((key) => {
          const placeholder = `<%=${key}%>`;
          processedContent = processedContent.replace(
            new RegExp(placeholder, 'g'),
            String(replacements[key])
          );
        });

        return processedContent;
      }
    ),
    resolveTemplatePath: vi.fn(
      (templateName: string, generatorName: string, _currentFileUrl: string) => {
        // Mock implementation that returns a predictable path
        const basePath = '/Users/gary/Dev/swarm/packages/swarm-wasp/src/generators';
        return `${basePath}/${generatorName}/templates/${templateName}`;
      }
    ),
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
}

model User {
  id    Int    @id @default(autoincrement())
  tasks Task[]
}`;
      }
      if (path.endsWith('package.json')) {
        return `{
  "name": "swarm-wasp",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@wasp/entities": "workspace:*"
  }
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
  readFileSync: vi.fn((path: string) => {
    if (path.endsWith('schema.prisma')) {
      return `model Document {
  id        String   @id @default(cuid())
  title     String
  content   String?
  settings  Json     @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model User {
  id    Int    @id @default(autoincrement())
  tasks Task[]
}`;
    }
    if (path.endsWith('package.json')) {
      return `{
  "name": "swarm-wasp",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@wasp/entities": "workspace:*"
  }
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
}));

// Mock the prisma utilities at the module level
vi.mock('@ingenyus/swarm-core', async () => {
  const actual = await vi.importActual<typeof import('@ingenyus/swarm-core')>('@ingenyus/swarm-core');
  return {
    ...actual,
    getTemplatesDir: vi.fn().mockReturnValue('/mock/templates'),
    findWaspRoot: vi
      .fn()
      .mockImplementation((_fileSystem: FileSystem, _startDir?: string) => {
        // Mock implementation that doesn't use the passed parameters
        return '/mock/wasp-root';
      }),
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

interface TestSetup {
  fs: FileSystem;
  logger: Logger;
  mockFiles: Record<string, string>;
  fileCallCounts: Record<string, number>;
}

function createMockFilesystem(
  mockFiles: Record<string, string>
): FileSystem {
  // Add mock template files for each generator
  const basePath = '/Users/gary/Dev/swarm/packages/swarm-wasp/src/generators';

  // CRUD templates
  mockFiles[`${basePath}/crud/templates/crud.eta`] = `
import { <%=dataType%> } from '@wasp/entities';
import { HttpError } from '@wasp/core';

export const <%=crudName%> = {
  <%=operations%>
};
`;

  mockFiles[`${basePath}/crud/templates/config/crud.eta`] = `
<%=crudName%>: {
  <%=operations%>
},
`;

  // Job templates
  mockFiles[`${basePath}/job/templates/job.eta`] = `
import { <%=jobName%> } from '@wasp/entities';

export const <%=jobName%> = async (args: any) => {
  // Job implementation
};
`;

  mockFiles[`${basePath}/job/templates/config/job.eta`] = `
<%=jobName%>: {
  executor: {
    fn: import('<%=importPath%>'),
    args: <%=args%>
  }<%=schedule%>
},
`;

  // Route templates
  mockFiles[`${basePath}/route/templates/page.eta`] = `
import React from 'react';

export default function <%=componentName%>() {
  return (
    <div>
      <h1><%=componentName%></h1>
    </div>
  );
}
`;

  mockFiles[`${basePath}/route/templates/config/route.eta`] = `
<%=routeName%>: {
  path: '<%=routePath%>',
  to: <%=componentName%><%=authRequired%>
},
`;

  // API templates
  mockFiles[`${basePath}/api/templates/api.eta`] = `
import { HttpError } from '@wasp/core';

export const <%=apiName%> = async (args: any) => {
  // API implementation
};
`;

  mockFiles[`${basePath}/api/templates/config/api.eta`] = `
<%=apiName%>: {
  fn: import('<%=importPath%>'),
  httpRoute: {
    path: '<%=path%>',
    method: '<%=method%>'<%=authRequired%>
  }
},
`;

  // Operation templates
  mockFiles[`${basePath}/operation/templates/create.eta`] = `
import { <%=dataType%> } from '@wasp/entities';

export const <%=operationName%> = async (args: any) => {
  // Create operation
};
`;

  mockFiles[`${basePath}/operation/templates/config/operation.eta`] = `
<%=operationName%>: {
  fn: import('<%=importPath%>')<%=authRequired%>
},
`;

  // API Namespace templates
  mockFiles[`${basePath}/api-namespace/templates/middleware.eta`] = `
export const <%=namespaceName%> = (req: any, res: any, next: any) => {
  // Middleware implementation
};
`;

  mockFiles[`${basePath}/api-namespace/templates/config/api-namespace.eta`] = `
<%=namespaceName%>: {
  middleware: import('<%=importPath%>'),
  path: '<%=apiPath%>'
},
`;

  // Feature directory template
  mockFiles[`${basePath}/feature-directory/templates/feature.wasp.eta`] = `
export default function getConfig(app: App) {
  return {};
}
`;

  return {
    readFileSync: vi.fn((path: string | Buffer) => {
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
}

model User {
  id    Int    @id @default(autoincrement())
  tasks Task[]
}`;
        }
        // For template files, try to read from the actual filesystem first
        if (path.includes('/generators/') && path.includes('/templates/')) {
          try {
            const fs = require('fs');
            if (fs.existsSync(path)) {
              return fs.readFileSync(path, 'utf8') as string;
            }
          } catch (_e) {
            // Fall back to mock files
          }
        }
        if (mockFiles[path]) {
          return mockFiles[path];
        }
      }
      return 'template content';
    }),
    writeFileSync: vi.fn((path: string | Buffer, content: string) => {
      if (typeof path === 'string') {
        mockFiles[path] = content;
      }
    }),
    existsSync: vi.fn((path: string | Buffer) => {
      if (typeof path === 'string') {
        // Mock .wasproot file to make findWaspRoot work
        if (path.includes('.wasproot')) return true;
        // Template files always exist
        if (path.includes('template')) return true;
        // Mock template files exist
        if (path.startsWith('/mock/templates/')) return true;
        // Generator template files exist
        if (path.includes('/generators/') && path.includes('/templates/'))
          return true;
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
      // Get template content from readFileSync if not in mockFiles
      const templateContent =
        mockFiles[src] ||
        'export default function getConfig(app: App) { return {}; }';
      mockFiles[dest] = templateContent;
    }),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn().mockReturnValue([]),
    statSync: vi.fn().mockReturnValue({
      isDirectory: () => false,
      isFile: () => true,
    } as Stats),
  };
}

export const createPrismaMock = () => ({
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
});

export function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  };
}

/**
 * Creates a simple mock filesystem implementation for testing.
 * This is the original simple version that tests expect to override.
 */
export function createMockFS(): FileSystem {
  return {
    readFileSync: vi.fn(() => '<%=jobName%>'),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(() => true),
    copyFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(() => []),
    statSync: vi.fn(() => ({}) as Stats),
  };
}

/**
 * Creates a mock feature generator implementation for testing.
 */
export function createMockFeatureGen(): SwarmGenerator<{ path: string }> {
  return {
    name: 'mock-feature-gen',
    description: 'Mock feature directory generator',
    schema: {} as ExtendedSchema,
    generate: vi.fn((params: { path: string }) => {
      return Promise.resolve();
    }),
  };
}

export function createTestSetup(): TestSetup {
  const mockFiles: Record<string, string> = {};
  const fileCallCounts: Record<string, number> = {};

  return {
    fs: createMockFilesystem(mockFiles),
    logger: createMockLogger(),
    mockFiles,
    fileCallCounts,
  };
}
