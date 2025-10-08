import type { IFileSystem, Logger } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockFS, createMockLogger } from '../../../tests/utils';
import { WaspConfigGenerator } from './generator';

describe('WaspConfigGenerator', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let gen: WaspConfigGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    gen = new WaspConfigGenerator(logger, fs);
  });

  it('generate creates feature config', () => {
    // Mock template path to exist, but config file to not exist
    fs.existsSync = vi.fn((p) => {
      if (p.includes('feature.wasp.eta')) return true; // Template exists
      if (p.includes('test-feature.wasp.ts')) return false; // Config file doesn't exist
      return true; // Feature directory exists
    });
    fs.readFileSync = vi.fn(() => 'template');
    fs.writeFileSync = vi.fn();
    fs.copyFileSync = vi.fn();

    gen.generate('test-feature');

    expect(fs.copyFileSync).toHaveBeenCalled();
  });

  it('update updates existing config', () => {
    const initialContent = `import { App } from "@ingenyus/swarm-config";

export default function configure(app: App, feature: string): void {
  app
}`;

    fs.existsSync = vi.fn(() => true);
    fs.readFileSync = vi.fn(() => initialContent);
    fs.writeFileSync = vi.fn();

    const result = gen.update(
      'test-feature',
      '.addJob(feature, "testJob", { cron: "0 8 * * *", args: {} })'
    );

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(typeof result).toBe('string');
  });

  it('update creates config file if it does not exist', () => {
    // Mock template file to exist, but config file to not exist
    fs.existsSync = vi.fn((path) => {
      if (path.includes('feature.wasp.eta')) return true; // Template exists
      if (path.includes('test-feature.wasp.ts')) return false; // Config file doesn't exist
      return true; // Other files exist
    });
    fs.copyFileSync = vi.fn();
    fs.readFileSync = vi.fn(() => 'template content');
    fs.writeFileSync = vi.fn();

    const result = gen.update(
      'test-feature',
      '.addJob(feature, "testJob", { cron: "0 8 * * *", args: {} })'
    );

    expect(fs.copyFileSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(typeof result).toBe('string');
  });
});
