import type { FileSystem, Generator } from '@ingenyus/swarm';
import { DEFAULT_CUSTOM_TEMPLATES_DIR } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createTestGenerator,
} from '../../../tests/utils';
import { schema as featureSchema } from '../feature/schema';
import { ApiGenerator } from './api-generator';
import { schema } from './schema';

// Mock getConfigManager
vi.mock('@ingenyus/swarm', async () => {
  const actual = await vi.importActual('@ingenyus/swarm');
  return {
    ...actual,
    getConfigManager: vi.fn().mockImplementation(() => ({
      loadConfig: vi.fn().mockResolvedValue({
        templateDirectory: DEFAULT_CUSTOM_TEMPLATES_DIR,
        plugins: [
          {
            from: '@ingenyus/swarm-wasp',
            import: 'wasp',
          },
        ],
      }),
    })),
  };
});

describe('ApiGenerator', () => {
  let fs: FileSystem;
  let featureGen: Generator<typeof featureSchema>;
  let gen: ApiGenerator;

  beforeEach(async () => {
    fs = createMockFS();
    featureGen = createMockFeatureGen(featureSchema);
    gen = await createTestGenerator(ApiGenerator, schema, {
      fileSystem: fs,
    });
  });

  it('generate writes handler and updates config', async () => {
    // Mock existsSync to return true for all paths (including config files)
    fs.existsSync = vi.fn(() => true);
    fs.readFileSync = vi.fn((path) => {
      if (typeof path === 'string' && path.endsWith('.wasp.ts')) {
        return `import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
}`;
      }
      return 'template';
    });
    fs.writeFileSync = vi.fn();

    // Mock the template utility to return proper templates
    (gen as any).templateUtility = {
      processTemplate: vi.fn((templatePath, replacements) => {
        // Return different content based on the template path
        if (templatePath.includes('config/api.eta')) {
          // Return a valid config definition that can be parsed
          return `app.addApi("${replacements.apiName}", {
  method: ${replacements.method},
  route: "${replacements.route}",
  handler: "${replacements.importPath}"
});`;
        }
        // Default API handler template
        return `// Generated API handler for ${replacements.apiName || 'unknown'}`;
      }),
      resolveTemplatePath: vi.fn(
        (templateName) => `/mock/templates/${templateName}`
      ),
    };

    await gen.generate({
      feature: 'foo',
      name: 'api',
      method: 'GET',
      path: '/api',
      force: true,
      entities: ['User'],
      auth: true,
      customMiddleware: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    // The WaspBaseGenerator uses its own configGenerator instead of updateFeatureConfig
    // So we expect the config file to be written directly
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('feature.wasp.ts'),
      expect.any(String)
    );
  });

  it('generate writes middleware file when customMiddleware is true', async () => {
    // Mock existsSync to return true for config files, false for middleware directory
    fs.existsSync = vi.fn((path) => {
      if (typeof path === 'string' && path.includes('middleware')) {
        return false; // Middleware directory doesn't exist yet
      }
      return true; // Config files and other paths exist
    });
    fs.readFileSync = vi.fn((path) => {
      if (typeof path === 'string' && path.endsWith('.wasp.ts')) {
        return `import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
}`;
      }
      return 'template';
    });
    fs.writeFileSync = vi.fn();
    fs.mkdirSync = vi.fn();

    // Mock the path methods to return predictable paths
    const mockPathJoin = vi.fn((...args) => args.join('/'));
    const mockPathDirname = vi.fn((path) =>
      path.split('/').slice(0, -1).join('/')
    );
    (gen as any).path = { join: mockPathJoin, dirname: mockPathDirname };

    const mockResolveTemplatePath = vi.fn(
      (templateName) => `/mock/templates/shared/${templateName}`
    );
    const mockProcessTemplate = vi.fn((templatePath, replacements) => {
      if (templatePath.includes('middleware.eta')) {
        return `// Generated middleware template for ${replacements.name || 'unknown'}`;
      } else if (templatePath.includes('config/api.eta')) {
        return `app.addApi("${replacements.apiName}", {
  method: ${replacements.method},
  route: "${replacements.route}",
  handler: "${replacements.importPath}"
});`;
      }
      // Default API handler template
      return `// Generated API handler for ${replacements.apiName || 'unknown'}`;
    });

    // Mock the template utility
    (gen as any).templateUtility = {
      processTemplate: mockProcessTemplate,
      resolveTemplatePath: mockResolveTemplatePath,
    };

    await gen.generate({
      feature: 'foo',
      name: 'testApi',
      method: 'GET',
      path: '/api',
      force: true,
      entities: ['User'],
      auth: true,
      customMiddleware: true,
    });

    // Verify middleware directory was created
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('middleware'),
      expect.objectContaining({ recursive: true })
    );

    // Verify middleware file was written
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('middleware/testApi.ts'),
      expect.stringContaining('Generated middleware template for testApi')
    );

    // Verify resolveTemplatePath was called with correct middleware template path
    expect(mockResolveTemplatePath).toHaveBeenCalledWith(
      'middleware/middleware.eta',
      'shared',
      expect.any(String) // import.meta.url
    );

    // Verify processTemplate was called with middleware template
    expect(mockProcessTemplate).toHaveBeenCalledWith(
      expect.stringContaining('middleware.eta'),
      expect.objectContaining({ name: 'testApi' })
    );
  });

  it('generate does not write middleware file when customMiddleware is false', async () => {
    // Mock existsSync to return true for all paths (including config files)
    fs.existsSync = vi.fn(() => true);
    fs.readFileSync = vi.fn((path) => {
      if (typeof path === 'string' && path.endsWith('.wasp.ts')) {
        return `import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
}`;
      }
      return 'template';
    });
    fs.writeFileSync = vi.fn();
    fs.mkdirSync = vi.fn();

    // Mock the path methods
    const mockPathJoin = vi.fn((...args) => args.join('/'));
    const mockPathDirname = vi.fn((path) =>
      path.split('/').slice(0, -1).join('/')
    );
    (gen as any).path = { join: mockPathJoin, dirname: mockPathDirname };

    const mockResolveTemplatePath = vi.fn(
      (templateName) => `/mock/templates/${templateName}`
    );

    // Mock the template utility
    (gen as any).templateUtility = {
      processTemplate: vi.fn((templatePath, replacements) => {
        if (templatePath.includes('config/api.eta')) {
          return `app.addApi("${replacements.apiName}", {
  method: ${replacements.method},
  route: "${replacements.route}",
  handler: "${replacements.importPath}"
});`;
        }
        return `// Generated API handler for ${replacements.apiName || 'unknown'}`;
      }),
      resolveTemplatePath: mockResolveTemplatePath,
    };

    await gen.generate({
      feature: 'foo',
      name: 'testApi',
      method: 'GET',
      path: '/api',
      force: true,
      entities: ['User'],
      auth: true,
      customMiddleware: false,
    });

    // Verify middleware directory was NOT created
    expect(fs.mkdirSync).not.toHaveBeenCalledWith(
      expect.stringContaining('middleware'),
      expect.any(Object)
    );

    // Verify resolveTemplatePath was NOT called with middleware template
    expect(mockResolveTemplatePath).not.toHaveBeenCalledWith(
      'middleware/middleware.eta',
      'shared',
      expect.any(String)
    );

    // Verify middleware file was NOT written
    const writeCalls = (fs.writeFileSync as any).mock.calls;
    const middlewareWriteCalls = writeCalls.filter((call: any[]) =>
      call[0]?.includes('middleware')
    );
    expect(middlewareWriteCalls).toHaveLength(0);
  });

  it('getConfigDefinition returns processed template', async () => {
    // Mock the template utility
    (gen as any).templateUtility = {
      processTemplate: vi.fn(() => 'app.addApi("testApi", { method: "GET" });'),
      resolveTemplatePath: vi.fn(
        (templateName) => `/mock/templates/${templateName}`
      ),
    };

    // Mock the getTemplatePathWithOverride method
    (gen as any).getTemplatePathWithOverride = vi.fn(() =>
      Promise.resolve('/mock/templates/config/api.eta')
    );

    const result = await (gen as any).getConfigDefinition(
      'testApi',
      'test',
      ['User'],
      'GET',
      '/api/test',
      'features/test/server/apis/test',
      false,
      'features/test/server/apis/test'
    );
    expect(typeof result).toBe('string');
  });
});
