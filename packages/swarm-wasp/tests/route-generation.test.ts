import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FeatureGenerator, RouteGenerator } from '../src';
import { schema as featureSchema } from '../src/generators/feature/schema';
import { schema as routeSchema } from '../src/generators/route/schema';
import { realFileSystem } from '../src/common';
import {
  countOccurrences,
  createTestGenerator,
  createTestWaspProject,
  readGeneratedFile,
  type TestProjectPaths,
} from './utils';

describe('Route Generator Integration Tests', () => {
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

  it('should generate route page with proper React component', async () => {
    const featureGen = await createTestGenerator(FeatureGenerator, featureSchema, {
      fileSystem: realFileSystem,
    });
    const routeGen = await createTestGenerator(RouteGenerator, routeSchema, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await routeGen.generate({
      feature: 'posts',
      path: '/posts',
      name: 'postsPage',
      force: false,
    });

    const pagePath = 'src/features/posts/client/pages/PostsPage.tsx';
    const content = readGeneratedFile(projectPaths.root, pagePath);

    expect(content).toContain('import React from "react"');
    expect(content).toContain('export const PostsPage');
    expect(content).toContain('return (');
    expect(content).toContain('<div className="container mx-auto px-4 py-8">');
  });

  it('should generate authenticated route', async () => {
    const featureGen = await createTestGenerator(FeatureGenerator, featureSchema, {
      fileSystem: realFileSystem,
    });
    const routeGen = await createTestGenerator(RouteGenerator, routeSchema, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await routeGen.generate({
      feature: 'posts',
      path: '/admin/posts',
      name: 'adminPostsPage',
      auth: true,
      force: false,
    });

    const pagePath = 'src/features/posts/client/pages/AdminPostsPage.tsx';
    const content = readGeneratedFile(projectPaths.root, pagePath);

    expect(content).toContain('export const AdminPostsPage');
  });

  it('should generate route config with correct structure', async () => {
    const featureGen = await createTestGenerator(FeatureGenerator, featureSchema, {
      fileSystem: realFileSystem,
    });
    const routeGen = await createTestGenerator(RouteGenerator, routeSchema, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await routeGen.generate({
      feature: 'posts',
      path: '/posts',
      name: 'posts',
      force: false,
    });

    const configPath = 'src/features/posts/feature.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    expect(content).toContain('addRoute');
    expect(content).toContain('path: "/posts"');
    expect(content).toContain('posts');
  });

  it('should not duplicate route in config without force flag', async () => {
    const featureGen = await createTestGenerator(FeatureGenerator, featureSchema, {
      fileSystem: realFileSystem,
    });
    const routeGen = await createTestGenerator(RouteGenerator, routeSchema, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await routeGen.generate({
      feature: 'posts',
      path: '/test',
      name: 'test',
      force: false,
    });

    const configPath = 'src/features/posts/feature.wasp.ts';
    const contentBefore = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesBefore = countOccurrences(contentBefore, 'test');

    await expect(
      routeGen.generate({
        feature: 'posts',
        path: '/test',
        name: 'test',
        force: false,
      })
    ).rejects.toThrow();

    const contentAfter = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesAfter = countOccurrences(contentAfter, 'test');

    expect(occurrencesAfter).toBe(occurrencesBefore);
  });
});
