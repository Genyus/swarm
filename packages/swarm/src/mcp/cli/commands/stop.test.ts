import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../../../logger';
import { ServerManager } from '../server-manager';
import { createStopCommand } from './stop';

// Mock the ServerManager
vi.mock('../server-manager', () => ({
  ServerManager: vi.fn(),
}));

vi.mock('../../../logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
  configureLogger: vi.fn(),
}));
const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit called');
});

describe('Stop Command', () => {
  let mockServerManager: ServerManager;
  let command: ReturnType<typeof createStopCommand>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock ServerManager instance
    mockServerManager = {
      start: vi.fn(),
      stop: vi.fn().mockResolvedValue(undefined),
      getStatus: vi.fn(),
      isServerRunning: vi.fn(),
    } as unknown as ServerManager;

    // Create the command
    command = createStopCommand(mockServerManager);
  });

  describe('createStopCommand function', () => {
    it('should create a stop command successfully', () => {
      expect(command).toBeInstanceOf(Object);
      expect(command.name()).toBe('stop');
      expect(command.description()).toBe('Stop the MCP server');
    });

    it('should execute stop action successfully when running', async () => {
      // Mock running server
      (mockServerManager.isServerRunning as any).mockReturnValue(true);
      (mockServerManager.stop as any).mockResolvedValue(undefined);

      // Execute the command
      await command.parseAsync(['stop']);

      expect(mockServerManager.isServerRunning).toHaveBeenCalledOnce();
      expect(mockServerManager.stop).toHaveBeenCalledOnce();
      expect((logger as any).info).toHaveBeenCalledWith(
        'Stopping Swarm MCP server...'
      );
      expect((logger as any).info).toHaveBeenCalledWith(
        '✅ Server stopped successfully'
      );
    });

    it('should execute stop action when not running', async () => {
      // Mock not running server
      (mockServerManager.isServerRunning as any).mockReturnValue(false);

      // Execute the command
      await command.parseAsync(['stop']);

      expect(mockServerManager.isServerRunning).toHaveBeenCalledOnce();
      expect(mockServerManager.stop).not.toHaveBeenCalled();
      expect((logger as any).info).toHaveBeenCalledWith(
        'ℹ️  Server is not currently running'
      );
    });

    it('should handle server stop failure', async () => {
      // Mock running server but stop failure
      (mockServerManager.isServerRunning as any).mockReturnValue(true);
      const error = new Error('Stop failed');
      (mockServerManager.stop as any).mockRejectedValue(error);

      // Execute the command and expect it to throw due to process.exit
      await expect(command.parseAsync(['stop'])).rejects.toThrow(
        'process.exit called'
      );

      expect(mockServerManager.isServerRunning).toHaveBeenCalledOnce();
      expect(mockServerManager.stop).toHaveBeenCalledOnce();
      expect((logger as any).info).toHaveBeenCalledWith(
        'Stopping Swarm MCP server...'
      );
      expect((logger as any).error).toHaveBeenCalledWith(
        '❌ Failed to stop server: Stop failed'
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });
});
