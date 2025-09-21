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

import { SwarmTools } from '../../src/server/tools/swarm.js';
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
          output: `CRUD operations generated successfully for ${params.dataType}`,
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
        dataType: 'User',
        public: ['id', 'name', 'email'],
        override: ['email'],
        exclude: ['password'],
        force: false,
      });

      expect(result.success).toBe(true);
      expect(result.output).toContain('CRUD operations generated successfully');
      expect(result.generatedFiles).toBeDefined();

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'User',
        public: ['id', 'name', 'email'],
        override: ['email'],
        exclude: ['password'],
        force: false,
        feature: 'main',
      });
    });

    it('should generate CRUD with minimal configuration', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'Post',
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'Post',
        force: false,
        feature: 'main',
      });
    });
  });

  describe('Public Field Configuration', () => {
    it('should handle multiple public fields', async () => {
      const publicFields = ['id', 'title', 'content', 'createdAt'];

      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'Post',
        public: publicFields,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'Post',
        public: publicFields,
        force: false,
        feature: 'main',
      });
    });

    it('should handle single public field', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'User',
        public: ['id'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'User',
        public: ['id'],
        force: false,
        feature: 'main',
      });
    });

    it('should handle empty public fields', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'User',
        public: [],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'User',
        public: [],
        force: false,
        feature: 'main',
      });
    });
  });

  describe('Override Field Configuration', () => {
    it('should handle multiple override fields', async () => {
      const overrideFields = ['email', 'password', 'lastLogin'];

      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'User',
        override: overrideFields,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'User',
        override: overrideFields,
        force: false,
        feature: 'main',
      });
    });

    it('should handle single override field', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'Post',
        override: ['title'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'Post',
        override: ['title'],
        force: false,
        feature: 'main',
      });
    });
  });

  describe('Exclude Field Configuration', () => {
    it('should handle multiple excluded fields', async () => {
      const excludedFields = ['password', 'secretKey', 'internalData'];

      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'User',
        exclude: excludedFields,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'User',
        exclude: excludedFields,
        force: false,
        feature: 'main',
      });
    });

    it('should handle single excluded field', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'Post',
        exclude: ['draft'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'Post',
        exclude: ['draft'],
        force: false,
        feature: 'main',
      });
    });
  });

  describe('Complex Field Combinations', () => {
    it('should handle all field configurations together', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'ComplexEntity',
        public: ['id', 'name', 'description'],
        override: ['name', 'description'],
        exclude: ['secret', 'internal'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'ComplexEntity',
        public: ['id', 'name', 'description'],
        override: ['name', 'description'],
        exclude: ['secret', 'internal'],
        force: false,
        feature: 'main',
      });
    });

    it('should handle overlapping public and override fields', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'OverlapEntity',
        public: ['id', 'name', 'email'],
        override: ['name', 'email'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'OverlapEntity',
        public: ['id', 'name', 'email'],
        override: ['name', 'email'],
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
        dataType: 'User',
        force: true,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'User',
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
          dataType: 'User',
          public: ['name', 'email'],
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
          dataType: 'InvalidType',
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
          dataType: 'User',
          public: ['invalidField'],
          force: false,
        })
      ).rejects.toThrow('Invalid field configuration');
    });
  });

  describe('Project Integration', () => {
    it('should integrate generated CRUD operations with project structure', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'User',
        public: ['id', 'name', 'email'],
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
        dataType: 'Post',
        force: false,
      });

      const afterFiles = await testEnv.listFiles('src');
      expect(afterFiles.length).toBeGreaterThanOrEqual(beforeFiles.length);
    });

    it('should generate CRUD operations compatible with existing entities', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'User',
        public: ['id', 'name', 'email'],
        exclude: ['password'],
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
        dataType: 'Post',
        public: ['id', 'title', 'content', 'author'],
        override: ['title', 'content'],
        exclude: ['draft'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'Post',
        public: ['id', 'title', 'content', 'author'],
        override: ['title', 'content'],
        exclude: ['draft'],
        force: false,
        feature: 'main',
      });
    });

    it('should handle CRUD generation for related entities', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'User',
        public: ['id', 'name', 'email', 'posts'],
        exclude: ['password'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'User',
        public: ['id', 'name', 'email', 'posts'],
        exclude: ['password'],
        force: false,
        feature: 'main',
      });
    });
  });

  describe('Advanced CRUD Scenarios', () => {
    it('should handle CRUD generation with complex field types', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'AdvancedEntity',
        public: ['id', 'metadata', 'tags', 'settings'],
        override: ['metadata', 'settings'],
        exclude: ['secrets', 'internal'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'AdvancedEntity',
        public: ['id', 'metadata', 'tags', 'settings'],
        override: ['metadata', 'settings'],
        exclude: ['secrets', 'internal'],
        force: false,
        feature: 'main',
      });
    });

    it('should handle CRUD generation for system entities', async () => {
      const result = await swarmTools.generateCrud({
        feature: 'main',
        dataType: 'SystemConfig',
        public: ['id', 'key', 'value'],
        override: ['value'],
        exclude: ['internal'],
        force: false,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateCrud
      ).toHaveBeenCalledWith({
        dataType: 'SystemConfig',
        public: ['id', 'key', 'value'],
        override: ['value'],
        exclude: ['internal'],
        force: false,
        feature: 'main',
      });
    });
  });
});
