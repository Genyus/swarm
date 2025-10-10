import type { IFileSystem, Logger } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it } from 'vitest';
import { FeatureDirectoryGenerator, RouteGenerator } from '../src';
import { createTestSetup } from './utils';

describe('Route Generation Tests', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGenerator: FeatureDirectoryGenerator;
  let routeGenerator: RouteGenerator;

  beforeEach(async () => {
    const setup = createTestSetup();
    fs = setup.fs;
    logger = setup.logger;

    // Initialize generators
    featureGenerator = new FeatureDirectoryGenerator(logger, fs);
    routeGenerator = new RouteGenerator(logger, fs, featureGenerator);

    // Create feature first
    featureGenerator.generateFeature('documents');
  });

  it('should create a route with default settings', async () => {
    await routeGenerator.generate({
      feature: 'documents',
      name: 'Documents',
      path: '/documents',
      force: false,
    });

    // Route generator creates page files and updates config
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should create a route with auth required', async () => {
    await routeGenerator.generate({
      feature: 'documents',
      path: '/documents/admin',
      name: 'AdminPage',
      auth: true,
      force: false,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('should handle duplicate route creation without force', async () => {
    await routeGenerator.generate({
      feature: 'documents',
      name: 'Documents',
      path: '/documents',
      force: false,
    });

    // Create again without force - should throw error
    await expect(
      routeGenerator.generate({
        feature: 'documents',
        name: 'Documents',
        path: '/documents',
        force: false,
      })
    ).rejects.toThrow('Page file already exists');
  });

  it('should overwrite route with force flag', async () => {
    await routeGenerator.generate({
      feature: 'documents',
      name: 'Documents',
      path: '/documents',
      force: false,
    });

    await routeGenerator.generate({
      feature: 'documents',
      name: 'Documents',
      path: '/documents',
      force: true,
    });

    // Route generator creates files and updates config
    expect(logger.success).toHaveBeenCalled();
  });
});
