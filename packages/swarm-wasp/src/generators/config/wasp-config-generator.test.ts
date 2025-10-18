import type { FileSystem, Logger } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockFS, createMockLogger } from '../../../tests/utils';
import { WaspConfigGenerator } from './wasp-config-generator';

describe('WaspConfigGenerator', () => {
  let fs: FileSystem;
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
    const initialContent = `import { App } from "@ingenyus/swarm-wasp";

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
    fs.readFileSync = vi.fn((path) => {
      if (typeof path === 'string' && path.endsWith('.wasp.ts')) {
        return `import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
}`;
      }
      return 'template content';
    });
    fs.writeFileSync = vi.fn();

    const result = gen.update(
      'test-feature',
      '.addJob(feature, "testJob", { cron: "0 8 * * *", args: {} })'
    );

    expect(fs.copyFileSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(typeof result).toBe('string');
  });

  describe('semicolon handling', () => {
    it('handles existing semicolons in config', () => {
      const contentWithSemicolons = `import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
    // Action definitions
    .addAction(feature, "createTask", {
      entities: ["Task"],
      auth: false,
    });
    // Query definitions
    .addQuery(feature, "getTask", {
      entities: ["Task"],
      auth: false,
    });
}`;

      fs.existsSync = vi.fn(() => true);
      fs.readFileSync = vi.fn(() => contentWithSemicolons);
      fs.writeFileSync = vi.fn();

      const result = gen.update(
        'test-feature',
        '.addQuery(feature, "getAllTasks", { entities: ["Task"], auth: false })'
      );

      expect(fs.writeFileSync).toHaveBeenCalled();

      const writtenContent = (fs.writeFileSync as any).mock.calls[0][1];
      const lines = writtenContent.split('\n');
      const methodChainLines = lines.filter(
        (l: string) => l.trim().endsWith(')') || l.trim().endsWith(');')
      );

      methodChainLines.forEach((line: string, index: number) => {
        if (index === methodChainLines.length - 1) {
          expect(line.trim()).toMatch(/\);$/);
        } else {
          expect(line.trim()).toMatch(/\)$/);
          expect(line.trim()).not.toMatch(/\);$/);
        }
      });
    });

    it('preserves semicolons outside method chain', () => {
      const contentWithSemicolons = `import { App } from "@ingenyus/swarm-wasp";

const someVar = "test";

export default function configureFeature(app: App, feature: string): void {
  app
    .addAction(feature, "createTask", {
      entities: ["Task"],
      auth: false,
    });
}`;

      fs.existsSync = vi.fn(() => true);
      fs.readFileSync = vi.fn(() => contentWithSemicolons);
      fs.writeFileSync = vi.fn();

      gen.update(
        'test-feature',
        '.addQuery(feature, "getTask", { entities: ["Task"], auth: false })'
      );

      const writtenContent = (fs.writeFileSync as any).mock.calls[0][1];

      expect(writtenContent).toContain('const someVar = "test";');
    });

    it('handles mixed semicolon usage', () => {
      const mixedContent = `import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
    .addAction(feature, "createTask", {
      entities: ["Task"],
      auth: false,
    });
    .addAction(feature, "updateTask", {
      entities: ["Task"],
      auth: false,
    })
    .addQuery(feature, "getTask", {
      entities: ["Task"],
      auth: false,
    });
}`;

      fs.existsSync = vi.fn(() => true);
      fs.readFileSync = vi.fn(() => mixedContent);
      fs.writeFileSync = vi.fn();

      const result = gen.update(
        'test-feature',
        '.addQuery(feature, "getAllTasks", { entities: ["Task"], auth: false })'
      );

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(typeof result).toBe('string');
    });
  });
});
