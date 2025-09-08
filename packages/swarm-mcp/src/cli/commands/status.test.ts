import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStatusCommand } from './status.js';
import { ServerManager } from '../server-manager.js';
import { realLogger as logger } from '@ingenyus/swarm-cli/dist/utils/logger.js';

// Mock the ServerManager
vi.mock('../server-manager.js', () => ({
  ServerManager: vi.fn(),
}));

vi.mock('@ingenyus/swarm-cli/dist/utils/logger.js', () => ({
  realLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
  configureLogger: vi.fn(),
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
      expect((logger as any).info).toHaveBeenCalledWith('🔄 Swarm MCP Server Status');
      expect( (logger as any).info).toHaveBeenCalledWith('========================');
      expect((logger as any).info).toHaveBeenCalledWith('✅ Status: Running');
      expect((logger as any).info).toHaveBeenCalledWith('🆔 PID: 12345');
      expect((logger as any).info).toHaveBeenCalledWith('⏱️  Uptime: 1h 1m 1s');
      expect((logger as any).info).toHaveBeenCalledWith('========================');
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
      expect((logger as any).info).toHaveBeenCalledWith('🔄 Swarm MCP Server Status');
      expect((logger as any).info).toHaveBeenCalledWith('========================');
      expect((logger as any).info).toHaveBeenCalledWith('❌ Status: Not running');
      expect((logger as any).info).toHaveBeenCalledWith('========================');
    });
  });
});
