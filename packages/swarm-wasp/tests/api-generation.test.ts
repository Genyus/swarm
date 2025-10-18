import { SignaleLogger } from '@ingenyus/swarm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApiGenerator, FeatureDirectoryGenerator } from '../src';
import { realFileSystem } from '../src/common';
import {
  assertImportsPresent,
  countOccurrences,
  createTestWaspProject,
  readGeneratedFile,
  type TestProjectPaths,
} from './utils';

describe('API Generator Integration Tests', () => {
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

  it('should generate API endpoint with proper structure', async () => {

    const logger = new SignaleLogger();
    const featureGen = new FeatureDirectoryGenerator(logger, realFileSystem);
    const apiGen = new ApiGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await apiGen.generate({
      feature: 'posts',
      name: 'searchPosts',
      method: 'GET',
      route: '/api/posts/search',
      entities: ['Post'],
      auth: false,
      force: false,
    });

    const apiPath = 'src/features/posts/server/apis/searchPosts.ts';
    const content = readGeneratedFile(projectPaths.root, apiPath);

    assertImportsPresent(content, [
      'import { HttpError } from "wasp/server"',
    ]);

    expect(content).toContain('export const searchPosts');
    expect(content).toContain('req.method !== \'GET\'');
    expect(content).toContain('HttpError');
  });

  it('should generate authenticated API endpoint', async () => {
    const logger = new SignaleLogger();
    const featureGen = new FeatureDirectoryGenerator(logger, realFileSystem);
    const apiGen = new ApiGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await apiGen.generate({
      feature: 'posts',
      name: 'createPost',
      method: 'POST',
      route: '/api/posts',
      entities: ['Post'],
      auth: true,
      force: false,
    });

    const apiPath = 'src/features/posts/server/apis/createPost.ts';
    const content = readGeneratedFile(projectPaths.root, apiPath);

    expect(content).toContain('export const createPost');
    expect(content).toContain('context.user');
    expect(content).toContain('req.method !== \'POST\'');
  });

  it('should generate API config with correct structure', async () => {
    const logger = new SignaleLogger();
    const featureGen = new FeatureDirectoryGenerator(logger, realFileSystem);
    const apiGen = new ApiGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await apiGen.generate({
      feature: 'posts',
      name: 'postsApi',
      method: 'GET',
      route: '/api/posts',
      entities: ['Post'],
      auth: false,
      force: false,
    });

    const configPath = 'src/features/posts/posts.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    expect(content).toContain('addApi');
    expect(content).toContain('postsApi');
    expect(content).toContain('route: "/api/posts"');
    expect(content).toContain('method: "GET"');
  });

  it('should not duplicate API in config without force flag', async () => {
    const logger = new SignaleLogger();
    const featureGen = new FeatureDirectoryGenerator(logger, realFileSystem);
    const apiGen = new ApiGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await apiGen.generate({
      feature: 'posts',
      name: 'testApi',
      method: 'GET',
      route: '/api/test',
      entities: ['Post'],
      auth: false,
      force: false,
    });

    const configPath = 'src/features/posts/posts.wasp.ts';
    const contentBefore = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesBefore = countOccurrences(contentBefore, 'testApi');

    await expect(
      apiGen.generate({
        feature: 'posts',
        name: 'testApi',
        method: 'GET',
        route: '/api/test',
        entities: ['Post'],
        auth: false,
        force: false,
      })
    ).rejects.toThrow();

    const contentAfter = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesAfter = countOccurrences(contentAfter, 'testApi');

    expect(occurrencesAfter).toBe(occurrencesBefore);
  });
});
