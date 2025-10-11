import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServerManager } from './server-manager.js';

// Mock the SwarmMCPServer
vi.mock('../server/index.js', () => ({
  SwarmMCPServer: vi.fn(),
}));

// Mock logger
vi.mock('../server/utils/index.js', async (importOriginal) => ({
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
  let MockedSwarmMCPServer: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked SwarmMCPServer
    const { SwarmMCPServer } = await import('../server/index.js');
    MockedSwarmMCPServer = SwarmMCPServer as any;

    // Create the mock server instance with proper method setup
    mockServer = {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      loadConfiguration: vi.fn().mockResolvedValue(undefined),
    };

    // Set up the mock constructor to return our mock server
    MockedSwarmMCPServer.mockImplementation(() => mockServer);

    serverManager = new ServerManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a new server manager instance', () => {
      expect(serverManager).toBeInstanceOf(ServerManager);
      // SwarmMCPServer is not called during construction, only when start() is called
      expect(MockedSwarmMCPServer).not.toHaveBeenCalled();
    });

    it('should initialize with server not running', () => {
      expect(serverManager.isServerRunning()).toBe(false);
    });
  });

  describe('start', () => {
    it('should start the server successfully', async () => {
      await serverManager.start();

      expect(mockServer.loadConfiguration).toHaveBeenCalledOnce();
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
});
