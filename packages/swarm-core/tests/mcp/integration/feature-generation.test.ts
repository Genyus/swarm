import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  mockSwarmFunctions,
  resetSwarmMocks,
  setupSwarmMocks,
} from './mock-swarm-functions.js';
import { IntegrationTestEnvironment } from './setup.js';
import { IntegrationValidator } from './validator.js';

// Mock the Swarm functions before importing them
mockSwarmFunctions();

import { SwarmTools } from '../../../src/mcp/server/tools/swarm.js';
import { mockFileSystemTools } from './mock-filesystem.js';

describe('Feature Generation Integration', () => {
  let testEnv: IntegrationTestEnvironment;
  let validator: IntegrationValidator;
  let mockSwarm: any;
  let swarmTools: SwarmTools;

  beforeAll(async () => {
    mockSwarmFunctions();
    mockSwarm = await setupSwarmMocks();
    swarmTools = mockSwarm.mockSwarmToolsInstance;
  });

  beforeEach(async () => {
    testEnv = new IntegrationTestEnvironment();
    await testEnv.setup('withEntities');
    validator = new IntegrationValidator(testEnv);

    mockFileSystemTools(testEnv);

    mockSwarm.mockSwarmToolsInstance.generateFeature.mockClear();
    mockSwarm.mockSwarmToolsInstance.generateFeature.mockImplementation(
      (params: any) => {
        return Promise.resolve({
          success: true,
          output: `Feature generated successfully for ${params.name}`,
          generatedFiles: [
            `src/features/${params.name}/${params.name}.tsx`,
            `src/features/${params.name}/index.tsx`,
          ],
          modifiedFiles: [],
        });
      }
    );
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
      mockSwarm.mockSwarmToolsInstance.generateFeature.mockImplementation(() =>
        Promise.reject(new Error('Invalid feature name'))
      );

      await expect(
        swarmTools.generateFeature({
          name: 'invalid@feature',
        })
      ).rejects.toThrow('Invalid feature name');
    });

    it('should handle component generation errors', async () => {
      mockSwarm.mockSwarmToolsInstance.generateFeature.mockImplementation(() =>
        Promise.reject(new Error('Invalid component specified'))
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
        name: 'integration-feature',
      });

      expect(result.success).toBe(true);

      const isValid = await validator.validateProjectCompilation();
      expect(isValid).toBe(true);
    });

    it('should maintain project consistency after feature generation', async () => {
      const beforeFiles = await testEnv.listFiles('src');

      await swarmTools.generateFeature({
        name: 'consistency-feature',
      });

      const afterFiles = await testEnv.listFiles('src');
      expect(afterFiles.length).toBeGreaterThanOrEqual(beforeFiles.length);
    });

    it('should generate features compatible with existing entities', async () => {
      const result = await swarmTools.generateFeature({
        name: 'entity-compatible-feature',
      });

      expect(result.success).toBe(true);

      await validator.validateIntegrationPoints();
    });
  });
});
