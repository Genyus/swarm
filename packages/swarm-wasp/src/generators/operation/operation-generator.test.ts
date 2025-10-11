import type { FileSystem, Logger, SwarmGenerator } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../tests/utils';
import { OperationGenerator } from './operation-generator';

// Mock the fs module at the module level
vi.mock('node:fs', () => ({
  readFileSync: vi.fn(
    () => `model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}`
  ),
}));

describe('OperationGenerator', () => {
  let fs: FileSystem;
  let logger: Logger;
  let featureGen: SwarmGenerator<{ path: string }>;
  let gen: OperationGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen();
    gen = new OperationGenerator(logger, fs, featureGen);
  });

  it('generate writes operation file and updates config', async () => {
    fs.existsSync = vi.fn((p) => {
      if (typeof p === 'string' && p.endsWith('.wasp.ts')) return true; // config file exists
      if (typeof p === 'string' && p.endsWith('.ts')) return false; // operation file does not exist
      if (typeof p === 'string' && p.includes('operations')) return false; // operation dir does not exist
      if (typeof p === 'string' && p.includes('schema.prisma')) return true; // Prisma schema exists
      return true; // all others exist
    });
    fs.readFileSync = vi.fn((path) => {
      if (typeof path === 'string' && path.includes('schema.prisma')) {
        return `model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}`;
      }
      return 'export const <%=operationName%> = async (args: any) => { return {}; }';
    });
    fs.writeFileSync = vi.fn();
    fs.copyFileSync = vi.fn();
    fs.mkdirSync = vi.fn();

    // Create generator after setting up mocks
    gen = new OperationGenerator(logger, fs, featureGen);

    // Mock the template utility to return a simple template
    (gen as any).templateUtility = {
      processTemplate: vi.fn((templatePath, replacements) => {
        if (templatePath.includes('operation.eta')) {
          return `app.addAction("${replacements.operationName}", {
  handler: "${replacements.importPath}"
});`;
        }
        return `// Generated operation template for ${replacements.operationName || 'unknown'}`;
      }),
      resolveTemplatePath: vi.fn(
        (templateName, generatorName, currentFileUrl) => {
          return `/mock/templates/${generatorName}/templates/${templateName}`;
        }
      ),
    };

    await gen.generate({
      feature: 'foo',
      dataType: 'User',
      operation: 'get',
      entities: 'User',
      force: true,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    // The WaspBaseGenerator uses its own configGenerator instead of updateFeatureConfig
    // So we expect the config file to be written directly
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('foo.wasp.ts'),
      expect.any(String),
      'utf8'
    );
  });

  it('OperationGenerator > generate writes operation file and updates config', async () => {
    fs.existsSync = vi.fn((p) => {
      if (typeof p === 'string' && p.endsWith('.wasp.ts')) return true; // config file exists
      if (typeof p === 'string' && p.endsWith('.ts')) return false; // operation file does not exist
      if (typeof p === 'string' && p.includes('operations')) return false; // operation dir does not exist
      if (typeof p === 'string' && p.includes('schema.prisma')) return true; // Prisma schema exists
      return true; // all others exist
    });
    fs.mkdirSync = vi.fn();
    fs.readFileSync = vi.fn((path) => {
      if (typeof path === 'string' && path.includes('schema.prisma')) {
        return `model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}`;
      }
      return 'export const <%=operationName%> = async (args: any) => { return {}; }';
    });
    fs.writeFileSync = vi.fn();

    // Create generator after setting up mocks
    gen = new OperationGenerator(logger, fs, featureGen);

    // Mock the template utility to return a simple template
    (gen as any).templateUtility = {
      processTemplate: vi.fn((templatePath, replacements) => {
        if (templatePath.includes('operation.eta')) {
          return `app.addAction("${replacements.operationName}", {
  handler: "${replacements.importPath}"
});`;
        }
        return `// Generated operation template for ${replacements.operationName || 'unknown'}`;
      }),
      resolveTemplatePath: vi.fn(
        (templateName, generatorName, currentFileUrl) => {
          return `/mock/templates/${generatorName}/templates/${templateName}`;
        }
      ),
    };

    await gen.generate({
      feature: 'bar',
      dataType: 'User',
      operation: 'get',
      entities: 'User',
      force: true,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('getDefinition returns processed template', () => {
    // Mock the template utility
    (gen as any).templateUtility = {
      processTemplate: vi.fn(() => 'app.addQuery("testOperation", { fn: import("...") });'),
      resolveTemplatePath: vi.fn((templateName) => `/mock/templates/${templateName}`),
    };

    const result = gen.getDefinition(
      'testOperation',
      'test',
      ['User'],
      'query',
      'features/test/server/queries/testOperation'
    );
    expect(typeof result).toBe('string');
  });
});
