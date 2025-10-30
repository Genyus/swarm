import type { FileSystem, Generator, Logger } from '@ingenyus/swarm';
import { DEFAULT_CUSTOM_TEMPLATES_DIR } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../tests/utils';
import { schema as featureSchema } from '../feature/schema';
import { ApiGenerator } from './api-generator';

// Mock SwarmConfigManager
vi.mock('@ingenyus/swarm', async () => {
  const actual = await vi.importActual('@ingenyus/swarm');
  return {
    ...actual,
    SwarmConfigManager: vi.fn().mockImplementation(() => ({
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
  let logger: Logger;
  let featureGen: Generator<typeof featureSchema>;
  let gen: ApiGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen(featureSchema);
    gen = new ApiGenerator(logger, fs, featureGen);
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
