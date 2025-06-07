import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IFileSystem } from '../types/filesystem';
import type { Logger } from '../types/logger';
import { FeatureGenerator } from './feature';

function createMockFS(): IFileSystem {
  return {
    readFileSync: vi.fn(() => 'template'),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(() => true),
    copyFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(() => []),
  };
}

function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  };
}

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
    const result = gen.getRouteDefinition('route', '/foo', 'FooPage', 'foo', true);
    expect(typeof result).toBe('string');
  });

  it('getOperationDefinition returns processed template', () => {
    const result = gen.getOperationDefinition('op', 'foo', ['Bar'], 'query');
    expect(typeof result).toBe('string');
  });

  it('getJobDefinition returns processed template', () => {
    const result = gen.getJobDefinition('job', 'worker', 'file', '[]', '', '', '', '', 'queue');
    expect(typeof result).toBe('string');
  });

  it('getApiDefinition returns processed template', () => {
    const result = gen.getApiDefinition('api', 'foo', ['Bar'], 'GET', '/api', 'file', true);
    expect(typeof result).toBe('string');
  });

  it('getApiNamespaceDefinition returns processed template', () => {
    const result = gen.getApiNamespaceDefinition('ns', 'mw', 'import', '/api');
    expect(typeof result).toBe('string');
  });

  it('FeatureGenerator > updateFeatureConfig writes config file', () => {
    const fs = {
      existsSync: vi.fn()
        .mockImplementation((p) => {
          if (typeof p === 'string' && (p.endsWith('.wasp.ts') || p.includes('feature.wasp.ts'))) return true;
          return false;
        }),
      copyFileSync: vi.fn(),
      readFileSync: vi.fn().mockReturnValue('return {};'),
      writeFileSync: vi.fn(),
    };
    const logger = { success: vi.fn(), debug: vi.fn() };
    const gen = new FeatureGenerator(logger as any, fs as any);
    const path = gen.updateFeatureConfig('foo', 'route', { path: '/foo', componentName: 'Foo', routeName: 'foo' });
    expect(typeof path).toBe('string');
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(fs.copyFileSync).not.toHaveBeenCalled();
  });
}); 