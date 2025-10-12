import type { FileSystem, Logger, SwarmGenerator } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../tests/utils';
import { ActionGenerator } from './action-generator';

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

describe('ActionGenerator', () => {
  let fs: FileSystem;
  let logger: Logger;
  let featureGen: SwarmGenerator<{ path: string }>;
  let gen: ActionGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen();
    gen = new ActionGenerator(logger, fs, featureGen);
  });

  it('generate writes action file and updates config', async () => {
    fs.existsSync = vi.fn((p) => {
      if (typeof p === 'string' && p.endsWith('.wasp.ts')) return true; // config file exists
      if (typeof p === 'string' && p.endsWith('.ts')) return false; // action file does not exist
      if (typeof p === 'string' && p.includes('actions')) return false; // action dir does not exist
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
    gen = new ActionGenerator(logger, fs, featureGen);

    // Mock the template utility to return a simple template
    (gen as any).templateUtility = {
      processTemplate: vi.fn((templatePath, replacements) => {
        // Config template
        if (templatePath.includes('/config/') && templatePath.includes('operation.eta')) {
          return `app.addAction("${replacements.operationName}", {
  handler: "${replacements.importPath}"
});`;
        }
        // Operation template
        return `export const ${replacements.operationName || 'unknownOperation'} = async (args: any) => { return {}; }`;
      }),
      resolveTemplatePath: vi.fn(
        (templateName, _generatorName, _currentFileUrl) => {
          if (templateName === 'operation.eta') {
            return `/mock/templates/config/operation.eta`;
          }
          return `/mock/templates/action/templates/create.eta`;
        }
      ),
    };

    await gen.generate({
      feature: 'foo',
      dataType: 'User',
      operation: 'create',
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

  it('handles update action', async () => {
    fs.existsSync = vi.fn((p) => {
      if (typeof p === 'string' && p.endsWith('.wasp.ts')) return true;
      if (typeof p === 'string' && p.endsWith('.ts')) return false;
      if (typeof p === 'string' && p.includes('actions')) return false;
      if (typeof p === 'string' && p.includes('schema.prisma')) return true;
      return true;
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

    gen = new ActionGenerator(logger, fs, featureGen);

    (gen as any).templateUtility = {
      processTemplate: vi.fn((templatePath, replacements) => {
        // Config template
        if (templatePath.includes('/config/') && templatePath.includes('operation.eta')) {
          return `app.addAction("${replacements.operationName}", {
  handler: "${replacements.importPath}"
});`;
        }
        // Operation template
        return `export const ${replacements.operationName || 'unknownOperation'} = async (args: any) => { return {}; }`;
      }),
      resolveTemplatePath: vi.fn(
        (templateName, _generatorName, _currentFileUrl) => {
          if (templateName === 'operation.eta') {
            return `/mock/templates/config/operation.eta`;
          }
          return `/mock/templates/action/templates/update.eta`;
        }
      ),
    };

    await gen.generate({
      feature: 'bar',
      dataType: 'User',
      operation: 'update',
      entities: 'User',
      force: true,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('handles delete action', async () => {
    fs.existsSync = vi.fn((p) => {
      if (typeof p === 'string' && p.endsWith('.wasp.ts')) return true;
      if (typeof p === 'string' && p.endsWith('.ts')) return false;
      if (typeof p === 'string' && p.includes('actions')) return false;
      if (typeof p === 'string' && p.includes('schema.prisma')) return true;
      return true;
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

    gen = new ActionGenerator(logger, fs, featureGen);

    (gen as any).templateUtility = {
      processTemplate: vi.fn((templatePath, replacements) => {
        // Config template
        if (templatePath.includes('/config/') && templatePath.includes('operation.eta')) {
          return `app.addAction("${replacements.operationName}", {
  handler: "${replacements.importPath}"
});`;
        }
        // Operation template
        return `export const ${replacements.operationName || 'unknownOperation'} = async (args: any) => { return {}; }`;
      }),
      resolveTemplatePath: vi.fn(
        (templateName, _generatorName, _currentFileUrl) => {
          if (templateName === 'operation.eta') {
            return `/mock/templates/config/operation.eta`;
          }
          return `/mock/templates/action/templates/delete.eta`;
        }
      ),
    };

    await gen.generate({
      feature: 'baz',
      dataType: 'User',
      operation: 'delete',
      entities: 'User',
      force: true,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
