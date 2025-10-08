import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockFS } from '@ingenyus/swarm-core/tests/utils';
import type { IFileSystem } from '@ingenyus/swarm-core/src/types/filesystem';
import * as filesystem from './filesystem';

describe('filesystem utils', () => {
  let fs: IFileSystem;
  beforeEach(() => {
    fs = createMockFS();
  });

  it('ensureDirectoryExists creates dir if missing', () => {
    const dir = '/foo/bar';
    fs.existsSync = vi.fn(() => false);
    filesystem.ensureDirectoryExists(fs, dir);
    expect(fs.mkdirSync).toHaveBeenCalledWith(dir, { recursive: true });
  });

  it('ensureDirectoryExists does not create if exists', () => {
    const dir = '/foo/bar';
    fs.existsSync = vi.fn(() => true);
    filesystem.ensureDirectoryExists(fs, dir);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  it('featureExists returns true if feature dir exists', () => {
    fs.existsSync = vi.fn(() => true);
    expect(filesystem.featureExists(fs, 'myfeature')).toBe(true);
  });

  it('findWaspRoot finds .wasproot file', () => {
    fs.existsSync = vi.fn((path: string) => path.includes('.wasproot'));
    const result = filesystem.findWaspRoot(fs, '/some/project/path');
    expect(result).toBe('/some/project/path');
  });

  it('findWaspRoot searches upward for .wasproot file', () => {
    fs.existsSync = vi.fn((path: string) => path === '/some/.wasproot');
    const result = filesystem.findWaspRoot(fs, '/some/project/deep/path');
    expect(result).toBe('/some');
  });

  it('findWaspRoot throws error when .wasproot not found', () => {
    fs.existsSync = vi.fn(() => false);
    expect(() => filesystem.findWaspRoot(fs, '/some/path')).toThrow(
      "Couldn't find Wasp application root"
    );
  });

  it('getConfigDir returns config dir', () => {
    fs.existsSync = vi.fn(() => true);
    expect(filesystem.getConfigDir(fs)).toMatch(/config$/);
  });

  it('getFeatureDir returns feature dir', () => {
    fs.existsSync = vi.fn(() => true);
    expect(filesystem.getFeatureDir(fs, 'foo')).toMatch(/features\/foo$/);
  });

  it('getFeatureImportPath returns correct path', () => {
    expect(filesystem.getFeatureImportPath('foo')).toBe('foo');
    expect(filesystem.getFeatureImportPath('foo/bar')).toBe('foo/bar');
  });

  it('getFeatureTargetDir returns correct targetDir and importDirectory', () => {
    fs.existsSync = vi.fn(() => true);
    const { targetDirectory, importDirectory } = filesystem.getFeatureTargetDir(
      fs,
      'foo',
      'page'
    );
    expect(targetDirectory).toMatch(/features\/foo\/client\/pages$/);
    expect(importDirectory).toContain('@src/features/foo/client/pages');
  });

  it('getRouteNameFromPath returns PascalCase Page', () => {
    expect(filesystem.getRouteNameFromPath('/foo-bar')).toBe('FooBarPage');
    expect(filesystem.getRouteNameFromPath('/')).toBe('IndexPage');
  });

  it('normaliseFeaturePath adds features prefix correctly', () => {
    expect(filesystem.normaliseFeaturePath('demo')).toBe('features/demo');
    expect(filesystem.normaliseFeaturePath('demo/sub-feature')).toBe(
      'features/demo/features/sub-feature'
    );
    expect(filesystem.normaliseFeaturePath('features/demo')).toBe(
      'features/demo'
    );
    expect(filesystem.normaliseFeaturePath('features/demo/sub-feature')).toBe(
      'features/demo/features/sub-feature'
    );
    expect(
      filesystem.normaliseFeaturePath('demo/sub-feature/deep-feature')
    ).toBe('features/demo/features/sub-feature/features/deep-feature');
  });
});
