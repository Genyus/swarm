import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

import {
  swarmGenerateApi,
  swarmGenerateApiNamespace,
} from '../../src/server/tools/swarm.js';

describe('API Generation Integration', () => {
  let testEnv: IntegrationTestEnvironment;
  let validator: IntegrationValidator;
  let mockSwarm: any;

  beforeEach(async () => {
    testEnv = new IntegrationTestEnvironment();
    await testEnv.setup('withEntities');
    validator = new IntegrationValidator(testEnv);
    mockSwarm = setupSwarmMocks();
  });

  afterEach(async () => {
    resetSwarmMocks(mockSwarm);
    await testEnv.teardown();
  });

  describe('Basic API Generation', () => {
    it('should generate complete REST API with all HTTP methods', async () => {
      const methods: Array<'GET' | 'POST' | 'PUT' | 'DELETE'> = [
        'GET',
        'POST',
        'PUT',
        'DELETE',
      ];

      for (const method of methods) {
        const result = await swarmGenerateApi({
          name: `User${method}API`,
          method,
          route: `/api/users/${method.toLowerCase()}`,
          entities: ['User'],
          auth: true,
          force: false,
        });

        expect(result.success).toBe(true);
        expect(result.output).toContain('API generated successfully');
      }

      expect(mockSwarm.swarmGenerateAPI).toHaveBeenCalledTimes(4);

      // Verify the calls were made with correct parameters
      const calls = mockSwarm.swarmGenerateAPI.mock.calls;
      for (let i = 0; i < methods.length; i++) {
        expect(calls[i][0]).toMatchObject({
          name: `User${methods[i]}API`,
          method: methods[i],
          route: `/api/users/${methods[i].toLowerCase()}`,
          entities: ['User'],
          auth: true,
          force: false,
        });
      }
    });

    it('should generate API with entity relationships', async () => {
      const result = await swarmGenerateApi({
        name: 'UserPostAPI',
        method: 'POST',
        route: '/api/users/posts',
        entities: ['User', 'Post'],
        auth: true,
        force: false,
      });

      expect(result.success).toBe(true);
      expect(result.generatedFiles).toBeDefined();
      expect(result.generatedFiles!.length).toBeGreaterThan(0);

      expect(mockSwarm.swarmGenerateAPI).toHaveBeenCalledWith({
        name: 'UserPostAPI',
        method: 'POST',
        route: '/api/users/posts',
        entities: ['User', 'Post'],
        auth: true,
        force: false,
      });
    });

    it('should handle API generation with authentication', async () => {
      const result = await swarmGenerateApi({
        name: 'ProtectedUserAPI',
        method: 'GET',
        route: '/api/users/protected',
        entities: ['User'],
        auth: true,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(mockSwarm.swarmGenerateAPI).toHaveBeenCalledWith({
        name: 'ProtectedUserAPI',
        method: 'GET',
        route: '/api/users/protected',
        entities: ['User'],
        auth: true,
        force: false,
      });
    });

    it('should handle API generation without authentication', async () => {
      const result = await swarmGenerateApi({
        name: 'PublicUserAPI',
        method: 'GET',
        route: '/api/users/public',
        entities: ['User'],
        auth: false,
        force: false,
      });

      expect(result.success).toBe(true);

      expect(mockSwarm.swarmGenerateAPI).toHaveBeenCalledWith({
        name: 'PublicUserAPI',
        method: 'GET',
        route: '/api/users/public',
        entities: ['User'],
        auth: false,
        force: false,
      });
    });
  });

  describe('API Namespace Generation', () => {
    it('should generate API namespace with proper structure', async () => {
      const result = await swarmGenerateApiNamespace({
        name: 'v1',
        path: '/api/v1',
        force: false,
      });

      expect(result.success).toBe(true);
      expect(result.output).toContain('API namespace generated successfully');

      expect(mockSwarm.swarmGenerateApiNamespace).toHaveBeenCalledWith({
        name: 'v1',
        path: '/api/v1',
        force: false,
      });
    });

    it('should handle nested API namespace generation', async () => {
      const result = await swarmGenerateApiNamespace({
        name: 'admin',
        path: '/api/v1/admin',
        force: false,
      });

      expect(result.success).toBe(true);

      expect(mockSwarm.swarmGenerateApiNamespace).toHaveBeenCalledWith({
        name: 'admin',
        path: '/api/v1/admin',
        force: false,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API generation errors gracefully', async () => {
      setSwarmError(mockSwarm, 'swarmGenerateAPI', 'Invalid entity specified');

      await expect(
        swarmGenerateApi({
          name: 'InvalidAPI',
          method: 'GET',
          route: '/api/invalid',
          entities: ['NonExistentEntity'],
          auth: false,
          force: false,
        })
      ).rejects.toThrow('Invalid entity specified');
    });

    it('should handle namespace generation errors', async () => {
      setSwarmError(
        mockSwarm,
        'swarmGenerateApiNamespace',
        'Invalid namespace path'
      );

      await expect(
        swarmGenerateApiNamespace({
          name: 'invalid',
          path: '/invalid/path',
          force: false,
        })
      ).rejects.toThrow('Invalid namespace path');
    });
  });

  describe('Force Overwrite', () => {
    it('should handle force overwrite for existing APIs', async () => {
      await testEnv.addFile('src/api/existing.ts', '// Existing API content');

      const result = await swarmGenerateApi({
        name: 'ExistingAPI',
        method: 'GET',
        route: '/api/existing',
        entities: ['User'],
        auth: false,
        force: true,
      });

      expect(result.success).toBe(true);

      expect(mockSwarm.swarmGenerateAPI).toHaveBeenCalledWith({
        name: 'ExistingAPI',
        method: 'GET',
        route: '/api/existing',
        entities: ['User'],
        auth: false,
        force: true,
      });
    });
  });

  describe('Project Integration', () => {
    it('should integrate generated APIs with project structure', async () => {
      const result = await swarmGenerateApi({
        name: 'IntegrationAPI',
        method: 'ALL',
        route: '/api/integration',
        entities: ['User', 'Post'],
        auth: true,
        force: false,
      });

      expect(result.success).toBe(true);

      const isValid = await validator.validateProjectCompilation();
      expect(isValid).toBe(true);
    });

    it('should maintain project consistency after API generation', async () => {
      const beforeFiles = await testEnv.listFiles('src');

      await swarmGenerateApi({
        name: 'ConsistencyAPI',
        method: 'GET',
        route: '/api/consistency',
        entities: ['User'],
        auth: false,
        force: false,
      });

      const afterFiles = await testEnv.listFiles('src');
      expect(afterFiles.length).toBeGreaterThanOrEqual(beforeFiles.length);
    });
  });
});
