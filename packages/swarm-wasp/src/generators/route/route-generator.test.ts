import type { FileSystem, Generator } from '@ingenyus/swarm';
import { DEFAULT_CUSTOM_TEMPLATES_DIR } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createTestGenerator,
} from '../../../tests/utils';
import { schema as featureSchema } from '../feature/schema';
import { RouteGenerator } from './route-generator';
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

describe('RouteGenerator', () => {
  let fs: FileSystem;
  let featureGen: Generator<typeof featureSchema>;
  let gen: RouteGenerator;

  beforeEach(async () => {
    fs = createMockFS();
    featureGen = createMockFeatureGen(featureSchema);
    gen = await createTestGenerator(RouteGenerator, schema, {
      fileSystem: fs,
    });
  });

  it('generate writes route file and updates config', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.readFileSync = vi.fn((path) => {
      if (typeof path === 'string' && path.endsWith('.wasp.ts')) {
        return `import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
}`;
      }
      return 'import React from "react";\n\nexport const <%=componentName%> = () => {\n  return (\n    <div className="container mx-auto px-4 py-8">\n      <h1 className="text-2xl font-bold mb-4"><%=displayName%></h1>\n      {/* TODO: Add page content */}\n    </div>\n  );\n};';
    });
    fs.writeFileSync = vi.fn();

    // Create generator after setting up mocks
    gen = await createTestGenerator(RouteGenerator, schema, {
      fileSystem: fs,
    });

    // Mock the template utility to return a simple template
    (gen as any).templateUtility = {
      processTemplate: vi.fn((templatePath, replacements) => {
        if (templatePath.includes('route.eta')) {
          return `app.addPage("${replacements.routeName}", {
  path: "${replacements.routePath}",
  component: "${replacements.componentName}"
});`;
        }
        return `// Generated route template for ${replacements.componentName || 'unknown'}`;
      }),
      resolveTemplatePath: vi.fn(
        (templateName, generatorName, currentFileUrl) => {
          return `/mock/templates/${generatorName}/templates/${templateName}`;
        }
      ),
    };

    await gen.generate({
      feature: 'foo',
      name: 'route',
      path: '/foo',
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

  it('getDefinition returns processed template', () => {
    // Mock the template utility
    (gen as any).templateUtility = {
      processTemplate: vi.fn(
        () => 'app.addRoute("testRoute", { path: "/test", component: "test" });'
      ),
      resolveTemplatePath: vi.fn(
        (templateName) => `/mock/templates/${templateName}`
      ),
    };

    const result = gen.getDefinition('testRoute', '/test', 'test', false);
    expect(typeof result).toBe('string');
  });
});
