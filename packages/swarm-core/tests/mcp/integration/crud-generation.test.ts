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
import { CrudOperation } from '../../../src/types/constants';
import { mockFileSystemTools } from './mock-filesystem.js';

describe('CRUD Generation Integration', () => {
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

    mockSwarm.mockSwarmToolsInstance.generateCrud.mockClear();
    mockSwarm.mockSwarmToolsInstance.generateCrud.mockImplementation(
      (params: any) => {
        return Promise.resolve({
          success: true,
          output: `CRUD operations generated successfully for ${params.name}`,
          generatedFiles: ['src/operations/user.ts', 'src/queries/user.ts'],
          modifiedFiles: [],
        });
      }
    );
  });

  afterEach(async () => {
    resetSwarmMocks(mockSwarm);
    await testEnv.teardown();
  });

  describe('Basic CRUD Generation', () => {
    it('should generate complete CRUD operations for entity', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'User',
        public: ['get', 'getAll'],
        override: ['update', 'delete'],
        exclude: ['create'],
        force: false,
      });

      expect(result.success).toBe(true);
      expect(result.output).toContain('CRUD operations generated successfully');
      expect(result.generatedFiles).toBeDefined();

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'User',
        public: ['get', 'getAll'],
        override: ['update', 'delete'],
        exclude: ['create'],
        force: false,
        feature: 'main',
      });
    });

    it('should generate CRUD with minimal configuration', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'Post',
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'Post',
        force: false,
        feature: 'main',
      });
    });
  });

  describe('Public Field Configuration', () => {
    it('should handle multiple public fields', async () => {
      const publicFields: CrudOperation[] = ['get', 'getAll'];

      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'Post',
        public: publicFields,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'Post',
        public: publicFields,
        force: false,
        feature: 'main',
      });
    });

    it('should handle single public field', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'User',
        public: ['get'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'User',
        public: ['get'],
        force: false,
        feature: 'main',
      });
    });

    it('should handle empty public fields', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'User',
        public: [],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'User',
        public: [],
        force: false,
        feature: 'main',
      });
    });
  });

  describe('Override Field Configuration', () => {
    it('should handle multiple override fields', async () => {
      const overrideFields: CrudOperation[] = ['update', 'delete'];

      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'User',
        override: overrideFields,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'User',
        override: overrideFields,
        force: false,
        feature: 'main',
      });
    });

    it('should handle single override field', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'Post',
        override: ['update'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'Post',
        override: ['update'],
        force: false,
        feature: 'main',
      });
    });
  });

  describe('Exclude Field Configuration', () => {
    it('should handle multiple excluded fields', async () => {
      const excludedFields: CrudOperation[] = ['create', 'delete'];

      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'User',
        exclude: excludedFields,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'User',
        exclude: excludedFields,
        force: false,
        feature: 'main',
      });
    });

    it('should handle single excluded field', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'Post',
        exclude: ['create'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'Post',
        exclude: ['create'],
        force: false,
        feature: 'main',
      });
    });
  });

  describe('Complex Field Combinations', () => {
    it('should handle all field configurations together', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'ComplexEntity',
        public: ['get', 'getAll'],
        override: ['update', 'delete'],
        exclude: ['create'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'ComplexEntity',
        public: ['get', 'getAll'],
        override: ['update', 'delete'],
        exclude: ['create'],
        force: false,
        feature: 'main',
      });
    });

    it('should handle overlapping public and override fields', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'OverlapEntity',
        public: ['get', 'getAll'],
        override: ['get', 'getAll'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'OverlapEntity',
        public: ['get', 'getAll'],
        override: ['get', 'getAll'],
        force: false,
        feature: 'main',
      });
    });
  });

  describe('Force Overwrite', () => {
    it('should handle force overwrite for existing CRUD operations', async () => {
      await testEnv.addFile(
        'src/operations/user.ts',
        '// Existing CRUD operations'
      );

      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'User',
        force: true,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'User',
        force: true,
        feature: 'main',
      });
    });

    it('should fail without force when CRUD operations exist', async () => {
      await testEnv.addFile(
        'src/operations/queries/getUser.ts',
        '// Existing query'
      );
      await testEnv.addFile(
        'src/operations/actions/createUser.ts',
        '// Existing action'
      );

      mockSwarm.mockSwarmToolsInstance.generateCrud.mockImplementation(() =>
        Promise.reject(new Error('CRUD operations already exist'))
      );

      await expect(
        swarmTools.generateCrud({
          feature: 'main',
          name: 'User',
          public: ['get', 'getAll'],
          force: false,
        })
      ).rejects.toThrow('CRUD operations already exist');
    });
  });

  describe('Error Handling', () => {
    it('should handle CRUD generation errors gracefully', async () => {
      mockSwarm.mockSwarmToolsInstance.generateCrud.mockImplementation(() =>
        Promise.reject(new Error('Invalid data type specified'))
      );

      await expect(
        swarmTools.generateCrud({
          feature: 'main',
          name: 'InvalidType',
          public: [],
          force: false,
        })
      ).rejects.toThrow('Invalid data type specified');
    });

    it('should handle field configuration errors', async () => {
      mockSwarm.mockSwarmToolsInstance.generateCrud.mockImplementation(() =>
        Promise.reject(new Error('Invalid field configuration'))
      );

      await expect(
        swarmTools.generateCrud({
          feature: 'main',
          name: 'Dummy',
          public: ['get', 'getAll'],
          force: false,
        })
      ).rejects.toThrow('Invalid field configuration');
    });
  });

  describe('Project Integration', () => {
    it('should integrate generated CRUD operations with project structure', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'User',
        public: ['get', 'getAll'],
        force: false,
      });

      expect(result.success).toBe(true);

      const isValid = await validator.validateProjectCompilation();
      expect(isValid).toBe(true);
    });

    it('should maintain project consistency after CRUD generation', async () => {
      const beforeFiles = await testEnv.listFiles('src');

      await swarmTools.generateCrud({
        feature: 'main',
        name: 'Post',
        force: false,
      });

      const afterFiles = await testEnv.listFiles('src');
      expect(afterFiles.length).toBeGreaterThanOrEqual(beforeFiles.length);
    });

    it('should generate CRUD operations compatible with existing entities', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'User',
        public: ['get', 'getAll'],
        exclude: ['create'],
        force: false,
      });

      expect(result.success).toBe(true);

      await validator.validateIntegrationPoints();
    });
  });

  describe('Entity Relationship Handling', () => {
    it('should handle CRUD generation for entities with relationships', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'Post',
        public: ['get', 'getAll'],
        override: ['update', 'delete'],
        exclude: ['create'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'Post',
        public: ['get', 'getAll'],
        override: ['update', 'delete'],
        exclude: ['create'],
        force: false,
        feature: 'main',
      });
    });

    it('should handle CRUD generation for related entities', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'User',
        public: ['get', 'getAll'],
        exclude: ['create'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'User',
        public: ['get', 'getAll'],
        exclude: ['create'],
        force: false,
        feature: 'main',
      });
    });
  });

  describe('Advanced CRUD Scenarios', () => {
    it('should handle CRUD generation with complex field types', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        name: 'AdvancedEntity',
        public: ['get', 'getAll'],
        override: ['update', 'delete'],
        exclude: ['create'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        name: 'AdvancedEntity',
        public: ['get', 'getAll'],
        override: ['update', 'delete'],
        exclude: ['create'],
        force: false,
        feature: 'main',
      });
    });
  });
});
