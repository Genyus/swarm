import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStartCommand } from '../../../src/cli/commands/start.js';
import { ServerManager } from '../../../src/cli/server-manager.js';

// Mock the ServerManager
vi.mock('../../../src/cli/server-manager.js', () => ({
  ServerManager: vi.fn(),
}));

// Mock console methods
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => {});
const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit called');
});

describe('Start Command', () => {
  let mockServerManager: ServerManager;
  let command: ReturnType<typeof createStartCommand>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock ServerManager instance
    mockServerManager = {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
      getStatus: vi.fn(),
      isServerRunning: vi.fn(),
    } as unknown as ServerManager;

    // Create the command
    command = createStartCommand(mockServerManager);
  });

  describe('createStartCommand function', () => {
    it('should create a start command successfully', () => {
      expect(command).toBeInstanceOf(Object);
      expect(command.name()).toBe('start');
      expect(command.description()).toBe('Start the MCP server in stdio mode');
    });

    it('should execute start action successfully', async () => {
      // Mock successful start
      (mockServerManager.start as any).mockResolvedValue(undefined);

      // Execute the command by parsing arguments
      await command.parseAsync(['start']);

      expect(mockServerManager.start).toHaveBeenCalledOnce();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Starting Swarm MCP server in stdio mode...'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '✅ Server started successfully in stdio mode'
      );
    });

    it('should handle server start failure', async () => {
      // Mock start failure
      const error = new Error('Server failed to start');
      (mockServerManager.start as any).mockRejectedValue(error);

      // Execute the command and expect it to throw due to process.exit
      await expect(command.parseAsync(['start'])).rejects.toThrow(
        'process.exit called'
      );

      expect(mockServerManager.start).toHaveBeenCalledOnce();
      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ Failed to start server: Server failed to start'
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it('should handle non-Error exceptions during start', async () => {
      // Mock non-Error exception
      (mockServerManager.start as any).mockRejectedValue('Unknown error');

      // Execute the command and expect it to throw due to process.exit
      await expect(command.parseAsync(['start'])).rejects.toThrow(
        'process.exit called'
      );

      expect(mockServerManager.start).toHaveBeenCalledOnce();
      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ Failed to start server: Unknown error'
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });
});
