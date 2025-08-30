import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ServerConfig } from '../../../src/server/types/mcp.js';
import { Logger, logger } from '../../../src/server/utils/logger.js';

describe('Logger', () => {
  let mockConsole: {
    debug: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    mockConsole = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create logger with default configuration', () => {
      const logger = new Logger();
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create logger with custom service name', () => {
      const config: Partial<ServerConfig> = { name: 'custom-service' };
      const logger = new Logger(config);

      logger.info('test message');
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('custom-service')
      );
    });

    it('should create logger with custom log level', () => {
      const config: Partial<ServerConfig> = {
        logging: { level: 'debug', format: 'text' },
      };
      const logger = new Logger(config);

      logger.debug('debug message');
      expect(mockConsole.debug).toHaveBeenCalled();
    });

    it('should create logger with JSON format', () => {
      const config: Partial<ServerConfig> = {
        logging: { format: 'json', level: 'info' },
      };
      const jsonLogger = new Logger(config);

      jsonLogger.info('test message');
      const call = mockConsole.info.mock.calls[0][0] as string;
      expect(() => JSON.parse(call)).not.toThrow();
    });
  });

  describe('log level filtering', () => {
    it('should not log debug when level is info', () => {
      const logger = new Logger({ logging: { level: 'info', format: 'text' } });

      logger.debug('debug message');
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should log info when level is info', () => {
      const logger = new Logger({ logging: { level: 'info', format: 'text' } });

      logger.info('info message');
      expect(mockConsole.info).toHaveBeenCalled();
    });

    it('should log warn when level is info', () => {
      const logger = new Logger({ logging: { level: 'info', format: 'text' } });

      logger.warn('warn message');
      expect(mockConsole.warn).toHaveBeenCalled();
    });

    it('should log error when level is info', () => {
      const logger = new Logger({ logging: { level: 'info', format: 'text' } });

      logger.error('error message');
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should not log info when level is warn', () => {
      const logger = new Logger({ logging: { level: 'warn', format: 'text' } });

      logger.info('info message');
      expect(mockConsole.info).not.toHaveBeenCalled();
    });

    it('should not log debug when level is warn', () => {
      const logger = new Logger({ logging: { level: 'warn', format: 'text' } });

      logger.debug('debug message');
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should log warn when level is warn', () => {
      const logger = new Logger({ logging: { level: 'warn', format: 'text' } });

      logger.warn('warn message');
      expect(mockConsole.warn).toHaveBeenCalled();
    });

    it('should log error when level is warn', () => {
      const logger = new Logger({ logging: { level: 'warn', format: 'text' } });

      logger.error('error message');
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should only log error when level is error', () => {
      const logger = new Logger({
        logging: { level: 'error', format: 'text' },
      });

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });
  });

  describe('logging methods', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger({ logging: { level: 'debug', format: 'text' } });
    });

    it('should call console.debug for debug method', () => {
      logger.debug('debug message');
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('debug message')
      );
    });

    it('should call console.info for info method', () => {
      logger.info('info message');
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('info message')
      );
    });

    it('should call console.warn for warn method', () => {
      logger.warn('warn message');
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('warn message')
      );
    });

    it('should call console.error for error method', () => {
      logger.error('error message');
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('error message')
      );
    });
  });

  describe('context handling', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger({ logging: { level: 'info', format: 'text' } });
    });

    it('should include context in plain text format', () => {
      const context = { userId: 123, action: 'login' };
      logger.info('user action', context);

      const call = mockConsole.info.mock.calls[0][0] as string;
      expect(call).toContain('{"userId":123,"action":"login"}');
    });

    it('should include context in JSON format', () => {
      const config: Partial<ServerConfig> = {
        logging: { format: 'json', level: 'info' },
      };
      const jsonLogger = new Logger(config);

      const context = { userId: 123, action: 'login' };
      jsonLogger.info('user action', context);

      const call = mockConsole.info.mock.calls[0][0] as string;
      const parsed = JSON.parse(call);
      expect(parsed.context).toEqual(context);
    });

    it('should handle undefined context gracefully', () => {
      logger.info('message without context');

      const call = mockConsole.info.mock.calls[0][0] as string;
      expect(call).not.toContain('undefined');
      expect(call).toContain('message without context');
    });
  });

  describe('log format', () => {
    it('should format plain text logs correctly', () => {
      const logger = new Logger({ logging: { level: 'info', format: 'text' } });

      logger.info('test message');

      const call = mockConsole.info.mock.calls[0][0] as string;
      expect(call).toMatch(
        /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO  swarm-mcp: test message$/
      );
    });

    it('should format JSON logs correctly', () => {
      const logger = new Logger({
        logging: { format: 'json', level: 'info' },
      });

      logger.info('test message', { key: 'value' });

      const call = mockConsole.info.mock.calls[0][0] as string;
      const parsed = JSON.parse(call);

      expect(parsed).toMatchObject({
        level: 'info',
        message: 'test message',
        context: { key: 'value' },
        service: 'swarm-mcp',
      });
      expect(parsed.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it('should pad log levels correctly in plain text', () => {
      const logger = new Logger({
        logging: { level: 'debug', format: 'text' },
      });

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      const debugCall = mockConsole.debug.mock.calls[0][0] as string;
      const infoCall = mockConsole.info.mock.calls[0][0] as string;
      const warnCall = mockConsole.warn.mock.calls[0][0] as string;
      const errorCall = mockConsole.error.mock.calls[0][0] as string;

      expect(debugCall).toContain('DEBUG ');
      expect(infoCall).toContain('INFO ');
      expect(warnCall).toContain('WARN ');
      expect(errorCall).toContain('ERROR ');
    });
  });

  describe('updateConfig', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger({
        name: 'initial-service',
        logging: { level: 'info', format: 'text' },
      });
    });

    it('should update service name', () => {
      logger.updateConfig({ name: 'updated-service' });

      logger.info('test message');
      const call = mockConsole.info.mock.calls[0][0] as string;
      expect(call).toContain('updated-service');
    });

    it('should update log level', () => {
      logger.updateConfig({ logging: { level: 'debug', format: 'text' } });

      logger.debug('debug message');
      expect(mockConsole.debug).toHaveBeenCalled();
    });

    it('should update log format', () => {
      logger.updateConfig({ logging: { format: 'json', level: 'info' } });

      logger.info('test message');
      const call = mockConsole.info.mock.calls[0][0] as string;
      expect(() => JSON.parse(call)).not.toThrow();
    });

    it('should update multiple config options at once', () => {
      logger.updateConfig({
        name: 'multi-update-service',
        logging: { level: 'warn', format: 'json' },
      });

      logger.info('info message');
      logger.warn('warn message');

      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();

      const call = mockConsole.warn.mock.calls[0][0] as string;
      const parsed = JSON.parse(call);
      expect(parsed.service).toBe('multi-update-service');
    });

    it('should preserve existing config when updating partial options', () => {
      logger.updateConfig({ name: 'partial-update' });

      logger.info('test message');
      const call = mockConsole.info.mock.calls[0][0] as string;

      expect(call).toContain('partial-update');
      expect(call).toMatch(
        /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO  partial-update: test message$/
      );
    });
  });

  describe('default logger instance', () => {
    it('should export a default logger instance', () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should use default configuration', () => {
      logger.debug('debug message');
      expect(mockConsole.debug).not.toHaveBeenCalled();

      logger.info('info message');
      expect(mockConsole.info).toHaveBeenCalled();
    });

    it('should use default service name', () => {
      logger.info('test message');
      const call = mockConsole.info.mock.calls[0][0] as string;
      expect(call).toContain('swarm-mcp');
    });
  });
});
