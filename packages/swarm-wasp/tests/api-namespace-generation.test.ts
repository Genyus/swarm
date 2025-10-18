import { SignaleLogger } from '@ingenyus/swarm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApiNamespaceGenerator, FeatureDirectoryGenerator } from '../src';
import { realFileSystem } from '../src/common';
import {
  countOccurrences,
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
    const logger = new SignaleLogger();
    const featureGen = new FeatureDirectoryGenerator(logger, realFileSystem);
    const apiNamespaceGen = new ApiNamespaceGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await apiNamespaceGen.generate({
      feature: 'posts',
      name: 'postsApi',
      path: '/api/posts',
      force: false,
    });

    const middlewarePath = 'src/features/posts/server/middleware/postsApi.ts';
    const content = readGeneratedFile(projectPaths.root, middlewarePath);

    expect(content).toContain('export const postsApi');
    expect(content).toContain('(_req, _res, next) =>');
  });

  it('should generate API namespace config', async () => {
    const logger = new SignaleLogger();
    const featureGen = new FeatureDirectoryGenerator(logger, realFileSystem);
    const apiNamespaceGen = new ApiNamespaceGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await apiNamespaceGen.generate({
      feature: 'posts',
      name: 'postsApi',
      path: '/api/posts',
      force: false,
    });

    const configPath = 'src/features/posts/posts.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    expect(content).toContain('addApiNamespace');
    expect(content).toContain('postsApi');
    expect(content).toContain('addApiNamespace');
    expect(content).toContain('path: "/api/posts"');
  });

  it('should not duplicate API namespace in config without force flag', async () => {
    const logger = new SignaleLogger();
    const featureGen = new FeatureDirectoryGenerator(logger, realFileSystem);
    const apiNamespaceGen = new ApiNamespaceGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await apiNamespaceGen.generate({
      feature: 'posts',
      name: 'testApi',
      path: '/api/test',
      force: false,
    });

    const configPath = 'src/features/posts/posts.wasp.ts';
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
