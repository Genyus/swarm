import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockFS, createMockLogger } from '../../tests/utils';
import type { IFileSystem } from '../types/filesystem';
import type { Logger } from '../types/logger';
import { parseHelperMethodDefinition } from '../utils/strings';
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

vi.mock('../utils/strings', async () => {
  const actual = await vi.importActual('../utils/strings');
  return {
    ...actual,
    validateFeaturePath: vi.fn().mockReturnValue(['foo']),
    getPlural: vi.fn().mockImplementation((str: string) => str + 's'),
  };
});

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

  // Note: Definition methods have been moved to individual generators
  // Tests for those methods are now in their respective generator test files

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
    fs.readFileSync = vi.fn().mockReturnValue(`
      export default function configure(app: App): void {
        app
      }
    `);
    fs.writeFileSync = vi.fn();
    const gen = new FeatureGenerator(logger, fs);
    const definition =
      '.addRoute("testRoute", "/test", "TestPage", "features/test/_core/client/pages/Test", false)';
    const path = gen.updateFeatureConfig('foo', definition);
    expect(typeof path).toBe('string');
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(fs.copyFileSync).not.toHaveBeenCalled();
  });

  it('FeatureGenerator > removeExistingDefinition removes all duplicate entries', () => {
    const contentWithDuplicates = `
export default function configure(app: App): void {
  app
    .addApi(
      'usersApi',
      'GET',
      '/api/v1/users',
      '@src/features/test/_core/server/apis/users.ts',
      ["User"],
      false
    )
    .addApi(
      'usersApi',
      'GET',
      '/api/v1/users',
      '@src/features/test/_core/server/apis/users.ts',
      ["User"],
      false
    )
    .addApi(
      'usersApi',
      'GET',
      '/api/users',
      '@src/features/test/_core/server/apis/users.ts',
      ["User"],
      false
    )
    .addApi(
      'userApi',
      'GET',
      '/api/users/:id',
      '@src/features/test/_core/server/apis/user.ts',
      ["User"],
      false
    );
}`;

    const newDefinition = `.addApi(
  'usersApi',
  'GET',
  '/api/users',
  '@src/features/test/_core/server/apis/users.ts',
  ["User"],
  false
)`;

    const gen = new FeatureGenerator(logger, fs);

    const result = (gen as any).removeExistingDefinition(
      contentWithDuplicates,
      newDefinition
    );

    // Should remove all instances of 'usersApi' but keep 'userApi'
    expect(result).not.toContain('usersApi');
    expect(result).toContain('userApi');

    // Should only have one instance of the new definition when added
    const finalContent = result + '\n' + newDefinition;
    const usersApiCount = (finalContent.match(/usersApi/g) || []).length;
    expect(usersApiCount).toBe(1);
  });
});
