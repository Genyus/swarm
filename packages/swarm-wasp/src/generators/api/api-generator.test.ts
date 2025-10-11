import type { FileSystem, Logger, SwarmGenerator } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../tests/utils';
import { ApiGenerator } from './api-generator';

describe('ApiGenerator', () => {
  let fs: FileSystem;
  let logger: Logger;
  let featureGen: SwarmGenerator<{ path: string }>;
  let gen: ApiGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen();
    gen = new ApiGenerator(logger, fs, featureGen);
  });

  it('generate writes handler and updates config', async () => {
    // Mock existsSync to return true for all paths (including config files)
    fs.existsSync = vi.fn(() => true);
    fs.readFileSync = vi.fn(() => 'template');
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
      route: '/api',
      force: true,
      entities: ['User'],
      auth: true,
      customMiddleware: false,
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

  it('getConfigDefinition returns processed template', () => {
    // Mock the template utility
    (gen as any).templateUtility = {
      processTemplate: vi.fn(() => 'app.addApi("testApi", { method: "GET" });'),
      resolveTemplatePath: vi.fn(
        (templateName) => `/mock/templates/${templateName}`
      ),
    };

    const result = (gen as any).getConfigDefinition(
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
