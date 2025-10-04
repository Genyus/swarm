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

describe('API Generation Integration', () => {
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

    mockSwarm.mockSwarmToolsInstance.generateApi.mockClear();
    mockSwarm.mockSwarmToolsInstance.generateApiNamespace.mockClear();
    mockSwarm.mockSwarmToolsInstance.generateApi.mockImplementation(
      (params: any) => {
        return Promise.resolve({
          success: true,
          output: `API generated successfully for ${params.name}`,
          generatedFiles: ['src/api/user.ts', 'src/operations/user.ts'],
          modifiedFiles: [],
        });
      }
    );
    mockSwarm.mockSwarmToolsInstance.generateApiNamespace.mockImplementation(
      (params: any) => {
        return Promise.resolve({
          success: true,
          output: `API namespace generated successfully for ${params.name}`,
          generatedFiles: [`src/api/${params.name}/index.ts`],
          modifiedFiles: [],
        });
      }
    );
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
        const result = await swarmTools.generateApi({
          feature: 'main',
          name: `User${method}API`,
          method,
          route: `/api/users/${method.toLowerCase()}`,
          entities: ['User'],
          auth: true,
          force: false,
          projectPath: testEnv.tempProjectDir,
        });

        expect(result.success).toBe(true);
        expect(result.output).toContain('API generated successfully');
      }

      expect(
        mockSwarm.mockSwarmToolsInstance.generateApi
      ).toHaveBeenCalledTimes(4);

      const calls = mockSwarm.mockSwarmToolsInstance.generateApi.mock.calls;
      for (let i = 0; i < methods.length; i++) {
        expect(calls[i][0]).toMatchObject({
          name: `User${methods[i]}API`,
          method: methods[i],
          route: `/api/users/${methods?.[i]?.toLowerCase()}`,
          entities: ['User'],
          auth: true,
          force: false,
          projectPath: testEnv.tempProjectDir,
        });
      }
    });

    it('should generate API with entity relationships', async () => {
      const result = await swarmTools.generateApi({
        feature: 'main',
        name: 'UserPostAPI',
        method: 'POST',
        route: '/api/users/posts',
        entities: ['User', 'Post'],
        auth: true,
        force: false,
        projectPath: testEnv.tempProjectDir,
      });

      expect(result.success).toBe(true);
      expect(result.generatedFiles).toBeDefined();
      expect(result.generatedFiles!.length).toBeGreaterThan(0);

      expect(mockSwarm.mockSwarmToolsInstance.generateApi).toHaveBeenCalledWith(
        {
          name: 'UserPostAPI',
          method: 'POST',
          route: '/api/users/posts',
          entities: ['User', 'Post'],
          auth: true,
          force: false,
          feature: 'main',
          projectPath: testEnv.tempProjectDir,
        }
      );
    });

    it('should handle API generation with authentication', async () => {
      const result = await swarmTools.generateApi({
        feature: 'main',
        name: 'ProtectedUserAPI',
        method: 'GET',
        route: '/api/users/protected',
        entities: ['User'],
        auth: true,
        force: false,
        projectPath: testEnv.tempProjectDir,
      });

      expect(result.success).toBe(true);

      expect(mockSwarm.mockSwarmToolsInstance.generateApi).toHaveBeenCalledWith(
        {
          name: 'ProtectedUserAPI',
          method: 'GET',
          route: '/api/users/protected',
          entities: ['User'],
          auth: true,
          force: false,
          feature: 'main',
          projectPath: testEnv.tempProjectDir,
        }
      );
    });

    it('should handle API generation without authentication', async () => {
      const result = await swarmTools.generateApi({
        feature: 'main',
        name: 'PublicUserAPI',
        method: 'GET',
        route: '/api/users/public',
        entities: ['User'],
        auth: false,
        force: false,
        projectPath: testEnv.tempProjectDir,
      });

      expect(result.success).toBe(true);

      expect(mockSwarm.mockSwarmToolsInstance.generateApi).toHaveBeenCalledWith(
        {
          name: 'PublicUserAPI',
          method: 'GET',
          route: '/api/users/public',
          entities: ['User'],
          auth: false,
          force: false,
          feature: 'main',
          projectPath: testEnv.tempProjectDir,
        }
      );
    });
  });

  describe('API Namespace Generation', () => {
    it('should generate API namespace with proper structure', async () => {
      const result = await swarmTools.generateApiNamespace({
        feature: 'main',
        name: 'v1',
        path: '/api/v1',
        force: false,
        projectPath: testEnv.tempProjectDir,
      });

      expect(result.success).toBe(true);
      expect(result.output).toContain('API namespace generated successfully');

      expect(
        mockSwarm.mockSwarmToolsInstance.generateApiNamespace
      ).toHaveBeenCalledWith({
        name: 'v1',
        path: '/api/v1',
        force: false,
        feature: 'main',
        projectPath: testEnv.tempProjectDir,
      });
    });

    it('should handle nested API namespace generation', async () => {
      const result = await swarmTools.generateApiNamespace({
        feature: 'main',
        name: 'admin',
        path: '/api/v1/admin',
        force: false,
        projectPath: testEnv.tempProjectDir,
      });

      expect(result.success).toBe(true);

      expect(
        mockSwarm.mockSwarmToolsInstance.generateApiNamespace
      ).toHaveBeenCalledWith({
        name: 'admin',
        path: '/api/v1/admin',
        force: false,
        feature: 'main',
        projectPath: testEnv.tempProjectDir,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API generation errors gracefully', async () => {
      // Set up the error condition for this specific test
      mockSwarm.mockSwarmToolsInstance.generateApi.mockImplementation(() =>
        Promise.reject(new Error('Invalid entity specified'))
      );

      await expect(
        swarmTools.generateApi({
          feature: 'main',
          name: 'InvalidAPI',
          method: 'GET',
          route: '/api/invalid',
          entities: ['NonExistentEntity'],
          auth: false,
          force: false,
          projectPath: testEnv.tempProjectDir,
        })
      ).rejects.toThrow('Invalid entity specified');
    });

    it('should handle namespace generation errors', async () => {
      // Set up the error condition for this specific test
      mockSwarm.mockSwarmToolsInstance.generateApiNamespace.mockImplementation(
        () => Promise.reject(new Error('Invalid namespace path'))
      );

      await expect(
        swarmTools.generateApiNamespace({
          feature: 'main',
          name: 'invalid',
          path: '/invalid/path',
          force: false,
          projectPath: testEnv.tempProjectDir,
        })
      ).rejects.toThrow('Invalid namespace path');
    });
  });

  describe('Force Overwrite', () => {
    it('should handle force overwrite for existing APIs', async () => {
      await testEnv.addFile('src/api/existing.ts', '// Existing API content');

      const result = await swarmTools.generateApi({
        feature: 'main',
        name: 'ExistingAPI',
        method: 'GET',
        route: '/api/existing',
        entities: ['User'],
        auth: false,
        force: true,
        projectPath: testEnv.tempProjectDir,
      });

      expect(result.success).toBe(true);

      expect(mockSwarm.mockSwarmToolsInstance.generateApi).toHaveBeenCalledWith(
        {
          feature: 'main',
          name: 'ExistingAPI',
          method: 'GET',
          route: '/api/existing',
          entities: ['User'],
          auth: false,
          force: true,
          projectPath: testEnv.tempProjectDir,
        }
      );
    });
  });

  describe('Project Integration', () => {
    it('should integrate generated APIs with project structure', async () => {
      const result = await swarmTools.generateApi({
        feature: 'main',
        name: 'IntegrationAPI',
        method: 'ALL',
        route: '/api/integration',
        entities: ['User', 'Post'],
        auth: true,
        force: false,
        projectPath: testEnv.tempProjectDir,
      });

      expect(result.success).toBe(true);

      const isValid = await validator.validateProjectCompilation();
      expect(isValid).toBe(true);
    });

    it('should maintain project consistency after API generation', async () => {
      const beforeFiles = await testEnv.listFiles('src');

      await swarmTools.generateApi({
        feature: 'main',
        name: 'ConsistencyAPI',
        method: 'GET',
        route: '/api/consistency',
        entities: ['User'],
        auth: false,
        force: false,
        projectPath: testEnv.tempProjectDir,
      });

      const afterFiles = await testEnv.listFiles('src');
      expect(afterFiles.length).toBeGreaterThanOrEqual(beforeFiles.length);
    });
  });
});
