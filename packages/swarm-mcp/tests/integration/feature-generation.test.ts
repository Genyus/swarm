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

  describe('Basic Feature Generation', () => {
    it('should generate complete feature with components and tests', async () => {
      const result = await swarmTools.generateFeature({
        name: 'UserProfile',
        dataType: 'User',
        components: ['Profile', 'Settings', 'Avatar'],
        withTests: true,
        force: false,
      });

      expect(result.success).toBe(true);
      expect(result.output).toContain('Feature generated successfully');
      expect(result.generatedFiles).toBeDefined();

      expect(
        mockSwarm.mockSwarmToolsInstance.generateFeature
      ).toHaveBeenCalledWith({
        name: 'UserProfile',
        dataType: 'User',
        components: ['Profile', 'Settings', 'Avatar'],
        withTests: true,
        force: false,
      });
    });

    it('should generate feature with custom data types', async () => {
      const result = await swarmTools.generateFeature({
        name: 'CustomFeature',
        dataType: 'CustomType',
        components: ['Main'],
        withTests: false,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateFeature
      ).toHaveBeenCalledWith({
        name: 'CustomFeature',
        dataType: 'CustomType',
        components: ['Main'],
        withTests: false,
        force: false,
      });
    });

    it('should generate feature without data type', async () => {
      const result = await swarmTools.generateFeature({
        name: 'SimpleFeature',
        components: ['Simple'],
        withTests: false,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateFeature
      ).toHaveBeenCalledWith({
        name: 'SimpleFeature',
        components: ['Simple'],
        withTests: false,
        force: false,
      });
    });
  });

  describe('Component Generation', () => {
    it('should generate multiple components for feature', async () => {
      const components = ['List', 'Detail', 'Form', 'Card'];

      const result = await swarmTools.generateFeature({
        name: 'MultiComponentFeature',
        components,
        withTests: true,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateFeature
      ).toHaveBeenCalledWith({
        name: 'MultiComponentFeature',
        components,
        withTests: true,
        force: false,
      });
    });

    it('should handle feature with single component', async () => {
      const result = await swarmTools.generateFeature({
        name: 'SingleComponentFeature',
        components: ['Main'],
        withTests: false,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateFeature
      ).toHaveBeenCalledWith({
        name: 'SingleComponentFeature',
        components: ['Main'],
        withTests: false,
        force: false,
      });
    });
  });

  describe('Test Generation', () => {
    it('should generate feature with tests enabled', async () => {
      const result = await swarmTools.generateFeature({
        name: 'TestedFeature',
        components: ['Main'],
        withTests: true,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateFeature
      ).toHaveBeenCalledWith({
        name: 'TestedFeature',
        components: ['Main'],
        withTests: true,
        force: false,
      });
    });

    it('should generate feature without tests', async () => {
      const result = await swarmTools.generateFeature({
        name: 'NoTestFeature',
        components: ['Main'],
        withTests: false,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateFeature
      ).toHaveBeenCalledWith({
        name: 'NoTestFeature',
        components: ['Main'],
        withTests: false,
        force: false,
      });
    });
  });

  describe('Force Overwrite', () => {
    it('should handle force overwrite for existing features', async () => {
      await testEnv.addFile(
        'src/features/ExistingFeature/ExistingFeature.tsx',
        '// Existing feature content'
      );

      const result = await swarmTools.generateFeature({
        name: 'ExistingFeature',
        components: ['Updated'],
        withTests: false,
        force: true,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateFeature
      ).toHaveBeenCalledWith({
        name: 'ExistingFeature',
        components: ['Updated'],
        withTests: false,
        force: true,
      });
    });

    it('should fail without force when feature exists', async () => {
      await testEnv.addFile(
        'src/features/existing-feature',
        '// Existing feature content'
      );

      setSwarmError(mockSwarm, 'generateFeature', 'Feature already exists');

      await expect(
        swarmTools.generateFeature({
          name: 'existing-feature',
          dataType: 'User',
          components: ['UserList', 'UserForm'],
          withTests: true,
          force: false,
        })
      ).rejects.toThrow('Feature already exists');
    });
  });

  describe('Error Handling', () => {
    it('should handle feature generation errors gracefully', async () => {
      setSwarmError(mockSwarm, 'generateFeature', 'Invalid feature name');

      await expect(
        swarmTools.generateFeature({
          name: 'invalid@feature',
          dataType: 'User',
          components: [],
          withTests: false,
          force: false,
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
          dataType: 'User',
          components: ['Invalid@Component'],
          withTests: false,
          force: false,
        })
      ).rejects.toThrow('Invalid component specified');
    });
  });

  describe('Project Integration', () => {
    it('should integrate generated features with project structure', async () => {
      const result = await swarmTools.generateFeature({
        name: 'IntegrationFeature',
        dataType: 'User',
        components: ['Main', 'Detail'],
        withTests: true,
        force: false,
      });

      expect(result.success).toBe(true);

      const isValid = await validator.validateProjectCompilation();
      expect(isValid).toBe(true);
    });

    it('should maintain project consistency after feature generation', async () => {
      const beforeFiles = await testEnv.listFiles('src');

      await swarmTools.generateFeature({
        name: 'ConsistencyFeature',
        components: ['Main'],
        withTests: false,
        force: false,
      });

      const afterFiles = await testEnv.listFiles('src');
      expect(afterFiles.length).toBeGreaterThanOrEqual(beforeFiles.length);
    });

    it('should generate features compatible with existing entities', async () => {
      const result = await swarmTools.generateFeature({
        name: 'EntityCompatibleFeature',
        dataType: 'User',
        components: ['List', 'Detail'],
        withTests: false,
        force: false,
      });

      expect(result.success).toBe(true);

      await validator.validateIntegrationPoints();
    });
  });

  describe('Complex Feature Scenarios', () => {
    it('should handle feature with complex data types', async () => {
      const result = await swarmTools.generateFeature({
        name: 'ComplexFeature',
        dataType: 'ComplexType',
        components: ['Complex', 'Nested', 'Advanced'],
        withTests: true,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateFeature
      ).toHaveBeenCalledWith({
        name: 'ComplexFeature',
        dataType: 'ComplexType',
        components: ['Complex', 'Nested', 'Advanced'],
        withTests: true,
        force: false,
      });
    });

    it('should generate feature with minimal configuration', async () => {
      const result = await swarmTools.generateFeature({
        name: 'MinimalFeature',
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateFeature
      ).toHaveBeenCalledWith({
        name: 'MinimalFeature',
        force: false,
      });
    });
  });
});
