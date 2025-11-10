import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ServerManager } from '../server-manager';
import { createStatusCommand } from './status';

// Mock the ServerManager
vi.mock('../server-manager', () => ({
  ServerManager: vi.fn(),
}));

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
};

vi.mock('../../../cli/cli-logger', () => ({
  getCLILogger: vi.fn(() => mockLogger),
}));

describe('Status Command', () => {
  let mockServerManager: ServerManager;
  let command: ReturnType<typeof createStatusCommand>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock ServerManager instance
    mockServerManager = {
      start: vi.fn(),
      stop: vi.fn(),
      getStatus: vi.fn(),
      isServerRunning: vi.fn(),
    } as unknown as ServerManager;

    // Create the command
    command = createStatusCommand(mockServerManager);
  });

  describe('createStatusCommand function', () => {
    it('should create a status command successfully', () => {
      expect(command).toBeInstanceOf(Object);
      expect(command.name()).toBe('status');
      expect(command.description()).toBe('Check server status');
    });

    it('should execute status action successfully when running', async () => {
      // Mock running status
      const mockStatus = {
        isRunning: true,
        pid: 12345,
        uptime: 3661, // 1 hour, 1 minute, 1 second
      };
      (mockServerManager.getStatus as any).mockReturnValue(mockStatus);

      // Execute the command
      await command.parseAsync(['status']);

      expect(mockServerManager.getStatus).toHaveBeenCalledOnce();
      expect(mockLogger.info).toHaveBeenCalledWith('Swarm MCP Server Status');
      expect(mockLogger.info).toHaveBeenCalledWith('========================');
      expect(mockLogger.info).toHaveBeenCalledWith('Status: Running');
      expect(mockLogger.info).toHaveBeenCalledWith('PID: 12345');
      expect(mockLogger.info).toHaveBeenCalledWith('Uptime: 1h 1m 1s');
      expect(mockLogger.info).toHaveBeenCalledWith('========================');
    });

    it('should execute status action when not running', async () => {
      // Mock not running status
      const mockStatus = {
        isRunning: false,
        pid: undefined,
        uptime: undefined,
      };
      (mockServerManager.getStatus as any).mockReturnValue(mockStatus);

      // Execute the command
      await command.parseAsync(['status']);

      expect(mockServerManager.getStatus).toHaveBeenCalledOnce();
      expect(mockLogger.info).toHaveBeenCalledWith('Swarm MCP Server Status');
      expect(mockLogger.info).toHaveBeenCalledWith('========================');
      expect(mockLogger.info).toHaveBeenCalledWith('Status: Not running');
      expect(mockLogger.info).toHaveBeenCalledWith('========================');
    });
  });
});
