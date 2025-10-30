import type { FileSystem, Generator, Logger } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../tests/utils';
import { schema as featureSchema } from '../feature/schema';
import { ActionGenerator } from './action-generator';

vi.mock('../../common', async () => {
  const actual = await vi.importActual('../../common');
  return {
    ...actual,
    getEntityMetadata: vi.fn(),
    getIdFields: vi.fn(),
    getRequiredFields: vi.fn(),
    getOptionalFields: vi.fn(),
    getJsonFields: vi.fn(),
    needsPrismaImport: vi.fn(),
    generateJsonTypeHandling: vi.fn(),
    generatePickType: vi.fn(),
    generateOmitType: vi.fn(),
    generatePartialType: vi.fn(),
    generateIntersectionType: vi.fn(),
    normaliseFeaturePath: vi.fn((path) => path),
    getFeatureDir: vi.fn((fs, path) => `/test-project/src/features/${path}`),
    getFeatureImportPath: vi.fn((path) => path),
    ensureDirectoryExists: vi.fn(),
    TemplateUtility: vi.fn().mockImplementation(() => ({
      processTemplate: vi.fn(),
      resolveTemplatePath: vi.fn(),
    })),
  };
});

vi.mock('../../common/prisma', async () => {
  const actual = await vi.importActual('../../common/prisma');
  return {
    ...actual,
    getEntityMetadata: vi.fn(),
    getIdFields: vi.fn(),
    getRequiredFields: vi.fn(),
    getOptionalFields: vi.fn(),
    getJsonFields: vi.fn(),
    needsPrismaImport: vi.fn(),
    generateJsonTypeHandling: vi.fn(),
    generatePickType: vi.fn(),
    generateOmitType: vi.fn(),
    generatePartialType: vi.fn(),
    generateIntersectionType: vi.fn(),
  };
});

describe('ActionGenerator', () => {
  let fs: FileSystem;
  let logger: Logger;
  let featureGen: Generator<typeof featureSchema>;
  let gen: ActionGenerator;

  beforeEach(async () => {
    const {
      getEntityMetadata,
      getIdFields,
      getRequiredFields,
      getOptionalFields,
      getJsonFields,
      needsPrismaImport,
      generateJsonTypeHandling,
      generatePickType,
      generateOmitType,
      generatePartialType,
      generateIntersectionType,
    } = await import('../../common');

    (getEntityMetadata as any).mockResolvedValue({
      name: 'User',
      fields: [
        {
          name: 'id',
          type: 'Int',
          tsType: 'number',
          isId: true,
          isRequired: true,
          hasDefaultValue: true,
        },
        { name: 'email', type: 'String', tsType: 'string', isRequired: true },
        { name: 'name', type: 'String', tsType: 'string', isRequired: false },
      ],
    });
    (getIdFields as any).mockReturnValue(['id']);
    (getRequiredFields as any).mockReturnValue(['email']);
    (getOptionalFields as any).mockReturnValue(['name']);
    (getJsonFields as any).mockReturnValue([]);
    (needsPrismaImport as any).mockReturnValue(false);
    (generateJsonTypeHandling as any).mockReturnValue('');
    (generatePickType as any).mockImplementation(
      (modelName: string, fields: string[]) =>
        fields.length
          ? `Pick<${modelName}, ${fields.map((f) => `"${f}"`).join(' | ')}>`
          : ''
    );
    (generateOmitType as any).mockImplementation(
      (modelName: string, fields: string[]) =>
        fields.length
          ? `Omit<${modelName}, ${fields.map((f) => `"${f}"`).join(' | ')}>`
          : modelName
    );
    (generatePartialType as any).mockImplementation((typeString: string) =>
      typeString ? `Partial<${typeString}>` : ''
    );
    (generateIntersectionType as any).mockImplementation(
      (type1: string, type2: string) => {
        if (!type1 && !type2) return '';
        if (!type1) return type2;
        if (!type2) return type1;
        return `${type1} & ${type2}`;
      }
    );

    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen(featureSchema);
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
      if (typeof path === 'string' && path.endsWith('.wasp.ts')) {
        return `import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
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
        if (
          templatePath.includes('/config/') &&
          templatePath.includes('operation.eta')
        ) {
          return `    .addAction(feature, "${replacements.operationName}", {
      entities: [],
      auth: false,
    })`;
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
      entities: ['User'],
      force: true,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    // The WaspBaseGenerator uses its own configGenerator instead of updateFeatureConfig
    // So we expect the config file to be written directly
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('feature.wasp.ts'),
      expect.any(String)
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
      if (typeof path === 'string' && path.endsWith('.wasp.ts')) {
        return `import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
}`;
      }
      return 'export const <%=operationName%> = async (args: any) => { return {}; }';
    });
    fs.writeFileSync = vi.fn();

    gen = new ActionGenerator(logger, fs, featureGen);

    (gen as any).templateUtility = {
      processTemplate: vi.fn((templatePath, replacements) => {
        // Config template
        if (
          templatePath.includes('/config/') &&
          templatePath.includes('operation.eta')
        ) {
          return `    .addAction(feature, "${replacements.operationName}", {
      entities: [],
      auth: false,
    })`;
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
      entities: ['User'],
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
      if (typeof path === 'string' && path.endsWith('.wasp.ts')) {
        return `import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
}`;
      }
      return 'export const <%=operationName%> = async (args: any) => { return {}; }';
    });
    fs.writeFileSync = vi.fn();

    gen = new ActionGenerator(logger, fs, featureGen);

    (gen as any).templateUtility = {
      processTemplate: vi.fn((templatePath, replacements) => {
        // Config template
        if (
          templatePath.includes('/config/') &&
          templatePath.includes('operation.eta')
        ) {
          return `    .addAction(feature, "${replacements.operationName}", {
      entities: [],
      auth: false,
    })`;
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
      entities: ['User'],
      force: true,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('automatically includes dataType in entities array when not specified', async () => {
    const { getEntityMetadata } = await import('../../common/prisma');
    (getEntityMetadata as any).mockResolvedValue({
      name: 'Task',
      fields: [
        {
          name: 'id',
          type: 'Int',
          tsType: 'number',
          isId: true,
          isRequired: true,
          hasDefaultValue: true,
        },
        { name: 'name', type: 'String', tsType: 'string', isRequired: true },
      ],
    });

    fs.existsSync = vi.fn((p) => {
      if (typeof p === 'string' && p.endsWith('.wasp.ts')) return true;
      if (typeof p === 'string' && p.endsWith('.ts')) return false;
      if (typeof p === 'string' && p.includes('actions')) return false;
      if (typeof p === 'string' && p.includes('schema.prisma')) return true;
      return true;
    });
    fs.mkdirSync = vi.fn();
    fs.readFileSync = vi.fn((path) => {
      if (typeof path === 'string' && path.endsWith('.wasp.ts')) {
        return `import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
}`;
      }
      return 'export const <%=operationName%> = async (args: any) => { return {}; }';
    });
    fs.writeFileSync = vi.fn();

    const testGen = new ActionGenerator(logger, fs, featureGen);

    const mockProcessTemplate = vi.fn((templatePath, replacements) => {
      if (
        templatePath.includes('/config/') &&
        templatePath.includes('operation.eta')
      ) {
        return `    .addAction(feature, "${replacements.operationName}", {
      entities: ${replacements.entities},
      auth: false,
    })`;
      }
      return `export const ${replacements.operationName || 'unknownOperation'} = async (args: any) => { return {}; }`;
    });

    (testGen as any).templateUtility = {
      processTemplate: mockProcessTemplate,
      resolveTemplatePath: vi.fn(
        (templateName, _generatorName, _currentFileUrl) => {
          if (templateName === 'operation.eta') {
            return `/mock/templates/config/operation.eta`;
          }
          return `/mock/templates/action/templates/create.eta`;
        }
      ),
    };

    await testGen.generate({
      feature: 'tasks',
      dataType: 'Task',
      operation: 'create',
      force: true,
    });

    expect(mockProcessTemplate).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        entities: '"Task"',
      })
    );
  });

  it('prevents duplicate dataType in entities array', async () => {
    const { getEntityMetadata } = await import('../../common');
    (getEntityMetadata as any).mockResolvedValue({
      name: 'Task',
      fields: [
        {
          name: 'id',
          type: 'Int',
          tsType: 'number',
          isId: true,
          isRequired: true,
          hasDefaultValue: true,
        },
        { name: 'name', type: 'String', tsType: 'string', isRequired: true },
      ],
    });

    fs.existsSync = vi.fn((p) => {
      if (typeof p === 'string' && p.endsWith('.wasp.ts')) return true;
      if (typeof p === 'string' && p.endsWith('.ts')) return false;
      if (typeof p === 'string' && p.includes('actions')) return false;
      if (typeof p === 'string' && p.includes('schema.prisma')) return true;
      return true;
    });
    fs.mkdirSync = vi.fn();
    fs.readFileSync = vi.fn((path) => {
      if (typeof path === 'string' && path.endsWith('.wasp.ts')) {
        return `import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
}`;
      }
      return 'export const <%=operationName%> = async (args: any) => { return {}; }';
    });
    fs.writeFileSync = vi.fn();

    const testGen = new ActionGenerator(logger, fs, featureGen);

    const mockProcessTemplate = vi.fn((templatePath, replacements) => {
      if (
        templatePath.includes('/config/') &&
        templatePath.includes('operation.eta')
      ) {
        return `    .addAction(feature, "${replacements.operationName}", {
      entities: ${replacements.entities},
      auth: false,
    })`;
      }
      return `export const ${replacements.operationName || 'unknownOperation'} = async (args: any) => { return {}; }`;
    });

    (testGen as any).templateUtility = {
      processTemplate: mockProcessTemplate,
      resolveTemplatePath: vi.fn(
        (templateName, _generatorName, _currentFileUrl) => {
          if (templateName === 'operation.eta') {
            return `/mock/templates/config/operation.eta`;
          }
          return `/mock/templates/action/templates/create.eta`;
        }
      ),
    };

    await testGen.generate({
      feature: 'tasks',
      dataType: 'Task',
      operation: 'create',
      entities: ['Task'],
      force: true,
    });

    expect(mockProcessTemplate).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        entities: '"Task"',
      })
    );
  });

  it('places dataType first in entities array with other entities', async () => {
    const { getEntityMetadata } = await import('../../common');
    (getEntityMetadata as any).mockResolvedValue({
      name: 'Task',
      fields: [
        {
          name: 'id',
          type: 'Int',
          tsType: 'number',
          isId: true,
          isRequired: true,
          hasDefaultValue: true,
        },
        { name: 'name', type: 'String', tsType: 'string', isRequired: true },
      ],
    });

    fs.existsSync = vi.fn((p) => {
      if (typeof p === 'string' && p.endsWith('.wasp.ts')) return true;
      if (typeof p === 'string' && p.endsWith('.ts')) return false;
      if (typeof p === 'string' && p.includes('actions')) return false;
      if (typeof p === 'string' && p.includes('schema.prisma')) return true;
      return true;
    });
    fs.mkdirSync = vi.fn();
    fs.readFileSync = vi.fn((path) => {
      if (typeof path === 'string' && path.endsWith('.wasp.ts')) {
        return `import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
}`;
      }
      return 'export const <%=operationName%> = async (args: any) => { return {}; }';
    });
    fs.writeFileSync = vi.fn();

    const testGen = new ActionGenerator(logger, fs, featureGen);

    const mockProcessTemplate = vi.fn((templatePath, replacements) => {
      if (
        templatePath.includes('/config/') &&
        templatePath.includes('operation.eta')
      ) {
        return `    .addAction(feature, "${replacements.operationName}", {
      entities: ${replacements.entities},
      auth: false,
    })`;
      }
      return `export const ${replacements.operationName || 'unknownOperation'} = async (args: any) => { return {}; }`;
    });

    (testGen as any).templateUtility = {
      processTemplate: mockProcessTemplate,
      resolveTemplatePath: vi.fn(
        (templateName, _generatorName, _currentFileUrl) => {
          if (templateName === 'operation.eta') {
            return `/mock/templates/config/operation.eta`;
          }
          return `/mock/templates/action/templates/create.eta`;
        }
      ),
    };

    await testGen.generate({
      feature: 'tasks',
      dataType: 'Task',
      operation: 'create',
      entities: ['User', 'Product'],
      force: true,
    });

    expect(mockProcessTemplate).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        entities: '"Task", "User", "Product"',
      })
    );
  });
});
