import type { Server as MCPServer } from '@modelcontextprotocol/sdk/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MCPLogger } from './mcp-logger';

// Helper to wait for async operations
const waitForAsync = () =>
  new Promise<void>((resolve) => {
    // eslint-disable-next-line no-undef
    setTimeout(resolve, 0);
  });

describe('MCPLogger', () => {
  let mockMCPServer: MCPServer;
  let logger: MCPLogger;

  beforeEach(() => {
    // Create a mock MCP server with sendLoggingMessage method
    mockMCPServer = {
      sendLoggingMessage: vi.fn().mockResolvedValue(undefined),
    } as unknown as MCPServer;
    logger = new MCPLogger(mockMCPServer, 'info');
  });

  describe('constructor', () => {
    it('should create logger with MCP server', () => {
      expect(logger).toBeInstanceOf(MCPLogger);
    });

    it('should create logger without MCP server', () => {
      const loggerWithoutServer = new MCPLogger(null, 'info');
      expect(loggerWithoutServer).toBeInstanceOf(MCPLogger);
    });
  });

  describe('log methods', () => {
    it('should send info notification', async () => {
      logger.info('Test message', { key: 'value' });

      // Wait for async operation to complete
      await waitForAsync();

      expect((mockMCPServer as any).sendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        data: 'Test message',
      });
    });

    it('should send debug notification when level allows', async () => {
      const debugLogger = new MCPLogger(mockMCPServer, 'debug');
      debugLogger.debug('Debug message');

      // Wait for async operation to complete
      await waitForAsync();

      expect((mockMCPServer as any).sendLoggingMessage).toHaveBeenCalledWith({
        level: 'debug',
        data: 'Debug message',
      });
    });

    it('should not send debug notification when level is too high', async () => {
      const infoLogger = new MCPLogger(mockMCPServer, 'info');
      infoLogger.debug('Debug message');

      // Wait for async operation to complete
      await waitForAsync();

      expect((mockMCPServer as any).sendLoggingMessage).not.toHaveBeenCalled();
    });

    it('should send warn notification', async () => {
      logger.warn('Warning message');

      // Wait for async operation to complete
      await waitForAsync();

      expect((mockMCPServer as any).sendLoggingMessage).toHaveBeenCalledWith({
        level: 'warning',
        data: 'Warning message',
      });
    });

    it('should send error notification', async () => {
      logger.error('Error message', { error: 'test' });

      // Wait for async operation to complete
      await waitForAsync();

      expect((mockMCPServer as any).sendLoggingMessage).toHaveBeenCalledWith({
        level: 'error',
        data: 'Error message',
      });
    });

    it('should send success notification as info level', async () => {
      logger.success('Success message');

      // Wait for async operation to complete
      await waitForAsync();

      expect((mockMCPServer as any).sendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        data: 'Success message',
      });
    });
  });

  describe('fallback behavior', () => {
    it('should fallback to stderr when MCP server is null', () => {
      const stderrSpy = vi
        .spyOn(process.stderr, 'write')
        .mockImplementation(() => true);
      const loggerWithoutServer = new MCPLogger(null, 'info');

      loggerWithoutServer.info('Test message');

      expect(stderrSpy).toHaveBeenCalled();
      stderrSpy.mockRestore();
    });

    it('should handle notification errors gracefully', async () => {
      const errorServer = {
        sendLoggingMessage: vi
          .fn()
          .mockRejectedValue(new Error('Notification failed')),
      } as any;

      const errorLogger = new MCPLogger(errorServer, 'info');

      // Should not throw
      expect(() => {
        errorLogger.info('Test message');
      }).not.toThrow();

      // Wait for async operation to complete
      await waitForAsync();
    });
  });

  describe('setMCPServer', () => {
    it('should update MCP server reference', async () => {
      const newServer = {
        sendLoggingMessage: vi.fn().mockResolvedValue(undefined),
      } as any;
      logger.setMCPServer(newServer);

      logger.info('Test');

      // Wait for async operation to complete
      await waitForAsync();

      expect(newServer.sendLoggingMessage).toHaveBeenCalled();
      expect((mockMCPServer as any).sendLoggingMessage).not.toHaveBeenCalled();
    });
  });

  describe('log level management', () => {
    it('should respect log level settings', async () => {
      const warnLogger = new MCPLogger(mockMCPServer, 'warn');

      warnLogger.debug('Debug message');
      warnLogger.info('Info message');
      warnLogger.warn('Warn message');
      warnLogger.error('Error message');

      // Wait for async operations to complete
      await waitForAsync();

      expect((mockMCPServer as any).sendLoggingMessage).toHaveBeenCalledTimes(
        2
      ); // warn and error only
      expect(
        (mockMCPServer as any).sendLoggingMessage
      ).not.toHaveBeenCalledWith(expect.objectContaining({ level: 'debug' }));
      expect(
        (mockMCPServer as any).sendLoggingMessage
      ).not.toHaveBeenCalledWith(expect.objectContaining({ level: 'info' }));
    });
  });
});
