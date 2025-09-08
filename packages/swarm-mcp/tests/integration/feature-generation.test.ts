import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  mockSwarmFunctions,
  resetSwarmMocks,
  setSwarmError,
  setupSwarmMocks,
} from './mock-swarm-functions.js';
import { IntegrationTestEnvironment } from './setup.js';
import { IntegrationValidator } from './validator.js';

// Mock the Swarm functions before importing them
mockSwarmFunctions();

import { realFileSystem } from '@ingenyus/swarm-cli/dist/utils/filesystem.js';
import { realLogger } from '@ingenyus/swarm-cli/dist/utils/logger.js';
import { SwarmTools } from '../../src/server/tools/swarm.js';

describe('Feature Generation Integration', () => {
  let testEnv: IntegrationTestEnvironment;
  let validator: IntegrationValidator;
  let mockSwarm: any;
  let swarmTools: SwarmTools;

  beforeAll(() => {
    swarmTools = SwarmTools.create(realLogger, realFileSystem);
  });

  beforeEach(async () => {
    testEnv = new IntegrationTestEnvironment();
    await testEnv.setup('withEntities');
    validator = new IntegrationValidator(testEnv);
    mockSwarm = await setupSwarmMocks();
  });

  afterEach(async () => {
    resetSwarmMocks(mockSwarm);
    await testEnv.teardown();
  });

  describe('Feature Generation', () => {
    it('should generate feature successfully', async () => {
      const result = await swarmTools.generateFeature({
        name: 'UserProfile',
      });

      expect(result.success).toBe(true);
      expect(result.output).toContain('Feature generated successfully');
      expect(result.generatedFiles).toBeDefined();

      expect(
        mockSwarm.mockSwarmToolsInstance.generateFeature
      ).toHaveBeenCalledWith({
        name: 'UserProfile',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle feature generation errors gracefully', async () => {
      setSwarmError(mockSwarm, 'generateFeature', 'Invalid feature name');

      await expect(
        swarmTools.generateFeature({
          name: 'invalid@feature',
        })
      ).rejects.toThrow('Invalid feature name');
    });

    it('should handle component generation errors', async () => {
      setSwarmError(
        mockSwarm,
        'generateFeature',
        'Invalid component specified'
      );

      await expect(
        swarmTools.generateFeature({
          name: 'test-feature',
        })
      ).rejects.toThrow('Invalid component specified');
    });
  });

  describe('Project Integration', () => {
    it('should integrate generated features with project structure', async () => {
      const result = await swarmTools.generateFeature({
        name: 'IntegrationFeature',
      });

      expect(result.success).toBe(true);

      const isValid = await validator.validateProjectCompilation();
      expect(isValid).toBe(true);
    });

    it('should maintain project consistency after feature generation', async () => {
      const beforeFiles = await testEnv.listFiles('src');

      await swarmTools.generateFeature({
        name: 'ConsistencyFeature',
      });

      const afterFiles = await testEnv.listFiles('src');
      expect(afterFiles.length).toBeGreaterThanOrEqual(beforeFiles.length);
    });

    it('should generate features compatible with existing entities', async () => {
      const result = await swarmTools.generateFeature({
        name: 'EntityCompatibleFeature',
      });

      expect(result.success).toBe(true);

      await validator.validateIntegrationPoints();
    });
  });
});
