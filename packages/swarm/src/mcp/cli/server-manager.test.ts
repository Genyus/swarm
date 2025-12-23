import { existsSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServerManager } from './server-manager';

// Mock the MCPManager
vi.mock('../server/mcp-manager', () => ({
  MCPManager: vi.fn(),
}));

// Mock node:fs
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    existsSync: vi.fn(),
  };
});

// Mock logger
vi.mock('../server/utils', async (importOriginal) => ({
  ...(await importOriginal()),
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
  configManager: {
    loadConfig: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('ServerManager', () => {
  let serverManager: ServerManager;
  let mockServer: any;
  let MockedMCPManager: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked SwarmMCPServer
    const { MCPManager } = await import('../server');
    MockedMCPManager = MCPManager as any;

    // Create the mock server instance with proper method setup
    mockServer = {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
    };

    // Set up the mock constructor to return our mock server
    MockedMCPManager.mockImplementation(() => mockServer);

    serverManager = new ServerManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a new server manager instance', () => {
      expect(serverManager).toBeInstanceOf(ServerManager);
      // SwarmMCPServer is not called during construction, only when start() is called
      expect(MockedMCPManager).not.toHaveBeenCalled();
    });

    it('should initialize with server not running', () => {
      expect(serverManager.isServerRunning()).toBe(false);
    });
  });

  describe('start', () => {
    it('should start the server successfully', async () => {
      await serverManager.start();

      expect(mockServer.start).toHaveBeenCalledOnce();
      expect(serverManager.isServerRunning()).toBe(true);
    });

    it('should throw error if server is already running', async () => {
      // Start the server first
      await serverManager.start();

      // Try to start again
      await expect(serverManager.start()).rejects.toThrow(
        'Internal error during start server'
      );
    });

    it('should handle server start failure', async () => {
      // Mock start failure
      mockServer.start.mockRejectedValue(new Error('Start failed'));

      await expect(serverManager.start()).rejects.toThrow(
        'Internal error during start server'
      );
      expect(serverManager.isServerRunning()).toBe(false);
    });

    it('should handle non-Error exceptions during start', async () => {
      // Mock start failure with non-Error
      mockServer.start.mockRejectedValue('String error');

      await expect(serverManager.start()).rejects.toThrow(
        'Internal error during start server'
      );
      expect(serverManager.isServerRunning()).toBe(false);
    });
  });

  describe('stop', () => {
    it('should stop the server successfully', async () => {
      // Start the server first
      await serverManager.start();

      await serverManager.stop();

      expect(mockServer.stop).toHaveBeenCalledOnce();
      expect(serverManager.isServerRunning()).toBe(false);
    });

    it('should handle server stop failure', async () => {
      // Start the server first
      await serverManager.start();

      // Mock stop failure
      mockServer.stop.mockRejectedValue(new Error('Stop failed'));

      await expect(serverManager.stop()).rejects.toThrow(
        'Internal error during stop server'
      );
      expect(serverManager.isServerRunning()).toBe(true); // Should remain running on failure
    });

    it('should handle non-Error exceptions during stop', async () => {
      // Start the server first
      await serverManager.start();

      // Mock stop failure with non-Error
      mockServer.stop.mockRejectedValue('String error');

      await expect(serverManager.stop()).rejects.toThrow(
        'Internal error during stop server'
      );
      expect(serverManager.isServerRunning()).toBe(true); // Should remain running on failure
    });
  });

  describe('getStatus', () => {
    it('should return server status when running', async () => {
      // Start the server first
      await serverManager.start();

      const status = serverManager.getStatus();

      expect(status).toEqual({
        isRunning: true,
        pid: expect.any(Number) as number,
        uptime: expect.any(Number) as number,
      });
    });

    it('should return server status when not running', () => {
      const status = serverManager.getStatus();

      expect(status).toEqual({
        isRunning: false,
        pid: null,
      });
    });
  });

  describe('error handling integration', () => {
    it('should use proper error context for start errors', async () => {
      mockServer.start.mockRejectedValue(new Error('Start failed'));

      try {
        await serverManager.start();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain(
          'Internal error during start server'
        );
      }
    });

    it('should use proper error context for stop errors', async () => {
      // Start the server first
      await serverManager.start();

      mockServer.stop.mockRejectedValue(new Error('Stop failed'));

      try {
        await serverManager.stop();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain(
          'Internal error during stop server'
        );
      }
    });
  });

  describe('server lifecycle management', () => {
    it('should maintain correct running state through start/stop cycle', async () => {
      // Initial state
      expect(serverManager.isServerRunning()).toBe(false);

      // Start server
      await serverManager.start();
      expect(serverManager.isServerRunning()).toBe(true);

      // Stop server
      await serverManager.stop();
      expect(serverManager.isServerRunning()).toBe(false);
    });

    it('should handle rapid start/stop calls correctly', async () => {
      // Start
      await serverManager.start();
      expect(serverManager.isServerRunning()).toBe(true);

      // Try to start again (should fail)
      await expect(serverManager.start()).rejects.toThrow(
        'Internal error during start server'
      );

      // Stop
      await serverManager.stop();
      expect(serverManager.isServerRunning()).toBe(false);

      // Try to stop again (should fail - but it should just return without error)
      await expect(serverManager.stop()).resolves.toBeUndefined();
    });
  });

  describe('resolveProjectRoot', () => {
    let originalCwd: string;
    let originalArgv: string[];
    const mockedExistsSync = vi.mocked(existsSync);

    beforeEach(() => {
      originalCwd = process.cwd();
      originalArgv = [...process.argv];
      mockedExistsSync.mockReset();
    });

    afterEach(() => {
      vi.spyOn(process, 'cwd').mockRestore();
      process.argv = originalArgv;
    });

    /**
     * Helper to invoke private resolveProjectRoot method
     */
    function invokeResolveProjectRoot(manager: ServerManager): string {
      return (manager as any).resolveProjectRoot();
    }

    describe('when cwd is a valid project root', () => {
      it('should return cwd when swarm.config.json exists', () => {
        const projectDir = '/users/dev/my-project';
        vi.spyOn(process, 'cwd').mockReturnValue(projectDir);

        mockedExistsSync.mockImplementation((filePath) => {
          return filePath === path.join(projectDir, 'swarm.config.json');
        });

        const result = invokeResolveProjectRoot(serverManager);

        expect(result).toBe(projectDir);
      });

      it('should return cwd when package.json exists', () => {
        const projectDir = '/users/dev/my-project';
        vi.spyOn(process, 'cwd').mockReturnValue(projectDir);

        mockedExistsSync.mockImplementation((filePath) => {
          return filePath === path.join(projectDir, 'package.json');
        });

        const result = invokeResolveProjectRoot(serverManager);

        expect(result).toBe(projectDir);
      });

      it('should prioritize swarm.config.json check (short-circuit)', () => {
        const projectDir = '/users/dev/my-project';
        vi.spyOn(process, 'cwd').mockReturnValue(projectDir);

        mockedExistsSync.mockImplementation((filePath) => {
          // Both files exist
          return (
            filePath === path.join(projectDir, 'swarm.config.json') ||
            filePath === path.join(projectDir, 'package.json')
          );
        });

        const result = invokeResolveProjectRoot(serverManager);

        expect(result).toBe(projectDir);
      });
    });

    describe('when cwd is not a project root (binary path fallback)', () => {
      it('should resolve from node_modules parent when binary is locally installed', () => {
        const cwdDir = '/tmp/random-dir';
        const projectRoot = '/users/dev/my-project';
        const binaryPath = `${projectRoot}/node_modules/.bin/swarm`;

        vi.spyOn(process, 'cwd').mockReturnValue(cwdDir);
        process.argv = ['node', binaryPath];

        mockedExistsSync.mockImplementation((filePath) => {
          // cwd has no project files
          if (
            filePath === path.join(cwdDir, 'swarm.config.json') ||
            filePath === path.join(cwdDir, 'package.json')
          ) {
            return false;
          }
          // project root has swarm.config.json
          return filePath === path.join(projectRoot, 'swarm.config.json');
        });

        const result = invokeResolveProjectRoot(serverManager);

        expect(result).toBe(projectRoot);
      });

      it('should resolve from deep node_modules path', () => {
        const cwdDir = '/tmp/random-dir';
        const projectRoot = '/users/dev/monorepo/packages/my-app';
        const binaryPath = `${projectRoot}/node_modules/@ingenyus/swarm/bin/swarm`;

        vi.spyOn(process, 'cwd').mockReturnValue(cwdDir);
        process.argv = ['node', binaryPath];

        mockedExistsSync.mockImplementation((filePath) => {
          // cwd has no project files
          if (
            filePath === path.join(cwdDir, 'swarm.config.json') ||
            filePath === path.join(cwdDir, 'package.json')
          ) {
            return false;
          }
          // project root has package.json
          return filePath === path.join(projectRoot, 'package.json');
        });

        const result = invokeResolveProjectRoot(serverManager);

        expect(result).toBe(projectRoot);
      });

      it('should use lastIndexOf to find the correct node_modules (nested case)', () => {
        const cwdDir = '/tmp/random-dir';
        // Simulates a monorepo where binary is in a nested package's node_modules
        const projectRoot = '/users/dev/monorepo/packages/app';
        const binaryPath = `${projectRoot}/node_modules/.pnpm/@ingenyus+swarm@1.0.0/node_modules/@ingenyus/swarm/bin/swarm`;

        vi.spyOn(process, 'cwd').mockReturnValue(cwdDir);
        process.argv = ['node', binaryPath];

        mockedExistsSync.mockImplementation((filePath) => {
          if (
            filePath === path.join(cwdDir, 'swarm.config.json') ||
            filePath === path.join(cwdDir, 'package.json')
          ) {
            return false;
          }
          // The project root (before the last node_modules) has swarm.config.json
          return filePath === path.join(projectRoot, 'swarm.config.json');
        });

        const result = invokeResolveProjectRoot(serverManager);

        // Should find the parent of the LAST node_modules (pnpm structure)
        // In this case: /users/dev/monorepo/packages/app/node_modules/.pnpm/@ingenyus+swarm@1.0.0
        // But that's not a valid project root, so it falls back to cwd
        expect(result).toBe(cwdDir);
      });
    });

    describe('when binary path does not contain node_modules', () => {
      it('should fall back to cwd when binary is run directly (development)', () => {
        const cwdDir = '/users/dev/swarm';
        const binaryPath = '/users/dev/swarm/bin/swarm';

        vi.spyOn(process, 'cwd').mockReturnValue(cwdDir);
        process.argv = ['node', binaryPath];

        mockedExistsSync.mockReturnValue(false);

        const result = invokeResolveProjectRoot(serverManager);

        expect(result).toBe(cwdDir);
      });

      it('should fall back to cwd when using npx remotely', () => {
        const cwdDir = '/users/dev/my-project';
        // npx downloads to a temp cache location without node_modules in project path
        const binaryPath =
          '/home/user/.npm/_npx/abc123/node_modules/@ingenyus/swarm/bin/swarm';

        vi.spyOn(process, 'cwd').mockReturnValue(cwdDir);
        process.argv = ['node', binaryPath];

        mockedExistsSync.mockImplementation((filePath) => {
          // cwd has no project files
          if (
            filePath === path.join(cwdDir, 'swarm.config.json') ||
            filePath === path.join(cwdDir, 'package.json')
          ) {
            return false;
          }
          // npx cache parent is not a valid project root
          return false;
        });

        const result = invokeResolveProjectRoot(serverManager);

        expect(result).toBe(cwdDir);
      });
    });

    describe('when binary path candidate is not a valid project root', () => {
      it('should fall back to cwd when node_modules parent has no project files', () => {
        const cwdDir = '/users/dev/working-dir';
        const notProjectRoot = '/some/random/location';
        const binaryPath = `${notProjectRoot}/node_modules/@ingenyus/swarm/bin/swarm`;

        vi.spyOn(process, 'cwd').mockReturnValue(cwdDir);
        process.argv = ['node', binaryPath];

        // Neither cwd nor the node_modules parent have project files
        mockedExistsSync.mockReturnValue(false);

        const result = invokeResolveProjectRoot(serverManager);

        expect(result).toBe(cwdDir);
      });
    });

    describe('edge cases', () => {
      it('should handle missing argv[1]', () => {
        const cwdDir = '/users/dev/my-project';
        vi.spyOn(process, 'cwd').mockReturnValue(cwdDir);
        process.argv = ['node']; // No argv[1]

        mockedExistsSync.mockReturnValue(false);

        const result = invokeResolveProjectRoot(serverManager);

        expect(result).toBe(cwdDir);
      });

      it('should handle empty argv', () => {
        const cwdDir = '/users/dev/my-project';
        vi.spyOn(process, 'cwd').mockReturnValue(cwdDir);
        process.argv = [];

        mockedExistsSync.mockReturnValue(false);

        const result = invokeResolveProjectRoot(serverManager);

        expect(result).toBe(cwdDir);
      });

      it('should handle Windows-style paths', () => {
        const cwdDir = 'C:\\Users\\dev\\my-project';
        vi.spyOn(process, 'cwd').mockReturnValue(cwdDir);

        mockedExistsSync.mockImplementation((filePath) => {
          // Normalize for comparison (path.join handles this)
          const normalizedPath = String(filePath);
          return (
            normalizedPath === path.join(cwdDir, 'swarm.config.json') ||
            normalizedPath === path.join(cwdDir, 'package.json')
          );
        });

        const result = invokeResolveProjectRoot(serverManager);

        expect(result).toBe(cwdDir);
      });
    });
  });
});
