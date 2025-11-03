import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FeatureGenerator, JobGenerator } from '../src';
import { realFileSystem } from '../src/common';
import {
  countOccurrences,
  createTestGenerator,
  createTestWaspProject,
  readGeneratedFile,
  type TestProjectPaths,
} from './utils';

describe('Job Generator Integration Tests', () => {
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

  it('should generate job with proper structure', async () => {
    const featureGen = createTestGenerator(FeatureGenerator, {
      fileSystem: realFileSystem,
    });
    const jobGen = createTestGenerator(JobGenerator, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await jobGen.generate({
      feature: 'posts',
      name: 'cleanupPosts',
      cron: '0 0 * * *',
      force: false,
    });

    const jobPath = 'src/features/posts/server/jobs/cleanupPosts.ts';
    const content = readGeneratedFile(projectPaths.root, jobPath);

    expect(content).toContain('export const cleanupPosts');
    expect(content).toContain('async (_args, _context) =>');
  });

  it('should generate job config with cron schedule', async () => {
    const featureGen = createTestGenerator(FeatureGenerator, {
      fileSystem: realFileSystem,
    });
    const jobGen = createTestGenerator(JobGenerator, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await jobGen.generate({
      feature: 'posts',
      name: 'cleanupPosts',
      cron: '0 0 * * *',
      force: false,
    });

    const configPath = 'src/features/posts/feature.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    expect(content).toContain('addJob');
    expect(content).toContain('cleanupPosts');
    expect(content).toContain('cron: "0 0 * * *"');
  });

  it('should generate job with custom args', async () => {
    const featureGen = createTestGenerator(FeatureGenerator, {
      fileSystem: realFileSystem,
    });
    const jobGen = createTestGenerator(JobGenerator, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await jobGen.generate({
      feature: 'posts',
      name: 'processPosts',
      cron: '*/5 * * * *',
      args: JSON.stringify({ batchSize: 10, priority: 'high' }),
      force: false,
    });

    const configPath = 'src/features/posts/feature.wasp.ts';
    const content = readGeneratedFile(projectPaths.root, configPath);

    expect(content).toContain('args: {"batchSize":10,"priority":"high"}');
  });

  it('should not duplicate job in config without force flag', async () => {
    const featureGen = createTestGenerator(FeatureGenerator, {
      fileSystem: realFileSystem,
    });
    const jobGen = createTestGenerator(JobGenerator, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await jobGen.generate({
      feature: 'posts',
      name: 'testJob',
      cron: '0 0 * * *',
      force: false,
    });

    const configPath = 'src/features/posts/feature.wasp.ts';
    const contentBefore = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesBefore = countOccurrences(contentBefore, 'testJob');

    await expect(
      jobGen.generate({
        feature: 'posts',
        name: 'testJob',
        cron: '0 0 * * *',
        force: false,
      })
    ).rejects.toThrow();

    const contentAfter = readGeneratedFile(projectPaths.root, configPath);
    const occurrencesAfter = countOccurrences(contentAfter, 'testJob');

    expect(occurrencesAfter).toBe(occurrencesBefore);
  });
});
