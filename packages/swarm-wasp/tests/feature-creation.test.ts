import type { FileSystem, Logger } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FeatureDirectoryGenerator } from '../src';
import { createTestSetup } from './utils';

describe('Feature Creation Tests', () => {
  let fs: FileSystem;
  let logger: Logger;
  let featureGenerator: FeatureDirectoryGenerator;

  beforeEach(() => {
    const setup = createTestSetup();
    fs = setup.fs;
    logger = setup.logger;

    // Initialize generator
    featureGenerator = new FeatureDirectoryGenerator(logger, fs);
  });

  it('should create a top-level feature with config', async () => {
    featureGenerator.generate({ path: 'documents' });

    // Check that the success message was logged, which indicates the feature was generated
    expect(logger.success).toHaveBeenCalledWith(
      expect.stringContaining('Generated feature: features/documents')
    );
  });

  it('should create a sub-feature without config', async () => {
    // First create parent feature
    featureGenerator.generate({ path: 'documents' });

    // Now create sub-feature - this should succeed since parent exists
    featureGenerator.generate({ path: 'documents/admin' });

    // Check that the success message was logged for the sub-feature
    expect(logger.success).toHaveBeenCalledWith(
      expect.stringContaining(
        'Generated feature: features/documents/features/admin'
      )
    );
  });

  it('should fail to create sub-feature without parent', async () => {
    // Reset the existsSync mock to not find the parent directory
    const mockExistsSync = vi.mocked(fs.existsSync);
    mockExistsSync.mockImplementation((path: string) => {
      // Return true for schema.prisma files
      if (path.endsWith('schema.prisma')) {
        return true;
      }
      // Return false for all other paths (including parent directories)
      return false;
    });

    await expect(
      featureGenerator.generate({ path: 'documents/admin' })
    ).rejects.toThrow();

    // Restore the original mock behavior
    mockExistsSync.mockImplementation((path: string) => {
      // Return true for schema.prisma files
      if (path.endsWith('schema.prisma')) {
        return true;
      }
      // Return true for parent feature directories that exist
      if (path.includes('/mock/wasp-root/src/features/documents')) {
        return true;
      }
      // Return false for other paths (like non-existent parent directories)
      return false;
    });
  });
});
