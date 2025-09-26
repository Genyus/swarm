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
  })),
  processTemplate: vi.fn().mockReturnValue('processed template content'),
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
        (p.endsWith('.wasp.ts') || p.includes('feature.wasp.eta'))
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
    .addApi('test', 'usersApi', {
      method: 'GET',
      route: '/api/v1/users',
      entities: ["User"],
      auth: false
    })
    .addApi('test', 'usersApi', {
      method: 'GET',
      route: '/api/v1/users',
      entities: ["User"],
      auth: false
    })
    .addApi('test', 'usersApi', {
      method: 'GET',
      route: '/api/users',
      entities: ["User"],
      auth: false
    })
    .addApi('test', 'userApi', {
      method: 'GET',
      route: '/api/users/:id',
      entities: ["User"],
      auth: false
    });
}`;

    const newDefinition = `.addApi('test', 'usersApi', {
  method: 'GET',
  route: '/api/users',
  entities: ["User"],
  auth: false
})`;

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

  it('FeatureGenerator > updateFeatureConfig maintains proper ordering', () => {
    let content = `
      export default function configure(app: App): void {
        app
      }
    `;

    fs.existsSync = vi.fn().mockImplementation((p) => {
      if (
        typeof p === 'string' &&
        (p.endsWith('.wasp.ts') || p.includes('feature.wasp.eta'))
      )
        return true;
      return false;
    });
    fs.copyFileSync = vi.fn();
    fs.readFileSync = vi.fn().mockImplementation(() => content);
    fs.writeFileSync = vi.fn().mockImplementation((path, newContent) => {
      content = newContent;
    });

    const gen = new FeatureGenerator(logger, fs);

    // Add items in a different order to test that they get properly ordered
    // Add a new API first
    const apiDefinition =
      '.addApi("foo", "aApi", { method: "GET", route: "/api/a", entities: ["User"], auth: false })';
    gen.updateFeatureConfig('foo', apiDefinition);

    // Add a new route
    const routeDefinition =
      '.addRoute("foo", "cRoute", { path: "/c", componentName: "CPage", auth: false })';
    gen.updateFeatureConfig('foo', routeDefinition);

    // Add a new CRUD
    const crudDefinition =
      '.addCrud("foo", "aCrud", { entity: "User", createOptions: { override: false }, readOptions: { override: false } })';
    gen.updateFeatureConfig('foo', crudDefinition);

    // Add another API
    const apiDefinition2 =
      '.addApi("foo", "zApi", { method: "GET", route: "/api/z", entities: ["User"], auth: false })';
    gen.updateFeatureConfig('foo', apiDefinition2);

    // Add another route
    const routeDefinition2 =
      '.addRoute("foo", "aRoute", { path: "/a", componentName: "APage", auth: false })';
    gen.updateFeatureConfig('foo', routeDefinition2);

    // Add another CRUD
    const crudDefinition2 =
      '.addCrud("foo", "bCrud", { entity: "User", createOptions: { override: false }, readOptions: { override: false } })';
    gen.updateFeatureConfig('foo', crudDefinition2);

    // Verify that writeFileSync was called
    expect(fs.writeFileSync).toHaveBeenCalled();

    // Check that the final content has proper ordering
    const lines = content.split('\n');
    const appLineIndex = lines.findIndex((line) => line.trim() === 'app');

    // Find all method calls after the app line
    const methodCalls = [];
    for (let i = appLineIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('.') && line.includes('(')) {
        const match = line.match(/\.(\w+)\([^,]+,\s*['"`]([^'"`]+)['"`]/);
        if (match) {
          methodCalls.push({ method: match[1], name: match[2] });
        }
      }
    }

    // Verify group ordering: routes should come before CRUDs, which should come before APIs
    const routeIndex = methodCalls.findIndex(
      (call) => call.method === 'addRoute'
    );
    const crudIndex = methodCalls.findIndex(
      (call) => call.method === 'addCrud'
    );
    const apiIndex = methodCalls.findIndex((call) => call.method === 'addApi');

    expect(routeIndex).toBeLessThan(crudIndex);
    expect(crudIndex).toBeLessThan(apiIndex);

    // Verify alphabetical ordering within groups
    const routes = methodCalls.filter((call) => call.method === 'addRoute');
    const cruds = methodCalls.filter((call) => call.method === 'addCrud');
    const apis = methodCalls.filter((call) => call.method === 'addApi');

    expect(routes.map((r) => r.name)).toEqual(['aRoute', 'cRoute']);
    expect(cruds.map((c) => c.name)).toEqual(['aCrud', 'bCrud']);
    expect(apis.map((a) => a.name)).toEqual(['aApi', 'zApi']);
  });
});
