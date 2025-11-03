import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FeatureGenerator, QueryGenerator } from '../src';
import { realFileSystem } from '../src/common';
import {
  assertImportsPresent,
  countOccurrences,
  createTestGenerator,
  createTestWaspProject,
  readGeneratedFile,
  type TestProjectPaths,
} from './utils';

describe('Query Generator Integration Tests', () => {
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

  it('should generate get query with proper types and imports', async () => {
    const featureGen = createTestGenerator(FeatureGenerator, {
      fileSystem: realFileSystem,
    });
    const queryGen = createTestGenerator(QueryGenerator, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await queryGen.generate({
      dataType: 'Post',
      operation: 'get',
      feature: 'posts',
      force: false,
    });

    const queryPath = 'src/features/posts/server/queries/getPost.ts';
    const content = readGeneratedFile(projectPaths.root, queryPath);

    assertImportsPresent(content, [
      'import { Post } from "wasp/entities"',
      'import type { GetPost }',
    ]);

    expect(content).toMatch(/GetPost<.*id.*>/);
    expect(content).toContain('export const getPost');
    expect(content).toContain('context.entities.Post.findUnique');
  });

  it('should generate getAll query with proper filtering', async () => {
    const featureGen = createTestGenerator(FeatureGenerator, {
      fileSystem: realFileSystem,
    });
    const queryGen = createTestGenerator(QueryGenerator, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await queryGen.generate({
      dataType: 'Post',
      operation: 'getAll',
      feature: 'posts',
      force: false,
    });

    const queryPath = 'src/features/posts/server/queries/getAllPosts.ts';
    const content = readGeneratedFile(projectPaths.root, queryPath);

    expect(content).toContain('export const getAllPosts');
    expect(content).toContain('context.entities.Post.findMany');
    expect(content).toMatch(/GetAllPosts<.*void.*>/);
  });

  it('should not duplicate query in config without force flag', async () => {
    const featureGen = createTestGenerator(FeatureGenerator, {
      fileSystem: realFileSystem,
    });
    const queryGen = createTestGenerator(QueryGenerator, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await queryGen.generate({
      dataType: 'Post',
      operation: 'get',
      feature: 'posts',
      force: false,
    });

    const configPath = 'src/features/posts/feature.wasp.ts';
    const contentBefore = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesBefore = countOccurrences(contentBefore, 'getPost');

    await expect(
      queryGen.generate({
        dataType: 'Post',
        operation: 'get',
        feature: 'posts',
        force: false,
      })
    ).rejects.toThrow();

    const contentAfter = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesAfter = countOccurrences(contentAfter, 'getPost');

    expect(occurrencesAfter).toBe(occurrencesBefore);
  });
});
