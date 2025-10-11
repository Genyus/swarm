import type { IFileSystem, Logger } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../tests/utils';
import { ApiGenerator } from './generator';

describe('ApiGenerator', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGen: Generator<string>;
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

    // Mock the path methods to return predictable paths
    const mockPathJoin = vi.fn((...args) => args.join('/'));
    const mockPathDirname = vi.fn((path) => {
      return path.split('/').slice(0, -1).join('/');
    });
    (gen as any).path = { join: mockPathJoin, dirname: mockPathDirname };

    // Mock the checkConfigExists method to return false
    (gen as any).checkConfigExists = vi.fn(() => false);

    // Mock the getTemplatePath method to return a predictable path
    const mockGetTemplatePath = vi.fn((templateName) => {
      return `/mock/templates/${templateName}`;
    });
    (gen as any).getTemplatePath = mockGetTemplatePath;

    // Mock the template utility to return a simple template
    (gen as any).templateUtility = {
      processTemplate: vi.fn((templatePath, replacements) => {
        // Return different content based on the template path
        if (templatePath.includes('api.eta')) {
          return `// Generated API template for ${replacements.apiName || 'unknown'}`;
        } else if (templatePath.includes('config/templates/api.eta')) {
          // Return a valid config definition that can be parsed
          return `app.addApi("${replacements.apiName}", {
  method: "${replacements.method}",
  route: "${replacements.route}",
  handler: "${replacements.importPath}"
});`;
        }
        return `// Generated template for ${replacements.apiName || 'unknown'}`;
      }),
    };

    // Mock the getConfigDefinition method to return a proper config definition
    const mockGetConfigDefinition = vi.fn(() => {
      return `app.addApi("api", {
  method: "GET",
  route: "/api",
  handler: "@src/features/foo/server/apis/api.ts"
});`;
    });
    (gen as any).getConfigDefinition = mockGetConfigDefinition;

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
