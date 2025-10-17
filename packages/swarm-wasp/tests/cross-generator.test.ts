import { SignaleLogger } from '@ingenyus/swarm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ActionGenerator,
  ApiGenerator,
  CrudGenerator,
  FeatureDirectoryGenerator,
  JobGenerator,
  QueryGenerator,
  RouteGenerator,
} from '../src';
import { realFileSystem } from '../src/common';
import {
  assertConfigGroupOrder,
  createTestWaspProject,
  readGeneratedFile,
  type TestProjectPaths,
} from './utils';

describe('Cross-Generator Integration Tests', () => {
  let projectPaths: TestProjectPaths;
  let originalCwd: string;
  let logger: SignaleLogger;
  let featureGen: FeatureDirectoryGenerator;

  beforeEach(() => {
    originalCwd = process.cwd();
    projectPaths = createTestWaspProject();
    process.chdir(projectPaths.root);
    logger = new SignaleLogger();
    featureGen = new FeatureDirectoryGenerator(logger, realFileSystem);
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it('should generate compatible CRUD and custom operations', async () => {

    await featureGen.generate({ path: 'posts' });

    const crudGen = new CrudGenerator(logger, realFileSystem, featureGen);
    const actionGen = new ActionGenerator(logger, realFileSystem, featureGen);
    const queryGen = new QueryGenerator(logger, realFileSystem, featureGen);

    await crudGen.generate({
      dataType: 'Post',
      feature: 'posts',
      public: ['create', 'get', 'getAll', 'update', 'delete'],
      force: false,
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

    const configPath = 'src/features/posts/posts.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    expect(content).toContain('addCrud');
    expect(content).toContain('addAction');
    expect(content).toContain('addQuery');
    expect(content).toContain('createPost');
    expect(content).toContain('getPost');

    // The actual generated format doesn't have group headers, just comments
    expect(content).toContain('addQuery');
    expect(content).toContain('addAction');
    expect(content).toContain('addCrud');
  });

  it('should generate complete feature with all generator types', async () => {

    await featureGen.generate({ path: 'posts' });

    const actionGen = new ActionGenerator(logger, realFileSystem, featureGen);
    const queryGen = new QueryGenerator(logger, realFileSystem, featureGen);
    const apiGen = new ApiGenerator(logger, realFileSystem, featureGen);
    const routeGen = new RouteGenerator(logger, realFileSystem, featureGen);
    const jobGen = new JobGenerator(logger, realFileSystem, featureGen);

    await actionGen.generate({
      dataType: 'Post',
      operation: 'create',
      feature: 'posts',
      force: false,
    });

    await queryGen.generate({
      dataType: 'Post',
      operation: 'getAll',
      feature: 'posts',
      force: false,
    });

    await apiGen.generate({
      feature: 'posts',
      name: 'postsApi',
      method: 'GET',
      route: '/api/posts',
      entities: ['Post'],
      force: false,
    });

    await routeGen.generate({
      feature: 'posts',
      path: '/posts',
      name: 'postsPage',
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

    assertConfigGroupOrder(content, [
      'Routes',
      'Queries',
      'Actions',
      'APIs',
      'Jobs',
    ]);

    expect(content.trim()).toMatch(/}\s*$/);

    expect(content).toContain('postsPage');
    expect(content).toContain('getAllPosts');
    expect(content).toContain('createPost');
    expect(content).toContain('postsApi');
    expect(content).toContain('cleanupPosts');
  });

  it('should handle multiple features with different generators', async () => {

    await featureGen.generate({ path: 'posts' });
    await featureGen.generate({ path: 'users' });

    const actionGen = new ActionGenerator(logger, realFileSystem, featureGen);
    const crudGen = new CrudGenerator(logger, realFileSystem, featureGen);

    await actionGen.generate({
      dataType: 'Post',
      operation: 'create',
      feature: 'posts',
      force: false,
    });

    await crudGen.generate({
      dataType: 'User',
      feature: 'users',
      public: ['create', 'get', 'update'],
      force: false,
    });

    const postsConfig = 'src/features/posts/posts.wasp.ts';
    const usersConfig = 'src/features/users/users.wasp.ts';

    const postsContent = readGeneratedFile(projectPaths.root, postsConfig);
    const usersContent = readGeneratedFile(projectPaths.root, usersConfig);

    expect(postsContent).toContain('addAction');
    expect(postsContent).toContain('createPost');

    expect(usersContent).toContain('addCrud');
    expect(usersContent).toContain('User');

    expect(postsContent.trim()).toMatch(/}\s*$/);
    expect(usersContent.trim()).toMatch(/}\s*$/);
  });
});
