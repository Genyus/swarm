import type { IFileSystem, Logger } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ApiGenerator, FeatureDirectoryGenerator } from '../src';
import { createTestSetup } from './utils';

describe('API Generation Tests', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGenerator: FeatureDirectoryGenerator;
  let apiGenerator: ApiGenerator;

  beforeEach(async () => {
    const setup = createTestSetup();
    fs = setup.fs;
    logger = setup.logger;

    // Initialize generators
    featureGenerator = new FeatureDirectoryGenerator(logger, fs);
    apiGenerator = new ApiGenerator(logger, fs, featureGenerator);

    // Create feature first
    featureGenerator.generateFeature('documents');
  });

  it('should create an API endpoint', async () => {
    await apiGenerator.generate({
      feature: 'documents',
      name: 'searchApi',
      method: 'GET',
      route: '/api/documents/search',
      entities: ['Document'],
      auth: false,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should create an authenticated API endpoint', async () => {
    await apiGenerator.generate({
      feature: 'documents',
      name: 'createDocument',
      method: 'POST',
      route: '/api/documents',
      entities: ['Document'],
      auth: true,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle duplicate API creation without force', async () => {
    // Create API first time
    await apiGenerator.generate({
      feature: 'documents',
      name: 'searchApi',
      method: 'GET',
      route: '/api/documents/search',
      entities: ['Document'],
      auth: false,
      force: false,
    });

    // Try to create again without force - should throw error
    await expect(
      apiGenerator.generate({
        feature: 'documents',
        name: 'searchApi',
        method: 'GET',
        route: '/api/documents/search',
        entities: ['Document'],
        auth: false,
        force: false,
      })
    ).rejects.toThrow('API endpoint file already exists');
  });

  it('should overwrite API with force flag', async () => {
    // Create API first time
    await apiGenerator.generate({
      feature: 'documents',
      name: 'searchApi',
      method: 'GET',
      route: '/api/documents/search',
      entities: ['Document'],
      auth: false,
      force: false,
    });

    // Overwrite with force
    await apiGenerator.generate({
      feature: 'documents',
      name: 'searchApi',
      method: 'GET',
      route: '/api/documents/search',
      entities: ['Document'],
      auth: false,
      force: true,
    });

    expect(logger.success).toHaveBeenCalled();
  });
});
