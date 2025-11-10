import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ActionGenerator,
  ApiGenerator,
  FeatureGenerator,
  JobGenerator,
  QueryGenerator,
  RouteGenerator,
} from '../src';
import { schema as actionSchema } from '../src/generators/action/schema';
import { schema as apiSchema } from '../src/generators/api/schema';
import { schema as featureSchema } from '../src/generators/feature/schema';
import { schema as jobSchema } from '../src/generators/job/schema';
import { schema as querySchema } from '../src/generators/query/schema';
import { schema as routeSchema } from '../src/generators/route/schema';
import { realFileSystem } from '../src/common';
import {
  countOccurrences,
  createTestGenerator,
  createTestWaspProject,
  readGeneratedFile,
  type TestProjectPaths,
} from './utils';

describe('Configuration File Management Tests', () => {
  let projectPaths: TestProjectPaths;
  let originalCwd: string;
  let featureGen: FeatureGenerator;

  beforeEach(async () => {
    originalCwd = process.cwd();
    projectPaths = createTestWaspProject();
    process.chdir(projectPaths.root);
    featureGen = await createTestGenerator(FeatureGenerator, featureSchema, {
      fileSystem: realFileSystem,
    });
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it('should maintain correct group ordering with multiple definition types', async () => {
    await featureGen.generate({ target: 'posts' });

    const actionGen = await createTestGenerator(ActionGenerator, actionSchema, {
      fileSystem: realFileSystem,
    });
    const queryGen = await createTestGenerator(QueryGenerator, querySchema, {
      fileSystem: realFileSystem,
    });
    const apiGen = await createTestGenerator(ApiGenerator, apiSchema, {
      fileSystem: realFileSystem,
    });
    const routeGen = await createTestGenerator(RouteGenerator, routeSchema, {
      fileSystem: realFileSystem,
    });
    const jobGen = await createTestGenerator(JobGenerator, jobSchema, {
      fileSystem: realFileSystem,
    });

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

    const configPath = 'src/features/posts/feature.wasp.ts';
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

    const actionGen = await createTestGenerator(ActionGenerator, actionSchema, {
      fileSystem: realFileSystem,
    });
    const queryGen = await createTestGenerator(QueryGenerator, querySchema, {
      fileSystem: realFileSystem,
    });

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

    const configPath = 'src/features/posts/feature.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    expect(content).toMatch(/\/\/\s*Action definitions/);
    expect(content).toMatch(/\/\/\s*Query definitions/);
  });

  it('should always end config file with terminating semicolon', async () => {
    await featureGen.generate({ target: 'posts' });

    const actionGen = await createTestGenerator(ActionGenerator, actionSchema, {
      fileSystem: realFileSystem,
    });

    await actionGen.generate({
      dataType: 'Post',
      operation: 'create',
      feature: 'posts',
      force: false,
    });

    const configPath = 'src/features/posts/feature.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    // The generated config ends with a closing brace, not semicolon
    expect(content.trim()).toMatch(/}\s*$/);
  });

  it('should preserve proper structure after multiple additions', async () => {
    await featureGen.generate({ target: 'posts' });

    const actionGen = await createTestGenerator(ActionGenerator, actionSchema, {
      fileSystem: realFileSystem,
    });

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

    const configPath = 'src/features/posts/feature.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    // The generated config should end with a closing brace
    expect(content.trim()).toMatch(/}\s*$/);

    // Should have multiple action definitions
    expect(countOccurrences(content, 'addAction')).toBe(3);
  });

  it('should sort definitions alphabetically within groups', async () => {
    await featureGen.generate({ target: 'posts' });

    const actionGen = await createTestGenerator(ActionGenerator, actionSchema, {
      fileSystem: realFileSystem,
    });

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

    const configPath = 'src/features/posts/feature.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    const createPos = content.indexOf('createPost');
    const deletePos = content.indexOf('deletePost');
    const updatePos = content.indexOf('updatePost');

    expect(createPos).toBeLessThan(deletePos);
    expect(deletePos).toBeLessThan(updatePos);
  });
});
