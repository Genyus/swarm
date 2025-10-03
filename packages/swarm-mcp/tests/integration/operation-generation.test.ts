import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { mockFileSystemTools } from './mock-filesystem.js';
import {
  mockSwarmFunctions,
  resetSwarmMocks,
  setupSwarmMocks,
} from './mock-swarm-functions.js';
import { IntegrationTestEnvironment } from './setup.js';

// Mock the Swarm functions before importing them
mockSwarmFunctions();

import { ActionOperation, QueryOperation } from '@ingenyus/swarm-core';
import { SwarmTools } from '../../src/server/tools/swarm.js';

describe('Operation Generation Integration Tests', () => {
  let testEnv: IntegrationTestEnvironment;
  let mockSwarm: any;
  let swarmTools: SwarmTools;

  beforeAll(async () => {
    mockSwarmFunctions();
    mockSwarm = await setupSwarmMocks();
    swarmTools = mockSwarm.mockSwarmToolsInstance;
  });

  beforeEach(async () => {
    testEnv = new IntegrationTestEnvironment();

    // Setup mocks
    mockFileSystemTools(testEnv);

    // Setup test project
    await testEnv.setup('withEntities');

    mockSwarm.mockSwarmToolsInstance.generateAction.mockClear();
    mockSwarm.mockSwarmToolsInstance.generateQuery.mockClear();

    mockSwarm.mockSwarmToolsInstance.generateAction.mockImplementation(
      (params: any) => {
        return Promise.resolve({
          success: true,
          output: `Successfully generated action: ${params.operation} for ${params.dataType}`,
          generatedFiles: ['src/operations/user.ts'],
          modifiedFiles: [],
        });
      }
    );

    mockSwarm.mockSwarmToolsInstance.generateQuery.mockImplementation(
      (params: any) => {
        return Promise.resolve({
          success: true,
          output: `Successfully generated query: ${params.operation} for ${params.dataType}`,
          generatedFiles: ['src/operations/user.ts'],
          modifiedFiles: [],
        });
      }
    );
  });

  afterEach(async () => {
    await testEnv.teardown();
    resetSwarmMocks(mockSwarm);
  });

  describe('Query Operations', () => {
    it('should generate a get query operation', async () => {
      const params = {
        feature: 'users',
        operation: 'get' as QueryOperation,
        dataType: 'User',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateQuery(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated query: get for User'
      );
      expect(
        mockSwarm.mockSwarmToolsInstance.generateQuery
      ).toHaveBeenCalledWith(params);
    });

    it('should generate a getAll query operation', async () => {
      const params = {
        feature: 'posts',
        operation: 'getAll' as QueryOperation,
        dataType: 'Post',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateQuery(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated query: getAll for Post'
      );
      expect(
        mockSwarm.mockSwarmToolsInstance.generateQuery
      ).toHaveBeenCalledWith(params);
    });

    it('should generate a query operation with entities', async () => {
      const params = {
        feature: 'posts',
        operation: 'get' as QueryOperation,
        dataType: 'Post',
        entities: ['Post', 'User', 'Category'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateQuery(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated query: get for Post'
      );
      expect(
        mockSwarm.mockSwarmToolsInstance.generateQuery
      ).toHaveBeenCalledWith(params);
    });
  });

  describe('Action Operations', () => {
    it('should generate a create action operation', async () => {
      const params = {
        feature: 'users',
        operation: 'create' as ActionOperation,
        dataType: 'User',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateAction(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated action: create for User'
      );
      expect(
        mockSwarm.mockSwarmToolsInstance.generateAction
      ).toHaveBeenCalledWith(params);
    });

    it('should generate an update action operation', async () => {
      const params = {
        feature: 'posts',
        operation: 'update' as ActionOperation,
        dataType: 'Post',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateAction(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated action: update for Post'
      );
      expect(
        mockSwarm.mockSwarmToolsInstance.generateAction
      ).toHaveBeenCalledWith(params);
    });

    it('should generate a delete action operation', async () => {
      const params = {
        feature: 'comments',
        operation: 'delete' as ActionOperation,
        dataType: 'Comment',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateAction(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated action: delete for Comment'
      );
      expect(
        mockSwarm.mockSwarmToolsInstance.generateAction
      ).toHaveBeenCalledWith(params);
    });

    it('should generate an action operation with entities', async () => {
      const params = {
        feature: 'posts',
        operation: 'create' as ActionOperation,
        dataType: 'Post',
        entities: ['Post', 'User', 'Category'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateAction(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated action: create for Post'
      );
      expect(
        mockSwarm.mockSwarmToolsInstance.generateAction
      ).toHaveBeenCalledWith(params);
    });
  });

  describe('Feature Integration', () => {
    it('should generate operations for different features', async () => {
      const features = ['users', 'posts', 'comments', 'categories'];
      const operations = ['get', 'create', 'update', 'delete'] as (
        | ActionOperation
        | QueryOperation
      )[];

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

          // Use appropriate method based on operation type
          const isQuery = operation === 'get' || operation === 'getAll';
          const result = isQuery
            ? await swarmTools.generateQuery({
                ...params,
                operation: operation as QueryOperation,
              })
            : await swarmTools.generateAction({
                ...params,
                operation: operation as ActionOperation,
              });

          expect(result.success).toBe(true);
          expect(
            isQuery
              ? mockSwarm.mockSwarmToolsInstance.generateQuery
              : mockSwarm.mockSwarmToolsInstance.generateAction
          ).toHaveBeenCalledWith(
            isQuery
              ? { ...params, operation: operation as QueryOperation }
              : { ...params, operation: operation as ActionOperation }
          );
        }
      }
    });

    it('should handle sub-feature operations', async () => {
      const params = {
        feature: 'users/admin',
        operation: 'get' as QueryOperation,
        dataType: 'User',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateQuery(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated query: get for User'
      );
      expect(
        mockSwarm.mockSwarmToolsInstance.generateQuery
      ).toHaveBeenCalledWith(params);
    });
  });

  describe('Data Type Handling', () => {
    it('should generate operations for different data types', async () => {
      const dataTypes = ['User', 'Post', 'Comment', 'Category', 'Tag'];
      const operation = 'get' as QueryOperation;

      for (const dataType of dataTypes) {
        const params = {
          feature: 'main',
          operation,
          dataType,
          projectPath: testEnv.tempProjectDir,
        };

        const result = await swarmTools.generateQuery(params);
        expect(result.success).toBe(true);
        expect(
          mockSwarm.mockSwarmToolsInstance.generateQuery
        ).toHaveBeenCalledWith(params);
      }
    });

    it('should handle complex data type names', async () => {
      const params = {
        feature: 'analytics',
        operation: 'get' as QueryOperation,
        dataType: 'UserAnalytics',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateQuery(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated query: get for UserAnalytics'
      );
      expect(
        mockSwarm.mockSwarmToolsInstance.generateQuery
      ).toHaveBeenCalledWith(params);
    });
  });

  describe('Entity Relationships', () => {
    it('should generate operations with related entities', async () => {
      const params = {
        feature: 'posts',
        operation: 'get' as QueryOperation,
        dataType: 'Post',
        entities: ['Post', 'User', 'Category', 'Tag'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateQuery(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated query: get for Post'
      );
      expect(
        mockSwarm.mockSwarmToolsInstance.generateQuery
      ).toHaveBeenCalledWith(params);
    });

    it('should handle operations with single entity', async () => {
      const params = {
        feature: 'users',
        operation: 'create' as ActionOperation,
        dataType: 'User',
        entities: ['User'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateAction(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated action: create for User'
      );
      expect(
        mockSwarm.mockSwarmToolsInstance.generateAction
      ).toHaveBeenCalledWith(params);
    });
  });

  describe('Complex Scenarios', () => {
    it('should generate comprehensive operations with all parameters', async () => {
      const params = {
        feature: 'ecommerce/products',
        operation: 'update' as ActionOperation,
        dataType: 'Product',
        entities: ['Product', 'Category', 'Inventory', 'Pricing'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateAction(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated action: update for Product'
      );
      expect(
        mockSwarm.mockSwarmToolsInstance.generateAction
      ).toHaveBeenCalledWith(params);
    });

    it('should handle operations for nested feature structures', async () => {
      const params = {
        feature: 'admin/users/permissions',
        operation: 'get' as QueryOperation,
        dataType: 'UserPermission',
        entities: ['User', 'Permission', 'Role'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateQuery(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated query: get for UserPermission'
      );
      expect(
        mockSwarm.mockSwarmToolsInstance.generateQuery
      ).toHaveBeenCalledWith(params);
    });
  });

  describe('Error Handling', () => {
    it('should handle operation generation errors gracefully', async () => {
      mockSwarm.mockSwarmToolsInstance.generateQuery.mockRejectedValue(
        new Error('Operation generation failed')
      );

      const params = {
        feature: 'users',
        operation: 'get' as QueryOperation,
        dataType: 'User',
        projectPath: testEnv.tempProjectDir,
      };

      await expect(swarmTools.generateQuery(params)).rejects.toThrow(
        'Operation generation failed'
      );
    });
  });

  describe('Project Integration', () => {
    it('should work with different project templates', async () => {
      await testEnv.teardown();
      await testEnv.setup('minimal');

      const params = {
        feature: 'main',
        operation: 'get' as QueryOperation,
        dataType: 'Data',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateQuery(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated query: get for Data'
      );
    });

    it('should work with projects containing entities', async () => {
      await testEnv.teardown();
      await testEnv.setup('withEntities');

      const params = {
        feature: 'users',
        operation: 'create' as ActionOperation,
        dataType: 'User',
        entities: ['User', 'Profile'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateAction(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain(
        'Successfully generated action: create for User'
      );
    });
  });
});
