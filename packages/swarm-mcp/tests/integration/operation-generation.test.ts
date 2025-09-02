import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { mockFileSystemTools } from './mock-filesystem.js';
import {
  mockSwarmFunctions,
  resetSwarmMocks,
  setSwarmError,
  setupSwarmMocks,
} from './mock-swarm-functions.js';
import { IntegrationTestEnvironment } from './setup.js';

// Mock the Swarm functions before importing them
mockSwarmFunctions();

import { realFileSystem } from '@ingenyus/swarm-cli/dist/utils/filesystem.js';
import { realLogger } from '@ingenyus/swarm-cli/dist/utils/logger.js';
import { SwarmTools } from '../../src/server/tools/swarm.js';

describe('Operation Generation Integration Tests', () => {
  let testEnv: IntegrationTestEnvironment;
  let mockSwarm: any;
  let swarmTools: SwarmTools;

  beforeAll(() => {
    swarmTools = SwarmTools.create(realLogger, realFileSystem);
  });

  beforeEach(async () => {
    testEnv = new IntegrationTestEnvironment();

    // Setup mocks
    mockSwarmFunctions();
    mockSwarm = await setupSwarmMocks();
    mockFileSystemTools(testEnv);

    // Setup test project
    await testEnv.setup('withEntities');
  });

  afterEach(async () => {
    await testEnv.teardown();
    resetSwarmMocks(mockSwarm);
  });

  describe('Query Operations', () => {
    it('should generate a get query operation', async () => {
      const params = {
        feature: 'users',
        operation: 'get',
        dataType: 'User',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
      expect(
        mockSwarm.mockSwarmToolsInstance.generateOperation
      ).toHaveBeenCalledWith(params);
    });

    it('should generate a getAll query operation', async () => {
      const params = {
        feature: 'posts',
        operation: 'getAll',
        dataType: 'Post',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
      expect(
        mockSwarm.mockSwarmToolsInstance.generateOperation
      ).toHaveBeenCalledWith(params);
    });

    it('should generate a query operation with entities', async () => {
      const params = {
        feature: 'posts',
        operation: 'get',
        dataType: 'Post',
        entities: ['Post', 'User', 'Category'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
      expect(
        mockSwarm.mockSwarmToolsInstance.generateOperation
      ).toHaveBeenCalledWith(params);
    });
  });

  describe('Action Operations', () => {
    it('should generate a create action operation', async () => {
      const params = {
        feature: 'users',
        operation: 'create',
        dataType: 'User',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
      expect(
        mockSwarm.mockSwarmToolsInstance.generateOperation
      ).toHaveBeenCalledWith(params);
    });

    it('should generate an update action operation', async () => {
      const params = {
        feature: 'posts',
        operation: 'update',
        dataType: 'Post',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
      expect(
        mockSwarm.mockSwarmToolsInstance.generateOperation
      ).toHaveBeenCalledWith(params);
    });

    it('should generate a delete action operation', async () => {
      const params = {
        feature: 'comments',
        operation: 'delete',
        dataType: 'Comment',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
      expect(
        mockSwarm.mockSwarmToolsInstance.generateOperation
      ).toHaveBeenCalledWith(params);
    });

    it('should generate an action operation with entities', async () => {
      const params = {
        feature: 'posts',
        operation: 'create',
        dataType: 'Post',
        entities: ['Post', 'User', 'Category'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
      expect(
        mockSwarm.mockSwarmToolsInstance.generateOperation
      ).toHaveBeenCalledWith(params);
    });
  });

  describe('Feature Integration', () => {
    it('should generate operations for different features', async () => {
      const features = ['users', 'posts', 'comments', 'categories'];
      const operations = ['get', 'create', 'update', 'delete'];

      for (const feature of features) {
        for (const operation of operations) {
          const params = {
            feature,
            operation,
            dataType:
              feature.slice(0, -1).charAt(0).toUpperCase() +
              feature.slice(0, -1).slice(1), // Singular form
            projectPath: testEnv.tempProjectDir,
          };

          const result = await swarmTools.generateOperation(params);
          expect(result.success).toBe(true);
          expect(
            mockSwarm.mockSwarmToolsInstance.generateOperation
          ).toHaveBeenCalledWith(params);
        }
      }
    });

    it('should handle sub-feature operations', async () => {
      const params = {
        feature: 'users/admin',
        operation: 'get',
        dataType: 'User',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
      expect(
        mockSwarm.mockSwarmToolsInstance.generateOperation
      ).toHaveBeenCalledWith(params);
    });
  });

  describe('Data Type Handling', () => {
    it('should generate operations for different data types', async () => {
      const dataTypes = ['User', 'Post', 'Comment', 'Category', 'Tag'];
      const operation = 'get';

      for (const dataType of dataTypes) {
        const params = {
          feature: 'main',
          operation,
          dataType,
          projectPath: testEnv.tempProjectDir,
        };

        const result = await swarmTools.generateOperation(params);
        expect(result.success).toBe(true);
        expect(
          mockSwarm.mockSwarmToolsInstance.generateOperation
        ).toHaveBeenCalledWith(params);
      }
    });

    it('should handle complex data type names', async () => {
      const params = {
        feature: 'analytics',
        operation: 'get',
        dataType: 'UserAnalytics',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
      expect(
        mockSwarm.mockSwarmToolsInstance.generateOperation
      ).toHaveBeenCalledWith(params);
    });
  });

  describe('Entity Relationships', () => {
    it('should generate operations with related entities', async () => {
      const params = {
        feature: 'posts',
        operation: 'get',
        dataType: 'Post',
        entities: ['Post', 'User', 'Category', 'Tag'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
      expect(
        mockSwarm.mockSwarmToolsInstance.generateOperation
      ).toHaveBeenCalledWith(params);
    });

    it('should handle operations with single entity', async () => {
      const params = {
        feature: 'users',
        operation: 'create',
        dataType: 'User',
        entities: ['User'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
      expect(
        mockSwarm.mockSwarmToolsInstance.generateOperation
      ).toHaveBeenCalledWith(params);
    });
  });

  describe('Complex Scenarios', () => {
    it('should generate comprehensive operations with all parameters', async () => {
      const params = {
        feature: 'ecommerce/products',
        operation: 'update',
        dataType: 'Product',
        entities: ['Product', 'Category', 'Inventory', 'Pricing'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
      expect(
        mockSwarm.mockSwarmToolsInstance.generateOperation
      ).toHaveBeenCalledWith(params);
    });

    it('should handle operations for nested feature structures', async () => {
      const params = {
        feature: 'admin/users/permissions',
        operation: 'get',
        dataType: 'UserPermission',
        entities: ['User', 'Permission', 'Role'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
      expect(
        mockSwarm.mockSwarmToolsInstance.generateOperation
      ).toHaveBeenCalledWith(params);
    });
  });

  describe('Error Handling', () => {
    it('should handle operation generation errors gracefully', async () => {
      setSwarmError(
        mockSwarm,
        'generateOperation',
        'Operation generation failed'
      );

      const params = {
        feature: 'users',
        operation: 'get',
        dataType: 'User',
        projectPath: testEnv.tempProjectDir,
      };

      await expect(swarmTools.generateOperation(params)).rejects.toThrow(
        'Operation generation failed'
      );
    });

    it('should handle invalid operation types', async () => {
      const params = {
        feature: 'users',
        operation: 'invalid',
        dataType: 'User',
        projectPath: testEnv.tempProjectDir,
      };

      // This would be handled by the Swarm CLI validation
      const result = await swarmTools.generateOperation(params);
      expect(result.success).toBe(true);
    });
  });

  describe('Project Integration', () => {
    it('should work with different project templates', async () => {
      await testEnv.teardown();
      await testEnv.setup('minimal');

      const params = {
        feature: 'main',
        operation: 'get',
        dataType: 'Data',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
    });

    it('should work with projects containing entities', async () => {
      await testEnv.teardown();
      await testEnv.setup('withEntities');

      const params = {
        feature: 'users',
        operation: 'create',
        dataType: 'User',
        entities: ['User', 'Profile'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateOperation(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Operation generated successfully');
    });
  });
});
