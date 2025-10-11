import type { FileSystem, Logger } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it } from 'vitest';
import { FeatureDirectoryGenerator, JobGenerator } from '../src';
import { createTestSetup } from './utils';

describe('Job Generation Tests', () => {
  let fs: FileSystem;
  let logger: Logger;
  let featureGenerator: FeatureDirectoryGenerator;
  let jobGenerator: JobGenerator;

  beforeEach(async () => {
    const setup = createTestSetup();
    fs = setup.fs;
    logger = setup.logger;

    // Initialize generators
    featureGenerator = new FeatureDirectoryGenerator(logger, fs);
    jobGenerator = new JobGenerator(logger, fs, featureGenerator);

    // Create feature first
    featureGenerator.generate({ path: 'documents' });
  });

  it('should create a scheduled job', async () => {
    await jobGenerator.generate({
      feature: 'documents',
      name: 'archiveDocuments',
      entities: ['Document'],
      cron: '0 2 * * *', // Daily at 2 AM
      args: '{}',
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should create a job without schedule', async () => {
    await jobGenerator.generate({
      feature: 'documents',
      name: 'processDocument',
      entities: ['Document'],
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle duplicate job creation without force', async () => {
    // Create job first time
    await jobGenerator.generate({
      feature: 'documents',
      name: 'archiveDocuments',
      entities: ['Document'],
      force: false,
    });

    // Try to create again without force - should throw error
    await expect(
      jobGenerator.generate({
        feature: 'documents',
        name: 'archiveDocuments',
        entities: ['Document'],
        force: false,
      })
    ).rejects.toThrow('job worker already exists');
  });

  it('should overwrite job with force flag', async () => {
    // Create job first time
    await jobGenerator.generate({
      feature: 'documents',
      name: 'archiveDocuments',
      entities: ['Document'],
      force: false,
    });

    // Overwrite with force
    await jobGenerator.generate({
      feature: 'documents',
      name: 'archiveDocuments',
      entities: ['Document'],
      force: true,
    });

    // Job generation triggers multiple success messages
    expect(logger.success).toHaveBeenCalled();
  });
});
