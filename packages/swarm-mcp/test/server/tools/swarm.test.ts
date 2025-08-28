import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  swarmAnalyzeProject,
  swarmGenerateAPI,
  swarmGenerateApiNamespace,
  swarmGenerateCRUD,
  swarmGenerateFeature,
  swarmGenerateJob,
  swarmGenerateOperation,
  swarmGenerateRoute,
  swarmValidateConfig,
} from '../../../src/server/tools/swarm.js';

// Mock the child_process module
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

// Mock the fs module
vi.mock('node:fs', () => ({
  default: {
    readdirSync: vi.fn(),
    statSync: vi.fn(),
  },
}));

const mockSpawn = vi.mocked(spawn);
const mockFs = vi.mocked(fs);

describe('Swarm Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('swarmGenerateAPI', () => {
    it('should validate required parameters', async () => {
      await expect(swarmGenerateAPI({})).rejects.toThrow();
    });

    it('should validate parameter types', async () => {
      const invalidParams = {
        name: 123, // should be string
        method: 'INVALID', // should be valid HTTP method
        route: '', // should not be empty
      };

      await expect(swarmGenerateAPI(invalidParams)).rejects.toThrow();
    });

    it('should accept valid parameters', async () => {
      const validParams = {
        name: 'UserAPI',
        method: 'GET',
        route: '/api/users',
        entities: ['User'],
        auth: true,
        force: false,
      };

      // Mock successful command execution
      const mockProcess = {
        stdout: {
          on: vi.fn((event, callback) => {
            if (event === 'data') {
              callback(Buffer.from('API generated successfully'));
            }
          }),
        },
        stderr: {
          on: vi.fn(),
        },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0); // success exit code
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      // Mock file system operations for tracking
      mockFs.readdirSync
        .mockReturnValueOnce([]) // before scan
        .mockReturnValueOnce([
          { name: 'UserAPI.ts', isFile: () => true, isDirectory: () => false },
        ] as any); // after scan

      mockFs.statSync.mockReturnValue({ mtime: new Date() } as any);

      const result = await swarmGenerateAPI(validParams);

      expect(result.success).toBe(true);
      expect(result.output).toContain('UserAPI');
      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        expect.arrayContaining(['swarm', 'api', '--name', 'UserAPI']),
        expect.any(Object)
      );
    });

    it('should handle command execution errors', async () => {
      const validParams = {
        name: 'UserAPI',
        method: 'GET',
        route: '/api/users',
      };

      // Mock failed command execution
      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(1); // error exit code
          } else if (event === 'error') {
            callback(new Error('Command failed'));
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      await expect(swarmGenerateAPI(validParams)).rejects.toThrow(
        'SWARM_API_GENERATION_FAILED'
      );
    });

    it('should build correct command arguments', async () => {
      const params = {
        name: 'ProductAPI',
        method: 'POST',
        route: '/api/products',
        entities: ['Product', 'Category'],
        auth: true,
        force: true,
      };

      // Mock successful command execution
      const mockProcess = {
        stdout: {
          on: vi.fn((event, callback) => {
            if (event === 'data') {
              callback(Buffer.from('Success'));
            }
          }),
        },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      // Mock empty file scans
      mockFs.readdirSync.mockReturnValue([]);

      await swarmGenerateAPI(params);

      // Verify the command was called with correct arguments
      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        [
          'swarm',
          'api',
          '--name',
          'ProductAPI',
          '--method',
          'POST',
          '--route',
          '/api/products',
          '--entities',
          'Product,Category',
          '--auth',
          '--force',
        ],
        expect.any(Object)
      );
    });

    it('should generate feature with correct parameters', async () => {
      const params = {
        name: 'UserDashboard',
        dataType: 'User',
        components: ['UserList', 'UserForm'],
        withTests: true,
        force: false,
      };

      // Mock successful command execution
      const mockProcess = {
        stdout: {
          on: vi.fn((event, callback) => {
            if (event === 'data') {
              callback(Buffer.from('Feature generated successfully'));
            }
          }),
        },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      // Mock file scans
      mockFs.readdirSync
        .mockReturnValueOnce([]) // before scan
        .mockReturnValueOnce([
          {
            name: 'UserDashboard.tsx',
            isFile: () => true,
            isDirectory: () => false,
          },
        ] as any); // after scan

      mockFs.statSync.mockReturnValue({ mtime: new Date() } as any);

      const result = await swarmGenerateFeature(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('UserDashboard');
      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        [
          'swarm',
          'feature',
          '--name',
          'UserDashboard',
          '--data-type',
          'User',
          '--components',
          'UserList,UserForm',
          '--with-tests',
        ],
        expect.any(Object)
      );
    });

    it('should generate CRUD operations with correct parameters', async () => {
      const params = {
        dataType: 'Product',
        public: ['create', 'read'],
        exclude: ['delete'],
        force: true,
      };

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProcess as any);
      mockFs.readdirSync.mockReturnValue([]);

      await swarmGenerateCRUD(params);

      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        [
          'swarm',
          'crud',
          '--data-type',
          'Product',
          '--public',
          'create,read',
          '--exclude',
          'delete',
          '--force',
        ],
        expect.any(Object)
      );
    });

    it('should generate job with correct parameters', async () => {
      const params = {
        name: 'EmailSender',
        schedule: '0 9 * * *',
        entities: ['User', 'Email'],
        force: false,
      };

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProcess as any);
      mockFs.readdirSync.mockReturnValue([]);

      await swarmGenerateJob(params);

      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        [
          'swarm',
          'job',
          '--name',
          'EmailSender',
          '--schedule',
          '0 9 * * *',
          '--entities',
          'User,Email',
        ],
        expect.any(Object)
      );
    });

    it('should generate operation with correct parameters', async () => {
      const params = {
        feature: 'UserManagement',
        operation: 'create',
        dataType: 'User',
        entities: ['User', 'Profile'],
      };

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProcess as any);
      mockFs.readdirSync.mockReturnValue([]);

      await swarmGenerateOperation(params);

      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        [
          'swarm',
          'operation',
          '--feature',
          'UserManagement',
          '--operation',
          'create',
          '--data-type',
          'User',
          '--entities',
          'User,Profile',
        ],
        expect.any(Object)
      );
    });

    it('should generate route with correct parameters', async () => {
      const params = {
        name: 'UserProfile',
        path: '/user/:id/profile',
        force: true,
      };

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProcess as any);
      mockFs.readdirSync.mockReturnValue([]);

      await swarmGenerateRoute(params);

      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        [
          'swarm',
          'route',
          '--name',
          'UserProfile',
          '--path',
          '/user/:id/profile',
          '--force',
        ],
        expect.any(Object)
      );
    });

    it('should analyze project with correct parameters', async () => {
      const params = {
        deep: true,
        projectPath: '/test/project',
      };

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      await swarmAnalyzeProject(params);

      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        ['swarm', 'analyze', '--project-path', '/test/project', '--deep'],
        expect.any(Object)
      );
    });

    it('should validate config with correct parameters', async () => {
      const params = {
        strict: true,
        configPath: './custom.wasp',
        projectPath: '/test/project',
      };

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      await swarmValidateConfig(params);

      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        ['swarm', 'validate', '--config-path', './custom.wasp', '--strict'],
        expect.any(Object)
      );
    });

    it('should generate API namespace with correct parameters', async () => {
      const params = {
        name: 'UserAPI',
        path: '/api/users',
        force: true,
      };

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockProcess as any);
      mockFs.readdirSync.mockReturnValue([]);

      await swarmGenerateApiNamespace(params);

      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        [
          'swarm',
          'api-namespace',
          '--name',
          'UserAPI',
          '--path',
          '/api/users',
          '--force',
        ],
        expect.any(Object)
      );
    });
  });
});
