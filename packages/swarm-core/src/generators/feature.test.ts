import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockFS, createMockLogger } from '../../tests/utils';
import type { IFileSystem } from '../types/filesystem';
import type { Logger } from '../types/logger';
import { FeatureGenerator } from './feature';

// Mock the filesystem utilities
vi.mock('../utils/filesystem', () => ({
  findWaspRoot: vi.fn().mockReturnValue('/mock/wasp/root'),
  getConfigDir: vi.fn().mockReturnValue('/mock/config'),
  getFeatureDir: vi.fn().mockReturnValue('/mock/features/test'),
  getTemplatesDir: vi.fn().mockReturnValue('/mock/templates'),
  copyDirectory: vi.fn(),
  ensureDirectoryExists: vi.fn(),
  getFeatureImportPath: vi.fn().mockReturnValue('test/_core'),
}));

vi.mock('../utils/strings', () => ({
  validateFeaturePath: vi.fn().mockReturnValue(['foo']),
  getPlural: vi.fn().mockImplementation((str: string) => str + 's'),
}));

vi.mock('../utils/templates', () => ({
  TemplateUtility: vi.fn().mockImplementation(() => ({
    processTemplate: vi.fn().mockReturnValue('processed template content'),
    getFileTemplatePath: vi.fn().mockReturnValue('/mock/template/path'),
    getConfigTemplatePath: vi
      .fn()
      .mockReturnValue('/mock/config/template/path'),
  })),
  getFileTemplatePath: vi.fn().mockReturnValue('/mock/template/path'),
  processTemplate: vi.fn().mockReturnValue('processed template content'),
  getConfigTemplatePath: vi.fn().mockReturnValue('/mock/template/path'),
}));

describe('FeatureGenerator', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let gen: FeatureGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    gen = new FeatureGenerator(logger, fs);
  });

  it('getRouteDefinition returns processed template', () => {
    const result = gen.getRouteDefinition(
      'route',
      '/foo',
      'FooPage',
      'foo',
      true
    );
    expect(typeof result).toBe('string');
  });

  it('getOperationDefinition returns processed template', () => {
    const result = gen.getOperationDefinition('op', 'foo', ['Bar'], 'query');
    expect(typeof result).toBe('string');
  });

  it('getJobDefinition returns processed template', () => {
    const result = gen.getJobDefinition(
      'job',
      'worker',
      'file',
      '[]',
      '',
      '',
      '',
      '',
      'queue'
    );
    expect(typeof result).toBe('string');
  });

  it('getApiDefinition returns processed template', () => {
    const result = gen.getApiDefinition(
      'api',
      'foo',
      ['Bar'],
      'GET',
      '/api',
      'file',
      true
    );
    expect(typeof result).toBe('string');
  });

  it('getApiNamespaceDefinition returns processed template', () => {
    const result = gen.getApiNamespaceDefinition('ns', 'mw', 'import', '/api');
    expect(typeof result).toBe('string');
  });

  it('FeatureGenerator > updateFeatureConfig writes config file', () => {
    fs.existsSync = vi.fn().mockImplementation((p) => {
      if (
        typeof p === 'string' &&
        (p.endsWith('.wasp.ts') || p.includes('feature.wasp.ts'))
      )
        return true;
      return false;
    });
    fs.copyFileSync = vi.fn();
    fs.readFileSync = vi.fn().mockReturnValue('return {};');
    fs.writeFileSync = vi.fn();
    const gen = new FeatureGenerator(logger, fs);
    const path = gen.updateFeatureConfig('foo', 'route', {
      path: '/foo',
      componentName: 'Foo',
      routeName: 'foo',
    });
    expect(typeof path).toBe('string');
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(fs.copyFileSync).not.toHaveBeenCalled();
  });
});
