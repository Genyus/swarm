import type { FileSystem, Logger, SwarmGenerator } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../tests/utils';
import { RouteGenerator } from './route-generator';

// Mock SwarmConfigManager
vi.mock('@ingenyus/swarm', async () => {
  const actual = await vi.importActual('@ingenyus/swarm');
  return {
    ...actual,
    SwarmConfigManager: vi.fn().mockImplementation(() => ({
      loadConfig: vi.fn().mockResolvedValue({
        templateDirectory: '.swarm/templates',
        plugins: {
          wasp: {
            enabled: true,
            plugin: 'wasp',
          },
        },
      }),
    })),
  };
});

describe('RouteGenerator', () => {
  let fs: FileSystem;
  let logger: Logger;
  let featureGen: SwarmGenerator<{ path: string }>;
  let gen: RouteGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen();
    gen = new RouteGenerator(logger, fs, featureGen);
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
    gen = new RouteGenerator(logger, fs, featureGen);

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
      expect.stringContaining('foo.wasp.ts'),
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
