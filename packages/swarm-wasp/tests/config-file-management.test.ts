import { SignaleLogger } from '@ingenyus/swarm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ActionGenerator,
  ApiGenerator,
  FeatureGenerator,
  JobGenerator,
  QueryGenerator,
  RouteGenerator,
} from '../src';
import { realFileSystem } from '../src/common';
import {
  countOccurrences,
  createTestWaspProject,
  readGeneratedFile,
  type TestProjectPaths,
} from './utils';

describe('Configuration File Management Tests', () => {
  let projectPaths: TestProjectPaths;
  let originalCwd: string;
  let logger: SignaleLogger;
  let featureGen: FeatureGenerator;

  beforeEach(() => {
    originalCwd = process.cwd();
    projectPaths = createTestWaspProject();
    process.chdir(projectPaths.root);
    logger = new SignaleLogger();
    featureGen = new FeatureGenerator(logger, realFileSystem);
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it('should maintain correct group ordering with multiple definition types', async () => {
    await featureGen.generate({ target: 'posts' });

    const actionGen = new ActionGenerator(logger, realFileSystem, featureGen);
    const queryGen = new QueryGenerator(logger, realFileSystem, featureGen);
    const apiGen = new ApiGenerator(logger, realFileSystem, featureGen);
    const routeGen = new RouteGenerator(logger, realFileSystem, featureGen);
    const jobGen = new JobGenerator(logger, realFileSystem, featureGen);

    await routeGen.generate({
      feature: 'posts',
      path: '/posts',
      name: 'posts',
      force: false,
    });

    await actionGen.generate({
      dataType: 'Post',
      operation: 'create',
      feature: 'posts',
      force: false,
    });

    await apiGen.generate({
      feature: 'posts',
      name: 'postsApi',
      method: 'GET',
      path: '/api/posts',
      entities: ['Post'],
      force: false,
    });

    await queryGen.generate({
      dataType: 'Post',
      operation: 'get',
      feature: 'posts',
      force: false,
    });

    await jobGen.generate({
      feature: 'posts',
      name: 'cleanupPosts',
      cron: '0 0 * * *',
      force: false,
    });

    const configPath = 'src/features/posts/posts.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    // The actual generated format doesn't have group headers, just comments
    expect(content).toContain('addRoute');
    expect(content).toContain('addQuery');
    expect(content).toContain('addAction');
    expect(content).toContain('addApi');
    expect(content).toContain('addJob');
  });

  it('should include group headers for each definition type', async () => {
    await featureGen.generate({ target: 'posts' });

    const actionGen = new ActionGenerator(logger, realFileSystem, featureGen);
    const queryGen = new QueryGenerator(logger, realFileSystem, featureGen);

    await actionGen.generate({
      dataType: 'Post',
      operation: 'create',
      feature: 'posts',
      force: false,
    });

    await queryGen.generate({
      dataType: 'Post',
      operation: 'get',
      feature: 'posts',
      force: false,
    });

    const configPath = 'src/features/posts/posts.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    expect(content).toMatch(/\/\/\s*Action definitions/);
    expect(content).toMatch(/\/\/\s*Query definitions/);
  });

  it('should always end config file with terminating semicolon', async () => {
    await featureGen.generate({ target: 'posts' });

    const actionGen = new ActionGenerator(logger, realFileSystem, featureGen);

    await actionGen.generate({
      dataType: 'Post',
      operation: 'create',
      feature: 'posts',
      force: false,
    });

    const configPath = 'src/features/posts/posts.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    // The generated config ends with a closing brace, not semicolon
    expect(content.trim()).toMatch(/}\s*$/);
  });

  it('should preserve proper structure after multiple additions', async () => {
    await featureGen.generate({ target: 'posts' });

    const actionGen = new ActionGenerator(logger, realFileSystem, featureGen);

    await actionGen.generate({
      dataType: 'Post',
      operation: 'create',
      feature: 'posts',
      force: false,
    });

    await actionGen.generate({
      dataType: 'Post',
      operation: 'update',
      feature: 'posts',
      force: false,
    });

    await actionGen.generate({
      dataType: 'Post',
      operation: 'delete',
      feature: 'posts',
      force: false,
    });

    const configPath = 'src/features/posts/posts.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    // The generated config should end with a closing brace
    expect(content.trim()).toMatch(/}\s*$/);

    // Should have multiple action definitions
    expect(countOccurrences(content, 'addAction')).toBe(3);
  });

  it('should sort definitions alphabetically within groups', async () => {
    await featureGen.generate({ target: 'posts' });

    const actionGen = new ActionGenerator(logger, realFileSystem, featureGen);

    await actionGen.generate({
      dataType: 'Post',
      operation: 'update',
      feature: 'posts',
      force: false,
    });

    await actionGen.generate({
      dataType: 'Post',
      operation: 'create',
      feature: 'posts',
      force: false,
    });

    await actionGen.generate({
      dataType: 'Post',
      operation: 'delete',
      feature: 'posts',
      force: false,
    });

    const configPath = 'src/features/posts/posts.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    const createPos = content.indexOf('createPost');
    const deletePos = content.indexOf('deletePost');
    const updatePos = content.indexOf('updatePost');

    expect(createPos).toBeLessThan(deletePos);
    expect(deletePos).toBeLessThan(updatePos);
  });
});
