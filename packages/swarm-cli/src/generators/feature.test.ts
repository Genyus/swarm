import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockFS, createMockLogger } from '../../test/utils';
import type { IFileSystem } from '../types/filesystem';
import type { Logger } from '../types/logger';
import { FeatureGenerator } from './feature';

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
