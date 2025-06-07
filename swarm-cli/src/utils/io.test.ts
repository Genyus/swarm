import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IFileSystem } from '../types/filesystem';
import * as io from './io';

function createMockFS(): IFileSystem {
  const files: Record<string, string> = {};
  const dirs: Set<string> = new Set();
  return {
    readFileSync: vi.fn((path: string) => files[path] || ''),
    writeFileSync: vi.fn((path: string, data: string) => { files[path] = data; }),
    existsSync: vi.fn((path: string) => path in files || dirs.has(path)),
    copyFileSync: vi.fn((src: string, dest: string) => { files[dest] = files[src]; }),
    mkdirSync: vi.fn((path: string) => { dirs.add(path); }),
    readdirSync: vi.fn((path: string, options: { withFileTypes: true }) => []),
  };
}

describe('io utils', () => {
  let fs: IFileSystem;
  beforeEach(() => {
    fs = createMockFS();
  });

  it('ensureDirectoryExists creates dir if missing', () => {
    const dir = '/foo/bar';
    fs.existsSync = vi.fn(() => false);
    io.ensureDirectoryExists(fs, dir);
    expect(fs.mkdirSync).toHaveBeenCalledWith(dir, { recursive: true });
  });

  it('ensureDirectoryExists does not create if exists', () => {
    const dir = '/foo/bar';
    fs.existsSync = vi.fn(() => true);
    io.ensureDirectoryExists(fs, dir);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  it('featureExists returns true if feature dir exists', () => {
    fs.existsSync = vi.fn(() => true);
    expect(io.featureExists(fs, 'myfeature')).toBe(true);
  });

  it('getConfigDir returns config dir', () => {
    expect(io.getConfigDir()).toMatch(/config$/);
  });

  it('getFeatureDir returns feature dir', () => {
    expect(io.getFeatureDir('foo')).toMatch(/features\/foo$/);
  });

  it('getFeatureImportPath returns correct path', () => {
    expect(io.getFeatureImportPath('foo')).toBe('foo/_core');
    expect(io.getFeatureImportPath('foo/bar')).toBe('foo/bar');
  });

  it('getFeatureTargetDir returns correct targetDir and importPath', () => {
    const { targetDir, importPath } = io.getFeatureTargetDir('foo', 'page');
    expect(targetDir).toMatch(/features\/foo\/_core/);
    expect(importPath).toContain('@src/features/foo/$_core');
  });

  it('getRouteNameFromPath returns PascalCase Page', () => {
    expect(io.getRouteNameFromPath('/foo-bar')).toBe('FooBarPage');
    expect(io.getRouteNameFromPath('/')).toBe('IndexPage');
  });
}); 