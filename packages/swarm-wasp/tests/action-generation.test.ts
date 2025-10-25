import { SignaleLogger } from '@ingenyus/swarm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ActionGenerator, FeatureGenerator } from '../src';
import { realFileSystem } from '../src/common';
import {
  assertImportsPresent,
  countOccurrences,
  createTestWaspProject,
  readGeneratedFile,
  type TestProjectPaths,
} from './utils';

describe('Action Generator Integration Tests', () => {
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

  it('should generate create action with proper types and imports', async () => {
    const logger = new SignaleLogger();
    const featureGen = new FeatureGenerator(logger, realFileSystem);
    const actionGen = new ActionGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ target: 'posts' });
    await actionGen.generate({
      dataType: 'Post',
      operation: 'create',
      feature: 'posts',
      auth: true,
      force: false,
    });

    const actionPath = 'src/features/posts/server/actions/createPost.ts';
    const content = readGeneratedFile(projectPaths.root, actionPath);

    assertImportsPresent(content, [
      'import { Post } from "wasp/entities"',
      'import { HttpError } from "wasp/server"',
      'import type { CreatePost }',
    ]);

    expect(content).toMatch(/CreatePost<.*title.*>/);
    expect(content).toContain('context.user');
    expect(content).toContain('export const createPost');
  });

  it('should not duplicate action in config without force flag', async () => {
    const logger = new SignaleLogger();
    const featureGen = new FeatureGenerator(logger, realFileSystem);
    const actionGen = new ActionGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ target: 'posts' });
    await actionGen.generate({
      dataType: 'Post',
      operation: 'create',
      feature: 'posts',
      auth: false,
      force: false,
    });

    const configPath = 'src/features/posts/posts.wasp.ts';
    const contentBefore = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesBefore = countOccurrences(contentBefore, 'createPost');

    await expect(
      actionGen.generate({
        dataType: 'Post',
        operation: 'create',
        feature: 'posts',
        auth: false,
        force: false,
      })
    ).rejects.toThrow();

    const contentAfter = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesAfter = countOccurrences(contentAfter, 'createPost');

    expect(occurrencesAfter).toBe(occurrencesBefore);
  });

  it('should replace action definition with force flag', async () => {
    const logger = new SignaleLogger();
    const featureGen = new FeatureGenerator(logger, realFileSystem);
    const actionGen = new ActionGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ target: 'posts' });

    await actionGen.generate({
      dataType: 'Post',
      operation: 'create',
      feature: 'posts',
      auth: false,
      force: false,
    });

    const configPath = 'src/features/posts/posts.wasp.ts';
    const contentBefore = readGeneratedFile(projectPaths.root, configPath);
    expect(contentBefore).not.toContain('authRequired: true');

    await actionGen.generate({
      dataType: 'Post',
      operation: 'create',
      feature: 'posts',
      auth: true,
      force: true,
    });

    const contentAfter = readGeneratedFile(projectPaths.root, configPath);
    expect(contentAfter).toContain('auth: true');

    expect(countOccurrences(contentAfter, 'addAction')).toBeLessThanOrEqual(1);
  });
});
