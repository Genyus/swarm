import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
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

describe('API Generation Integration', () => {
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

      expect(mockSwarm.mockSwarmToolsInstance.generateApi).toHaveBeenCalledTimes(4);

      const calls = mockSwarm.mockSwarmToolsInstance.generateApi.mock.calls;
      for (let i = 0; i < methods.length; i++) {
        expect(calls[i][0]).toMatchObject({
          name: `User${methods[i]}API`,
          method: methods[i],
          route: `/api/users/${methods[i].toLowerCase()}`,
          entities: ['User'],
          auth: true,
          force: false,
          projectPath: testEnv.tempProjectDir,
        });
      }
    });

    it('should generate API with entity relationships', async () => {
      const result = await swarmTools.generateApi({
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

      expect(mockSwarm.mockSwarmToolsInstance.generateApi).toHaveBeenCalledWith({
        name: 'UserPostAPI',
        method: 'POST',
        route: '/api/users/posts',
        entities: ['User', 'Post'],
        auth: true,
        force: false,
        projectPath: testEnv.tempProjectDir,
      });
    });

    it('should handle API generation with authentication', async () => {
      const result = await swarmTools.generateApi({
        name: 'ProtectedUserAPI',
        method: 'GET',
        route: '/api/users/protected',
        entities: ['User'],
        auth: true,
        force: false,
        projectPath: testEnv.tempProjectDir,
      });

      expect(result.success).toBe(true);

      expect(mockSwarm.mockSwarmToolsInstance.generateApi).toHaveBeenCalledWith({
        name: 'ProtectedUserAPI',
        method: 'GET',
        route: '/api/users/protected',
        entities: ['User'],
        auth: true,
        force: false,
        projectPath: testEnv.tempProjectDir,
      });
    });

    it('should handle API generation without authentication', async () => {
      const result = await swarmTools.generateApi({
        name: 'PublicUserAPI',
        method: 'GET',
        route: '/api/users/public',
        entities: ['User'],
        auth: false,
        force: false,
        projectPath: testEnv.tempProjectDir,
      });

      expect(result.success).toBe(true);

      expect(mockSwarm.mockSwarmToolsInstance.generateApi).toHaveBeenCalledWith({
        name: 'PublicUserAPI',
        method: 'GET',
        route: '/api/users/public',
        entities: ['User'],
        auth: false,
        force: false,
        projectPath: testEnv.tempProjectDir,
      });
    });
  });

  describe('API Namespace Generation', () => {
    it('should generate API namespace with proper structure', async () => {
      const result = await swarmTools.generateApiNamespace({
        name: 'v1',
        path: '/api/v1',
        force: false,
        projectPath: testEnv.tempProjectDir,
      });

      expect(result.success).toBe(true);
      expect(result.output).toContain('API namespace generated successfully');

      expect(mockSwarm.mockSwarmToolsInstance.generateApiNamespace).toHaveBeenCalledWith({
        name: 'v1',
        path: '/api/v1',
        force: false,
        projectPath: testEnv.tempProjectDir,
      });
    });

    it('should handle nested API namespace generation', async () => {
      const result = await swarmTools.generateApiNamespace({
        name: 'admin',
        path: '/api/v1/admin',
        force: false,
        projectPath: testEnv.tempProjectDir,
      });

      expect(result.success).toBe(true);

      expect(mockSwarm.mockSwarmToolsInstance.generateApiNamespace).toHaveBeenCalledWith({
        name: 'admin',
        path: '/api/v1/admin',
        force: false,
        projectPath: testEnv.tempProjectDir,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API generation errors gracefully', async () => {
      setSwarmError(mockSwarm, 'generateApi', 'Invalid entity specified');

      await expect(
        swarmTools.generateApi({
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
      setSwarmError(
        mockSwarm,
        'generateApiNamespace',
        'Invalid namespace path'
      );

      await expect(
        swarmTools.generateApiNamespace({
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
        name: 'ExistingAPI',
        method: 'GET',
        route: '/api/existing',
        entities: ['User'],
        auth: false,
        force: true,
        projectPath: testEnv.tempProjectDir,
      });

      expect(result.success).toBe(true);

      expect(mockSwarm.mockSwarmToolsInstance.generateApi).toHaveBeenCalledWith({
        name: 'ExistingAPI',
        method: 'GET',
        route: '/api/existing',
        entities: ['User'],
        auth: false,
        force: true,
        projectPath: testEnv.tempProjectDir,
      });
    });
  });

  describe('Project Integration', () => {
    it('should integrate generated APIs with project structure', async () => {
      const result = await swarmTools.generateApi({
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
