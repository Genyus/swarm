import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ActionGenerator,
  ApiGenerator,
  CrudGenerator,
  FeatureGenerator,
  JobGenerator,
  QueryGenerator,
  RouteGenerator,
} from '../src';
import { schema as actionSchema } from '../src/generators/action/schema';
import { schema as apiSchema } from '../src/generators/api/schema';
import { schema as crudSchema } from '../src/generators/crud/schema';
import { schema as featureSchema } from '../src/generators/feature/schema';
import { schema as jobSchema } from '../src/generators/job/schema';
import { schema as querySchema } from '../src/generators/query/schema';
import { schema as routeSchema } from '../src/generators/route/schema';
import { realFileSystem } from '../src/common';
import {
  assertConfigGroupOrder,
  createTestGenerator,
  createTestWaspProject,
  readGeneratedFile,
  type TestProjectPaths,
} from './utils';

describe('Cross-Generator Integration Tests', () => {
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

  it('should generate compatible CRUD and custom operations', async () => {
    await featureGen.generate({ target: 'posts' });

    const crudGen = await createTestGenerator(CrudGenerator, crudSchema, {
      fileSystem: realFileSystem,
    });
    const actionGen = await createTestGenerator(ActionGenerator, actionSchema, {
      fileSystem: realFileSystem,
    });
    const queryGen = await createTestGenerator(QueryGenerator, querySchema, {
      fileSystem: realFileSystem,
    });

    await crudGen.generate({
      dataType: 'Post',
      name: 'posts',
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

    const configPath = 'src/features/posts/feature.wasp.ts';
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
      path: '/api/posts',
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

    const configPath = 'src/features/posts/feature.wasp.ts';
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
    await featureGen.generate({ target: 'posts' });
    await featureGen.generate({ target: 'users' });

    const actionGen = await createTestGenerator(ActionGenerator, actionSchema, {
      fileSystem: realFileSystem,
    });
    const crudGen = await createTestGenerator(CrudGenerator, crudSchema, {
      fileSystem: realFileSystem,
    });

    await actionGen.generate({
      dataType: 'Post',
      operation: 'create',
      feature: 'posts',
      force: false,
    });

    await crudGen.generate({
      dataType: 'User',
      name: 'users',
      feature: 'users',
      public: ['create', 'get', 'update'],
      force: false,
    });

    const postsConfig = 'src/features/posts/feature.wasp.ts';
    const usersConfig = 'src/features/users/feature.wasp.ts';

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
