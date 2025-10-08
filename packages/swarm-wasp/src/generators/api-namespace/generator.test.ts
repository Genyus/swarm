import type { IFileSystem, Logger } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../tests/utils';
import type { IFeatureDirectoryGenerator } from '../../interfaces/feature-directory-generator';
import { ApiNamespaceGenerator } from './generator';

describe('ApiNamespaceGenerator', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGen: IFeatureDirectoryGenerator;
  let gen: ApiNamespaceGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen();
    gen = new ApiNamespaceGenerator(logger, fs, featureGen);
  });

  it('generate writes middleware file and updates config', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.readFileSync = vi.fn(() => 'template');
    fs.writeFileSync = vi.fn();

    // Mock the path methods to return predictable paths
    const mockPathJoin = vi.fn((...args) => args.join('/'));
    const mockPathDirname = vi.fn((path) =>
      path.split('/').slice(0, -1).join('/')
    );
    (gen as any).path = { join: mockPathJoin, dirname: mockPathDirname };

    // Mock the getTemplatePath method to return a predictable path
    const mockGetTemplatePath = vi.fn((templateName) => {
      return `/mock/templates/${templateName}`;
    });
    (gen as any).getTemplatePath = mockGetTemplatePath;

    // Mock the template utility to return a simple template
    (gen as any).templateUtility = {
      processTemplate: vi.fn((templatePath, replacements) => {
        if (templatePath.includes('middleware.eta')) {
          return `// Generated middleware template for ${replacements.name || 'unknown'}`;
        } else if (templatePath.includes('config/apiNamespace.eta')) {
          return `app.addApiNamespace("${replacements.namespaceName}", {
  middleware: "${replacements.middlewareImportPath}",
  path: "${replacements.pathValue}"
});`;
        }
        return `// Generated template for ${replacements.name || 'unknown'}`;
      }),
    };

    // Mock the getDefinition method to return a proper config definition
    const mockGetDefinition = vi.fn(() => {
      return `app.addApiNamespace("ns", {
  middleware: "features/foo/server/middleware/ns",
  path: "/api"
});`;
    });
    (gen as any).getDefinition = mockGetDefinition;

    await gen.generate({
      featurePath: 'foo',
      flags: { name: 'ns', path: '/api', force: true },
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

  it('getDefinition returns processed template', () => {
    const result = gen.getDefinition(
      'testNamespace',
      'features/test/server/middleware/testMiddleware',
      '/api/test'
    );
    expect(typeof result).toBe('string');
  });
});
