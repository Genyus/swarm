import type { Buffer as NodeBuffer } from 'node:buffer';
import type { Dirent, PathLike, Stats } from 'node:fs';
import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { realLogger } from '../../../utils/logger';

// Mock the GeneratorService before importing SwarmTools
vi.mock('../types/generator-service.js', () => ({
  GeneratorService: {
    create: vi.fn(() => ({
      generateFeature: vi.fn().mockResolvedValue(undefined),
      generateApi: vi.fn().mockResolvedValue(undefined),
      generateCrud: vi.fn().mockResolvedValue(undefined),
      generateRoute: vi.fn().mockResolvedValue(undefined),
      generateJob: vi.fn().mockResolvedValue(undefined),
      generateOperation: vi.fn().mockResolvedValue(undefined),
      generateApiNamespace: vi.fn().mockResolvedValue(undefined),
    })),
  },
}));

// Import SwarmTools after mocking
import {
  ActionOperation,
  CrudOperation,
  HttpMethod,
  QueryOperation,
} from '../../../types/constants';
import { SwarmTools } from './swarm.js';

vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));
vi.mock('node:fs', () => ({
  default: {
    readdirSync: vi.fn(),
    statSync: vi.fn(),
    existsSync: vi.fn().mockImplementation((path: string) => {
      // Mock a Wasp project by returning true for wasp.json
      if (path.endsWith('wasp.json')) {
        return true;
      }
      return false;
    }),
    mkdirSync: vi.fn(),
    copyFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));
// No need to mock internal logger module: we pass a mocked logger instance directly

const mockFs = vi.mocked(fs);
const mockLogger = vi.mocked(realLogger);
const swarmTools = SwarmTools.create(mockLogger, mockFs);

describe('Swarm Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('swarmGenerateApi', () => {
    it('should accept valid parameters', async () => {
      const validParams = {
        feature: 'user-dashboard',
        name: 'UserAPI',
        method: 'GET' as HttpMethod,
        route: '/api/users',
        entities: ['User'],
        auth: true,
        force: false,
      };

      mockFs.readdirSync
        .mockReturnValueOnce([]) // before scan
        .mockReturnValueOnce([
          {
            name: 'UserAPI.ts',
            isFile: (): boolean => true,
            isDirectory: (): boolean => false,
          },
        ] as unknown as Dirent<NodeBuffer>[]); // after scan

      mockFs.statSync.mockReturnValue({
        mtime: new Date(),
      } as unknown as Stats);

      const result = await swarmTools.generateApi(validParams);

      expect(result.success).toBe(true);
      expect(result.output).toContain('UserAPI');
    });

    it('should handle command execution errors', async () => {
      const validParams = {
        feature: 'user-dashboard',
        name: 'UserAPI',
        method: 'GET' as HttpMethod,
        route: '/api/users',
      };
      const result = await swarmTools.generateApi(validParams);

      expect(result.success).toBe(true);
    });

    it('should build correct command arguments', async () => {
      const params = {
        feature: 'catalog',
        name: 'ProductAPI',
        method: 'POST' as HttpMethod,
        route: '/api/products',
        entities: ['Product', 'Category'],
        auth: true,
        force: true,
      };

      mockFs.readdirSync.mockReturnValue([]);
      await swarmTools.generateApi(params);
    });

    it('should generate feature with correct parameters', async () => {
      const params = {
        name: 'user-dashboard', // Use kebab-case as required by Swarm CLI
      };

      mockFs.existsSync.mockImplementation((path: PathLike) => {
        return path.toString().endsWith('.wasproot');
      });

      mockFs.readdirSync
        .mockReturnValueOnce([]) // before scan
        .mockReturnValueOnce([
          {
            name: 'UserDashboard.tsx',
            isFile: (): boolean => true,
            isDirectory: (): boolean => false,
          },
        ] as unknown as Dirent<NodeBuffer>[]); // after scan

      mockFs.statSync.mockReturnValue({
        mtime: new Date(),
      } as unknown as Stats);

      const result = await swarmTools.generateFeature(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('user-dashboard');
    });

    it('should generate CRUD operations with correct parameters', async () => {
      const params = {
        feature: 'catalog',
        name: 'Product', // Changed from dataType to name
        public: ['create', 'get'] as CrudOperation[],
        exclude: ['delete'] as CrudOperation[],
        force: true,
      };

      mockFs.readdirSync.mockReturnValue([]);

      const result = await swarmTools.generateCrud(params);

      expect(result.success).toBe(true);
    });

    it('should generate job with correct parameters', async () => {
      const params = {
        feature: 'user-dashboard',
        name: 'EmailSender',
        cron: '0 9 * * *', // Changed from schedule to cron
        entities: ['User', 'Email'],
        force: false,
      };

      mockFs.readdirSync.mockReturnValue([]);

      const result = await swarmTools.generateJob(params);

      expect(result.success).toBe(true);
    });

    it('should generate action with correct parameters', async () => {
      const params = {
        feature: 'UserManagement',
        operation: 'create' as ActionOperation,
        dataType: 'User',
        entities: ['User', 'Profile'],
      };

      mockFs.readdirSync.mockReturnValue([]);

      const result = await swarmTools.generateAction(params);

      expect(result.success).toBe(true);
    });

    it('should generate query with correct parameters', async () => {
      const params = {
        feature: 'UserManagement',
        operation: 'get' as QueryOperation,
        dataType: 'User',
        entities: ['User', 'Profile'],
      };

      mockFs.readdirSync.mockReturnValue([]);

      const result = await swarmTools.generateQuery(params);

      expect(result.success).toBe(true);
    });

    it('should generate route with correct parameters', async () => {
      const params = {
        feature: 'user-dashboard',
        name: 'UserProfile',
        path: '/user/:id/profile',
        force: true,
      };

      mockFs.readdirSync.mockReturnValue([]);

      const result = await swarmTools.generateRoute(params);

      expect(result.success).toBe(true);
    });

    it('should generate API namespace with correct parameters', async () => {
      const params = {
        feature: 'api-root',
        name: 'UserAPI',
        path: '/api/users',
        force: true,
      };

      mockFs.readdirSync.mockReturnValue([]);

      const result = await swarmTools.generateApiNamespace(params);

      expect(result.success).toBe(true);
    });
  });
});
