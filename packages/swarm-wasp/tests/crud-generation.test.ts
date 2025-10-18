import { SignaleLogger } from '@ingenyus/swarm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CrudGenerator, FeatureDirectoryGenerator } from '../src';
import { realFileSystem } from '../src/common';
import {
  assertImportsPresent,
  countOccurrences,
  createTestWaspProject,
  readGeneratedFile,
  type TestProjectPaths,
} from './utils';

describe('CRUD Generator Integration Tests', () => {
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

  it('should generate complete CRUD operations', async () => {
    const logger = new SignaleLogger();
    const featureGen = new FeatureDirectoryGenerator(logger, realFileSystem);
    const crudGen = new CrudGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await crudGen.generate({
      dataType: 'Post',
      feature: 'posts',
      public: ['create', 'get', 'getAll', 'update', 'delete'],
      override: ['create', 'get', 'getAll', 'update', 'delete'],
      force: false,
    });

    const crudPath = 'src/features/posts/server/cruds/posts.ts';
    const content = readGeneratedFile(projectPaths.root, crudPath);

    assertImportsPresent(content, [
      'import { type Post } from "wasp/entities"',
      'import { HttpError } from "wasp/server"',
    ]);

    expect(content).toContain('export const createPost');
    expect(content).toContain('export const getPost');
    expect(content).toContain('export const getAllPosts');
    expect(content).toContain('export const updatePost');
    expect(content).toContain('export const deletePost');
  });

  it('should generate CRUD config with all operations', async () => {
    const logger = new SignaleLogger();
    const featureGen = new FeatureDirectoryGenerator(logger, realFileSystem);
    const crudGen = new CrudGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await crudGen.generate({
      dataType: 'Post',
      feature: 'posts',
      public: ['create', 'get', 'getAll', 'update', 'delete'],
      force: false,
    });

    const configPath = 'src/features/posts/posts.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    expect(content).toContain('addCrud');
    expect(content).toContain('Post');
    expect(content).toContain('Posts');
    expect(content).toContain('entity: "Post"');
  });

  it('should not duplicate CRUD in config without force flag', async () => {
    const logger = new SignaleLogger();
    const featureGen = new FeatureDirectoryGenerator(logger, realFileSystem);
    const crudGen = new CrudGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await crudGen.generate({
      dataType: 'Post',
      feature: 'posts',
      public: ['create', 'get'],
      force: false,
    });

    const configPath = 'src/features/posts/posts.wasp.ts';
    const contentBefore = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesBefore = countOccurrences(contentBefore, 'addCrud');

    // The CRUD generator should replace the existing definition, not duplicate it
    await crudGen.generate({
      dataType: 'Post',
      feature: 'posts',
      public: ['create', 'get'],
      force: false,
    });

    const contentAfter = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesAfter = countOccurrences(contentAfter, 'addCrud');

    // Should have the same number of addCrud calls (replaced, not duplicated)
    expect(occurrencesAfter).toBe(occurrencesBefore);
  });
});
