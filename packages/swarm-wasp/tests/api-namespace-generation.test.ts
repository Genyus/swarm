import type { FileSystem, Logger } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it } from 'vitest';
import { ApiNamespaceGenerator, FeatureDirectoryGenerator } from '../src';
import { createTestSetup } from './utils';

describe('API Namespace Generation Tests', () => {
  let fs: FileSystem;
  let logger: Logger;
  let featureGenerator: FeatureDirectoryGenerator;
  let apiNamespaceGenerator: ApiNamespaceGenerator;

  beforeEach(async () => {
    const setup = createTestSetup();
    fs = setup.fs;
    logger = setup.logger;

    // Initialize generators
    featureGenerator = new FeatureDirectoryGenerator(logger, fs);
    apiNamespaceGenerator = new ApiNamespaceGenerator(
      logger,
      fs,
      featureGenerator
    );

    // Create feature first
    featureGenerator.generate({ path: 'documents' });
  });

  it('should create an API namespace with middleware', async () => {
    await apiNamespaceGenerator.generate({
      feature: 'documents',
      name: 'api',
      path: '/api',
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle duplicate API namespace creation without force', async () => {
    // Create API namespace first time
    await apiNamespaceGenerator.generate({
      feature: 'documents',
      name: 'api',
      path: '/api',
      force: false,
    });

    // Try to create again without force - should throw error
    await expect(
      apiNamespaceGenerator.generate({
        feature: 'documents',
        name: 'api',
        path: '/api',
        force: false,
      })
    ).rejects.toThrow('Middleware file already exists');
  });

  it('should overwrite API namespace with force flag', async () => {
    // Create API namespace first time
    await apiNamespaceGenerator.generate({
      feature: 'documents',
      name: 'api',
      path: '/api',
      force: false,
    });

    // Overwrite with force
    await apiNamespaceGenerator.generate({
      feature: 'documents',
      name: 'api',
      path: '/api',
      force: true,
    });

    expect(logger.success).toHaveBeenCalled();
  });
});
