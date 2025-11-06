import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApiNamespaceGenerator, FeatureGenerator } from '../src';
import { realFileSystem } from '../src/common';
import {
  countOccurrences,
  createTestGenerator,
  createTestWaspProject,
  readGeneratedFile,
  type TestProjectPaths,
} from './utils';

describe('API Namespace Generator Integration Tests', () => {
  let projectPaths: TestProjectPaths;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    projectPaths = createTestWaspProject();
    process.chdir(projectPaths.root);
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it('should generate API namespace middleware', async () => {
    const featureGen = createTestGenerator(FeatureGenerator, {
      fileSystem: realFileSystem,
    });
    const apiNamespaceGen = createTestGenerator(ApiNamespaceGenerator, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await apiNamespaceGen.generate({
      feature: 'posts',
      name: 'postsApi',
      path: '/api/posts',
      force: false,
    });

    const middlewarePath = 'src/features/posts/server/apis/middleware/postsApi.ts';
    const content = readGeneratedFile(projectPaths.root, middlewarePath);

    expect(content).toContain('export const postsApi');
    expect(content).toContain('(_req, _res, next) =>');
  });

  it('should generate API namespace config', async () => {
    const featureGen = createTestGenerator(FeatureGenerator, {
      fileSystem: realFileSystem,
    });
    const apiNamespaceGen = createTestGenerator(ApiNamespaceGenerator, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await apiNamespaceGen.generate({
      feature: 'posts',
      name: 'postsApi',
      path: '/api/posts',
      force: false,
    });

    const configPath = 'src/features/posts/feature.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    expect(content).toContain('addApiNamespace');
    expect(content).toContain('postsApi');
    expect(content).toContain('addApiNamespace');
    expect(content).toContain('path: "/api/posts"');
  });

  it('should not duplicate API namespace in config without force flag', async () => {
    const featureGen = createTestGenerator(FeatureGenerator, {
      fileSystem: realFileSystem,
    });
    const apiNamespaceGen = createTestGenerator(ApiNamespaceGenerator, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await apiNamespaceGen.generate({
      feature: 'posts',
      name: 'testApi',
      path: '/api/test',
      force: false,
    });

    const configPath = 'src/features/posts/feature.wasp.ts';
    const contentBefore = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesBefore = countOccurrences(contentBefore, 'testApi');

    await expect(
      apiNamespaceGen.generate({
        feature: 'posts',
        name: 'testApi',
        path: '/api/test',
        force: false,
      })
    ).rejects.toThrow();

    const contentAfter = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesAfter = countOccurrences(contentAfter, 'testApi');

    expect(occurrencesAfter).toBe(occurrencesBefore);
  });
});
