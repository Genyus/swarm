import { SignaleLogger } from '@ingenyus/swarm';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CrudGenerator, FeatureGenerator } from '../src';
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
    const featureGen = new FeatureGenerator(logger, realFileSystem);
    const crudGen = new CrudGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ target: 'posts' });
    await crudGen.generate({
      dataType: 'Post',
      feature: 'posts',
      name: 'posts',
      public: ['create', 'get', 'getAll', 'update', 'delete'],
      override: ['create', 'get', 'getAll', 'update', 'delete'],
      force: false,
    });

    const crudPath = 'src/features/posts/server/cruds/posts.ts';
    const content = readGeneratedFile(projectPaths.root, crudPath);

    assertImportsPresent(content, [
      'import { Prisma } from "@prisma/client"',
      'import { type Post } from "wasp/entities"',
      'import { HttpError } from "wasp/server"',
      'import { type Posts } from "wasp/server/crud"',
    ]);

    expect(content).toContain(
      'export const createPost: Posts.CreateAction<Pick<Post, "title" | "authorId"> & Partial<Pick<Post, "content" | "published" | "metadata">>> = async (data, context) => {'
    );
    expect(content).toContain(
      'export const deletePost: Posts.DeleteAction<Pick<Post, "id">> = async ({ id }, context) => {'
    );
    expect(content).toContain(
      'export const getAllPosts = (async (_args, context) => {'
    );
    expect(content).toContain('}) satisfies Posts.GetAllQuery<void>;');
    expect(content).toContain(
      'export const getPost = (async ({ id }, context) => {'
    );
    expect(content).toContain('}) satisfies Posts.GetQuery<Pick<Post, "id">>;');
    expect(content).toContain(
      'export const updatePost: Posts.UpdateAction<Pick<Post, "id"> & Partial<Omit<Post, "id">>> = async ({ id, ...data }, context) => {'
    );
  });

  it('should generate CRUD config with all operations', async () => {
    const logger = new SignaleLogger();
    const featureGen = new FeatureGenerator(logger, realFileSystem);
    const crudGen = new CrudGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ target: 'posts' });
    await crudGen.generate({
      dataType: 'Post',
      feature: 'posts',
      name: 'posts',
      public: ['create', 'get', 'getAll', 'update', 'delete'],
      force: false,
    });

    const configPath = 'src/features/posts/posts.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);
    const crudPath = path.join(
      projectPaths.root,
      'src/features/posts/server/cruds/posts.ts'
    );

    expect(realFileSystem.existsSync(crudPath)).toBe(false);
    expect(content).toContain('addCrud');
    expect(content).toContain('Post');
    expect(content).toContain('Posts');
    expect(content).toContain('entity: "Post"');
  });

  it('should not duplicate CRUD in config without force flag', async () => {
    const logger = new SignaleLogger();
    const featureGen = new FeatureGenerator(logger, realFileSystem);
    const crudGen = new CrudGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ target: 'posts' });
    await crudGen.generate({
      dataType: 'Post',
      feature: 'posts',
      name: 'posts',
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
      name: 'posts',
      public: ['create', 'get'],
      force: false,
    });

    const contentAfter = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesAfter = countOccurrences(contentAfter, 'addCrud');
    const crudPath = path.join(
      projectPaths.root,
      'src/features/posts/server/cruds/posts.ts'
    );

    expect(realFileSystem.existsSync(crudPath)).toBe(false);
    // Should have the same number of addCrud calls (replaced, not duplicated)
    expect(occurrencesAfter).toBe(occurrencesBefore);
  });
});
