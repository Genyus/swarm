import type { Server as MCPServer } from '@modelcontextprotocol/sdk/server';
import { Logger, LogLevel } from '../common/logger';
import { getConfigManager } from '../config';

export class MCPLogger implements Logger {
  private mcpServer: MCPServer | null;
  private logLevel: LogLevel;

  constructor(mcpServer: MCPServer | null, defaultLogLevel?: LogLevel) {
    this.mcpServer = mcpServer;
    this.logLevel = defaultLogLevel || getConfigManager().getLogLevel();
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      void this.sendNotification('debug', message, context).catch(() => {});
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      void this.sendNotification('info', message, context).catch(() => {});
    }
  }

  success(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      void this.sendNotification('info', message, context).catch(() => {});
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      void this.sendNotification('warn', message, context).catch(() => {});
    }
  }

  error(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      void this.sendNotification('error', message, context).catch(() => {});
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private async sendNotification(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    if (!this.mcpServer) {
      // Fallback to stderr if MCP server is not available
      const logMessage = this.formatMessage(level, message, context);

      process.stderr.write(`${logMessage}\n`);

      return;
    }

    try {
      // Check if sendLoggingMessage method exists on the server
      if (
        !this.mcpServer ||
        typeof (this.mcpServer as any).sendLoggingMessage !== 'function'
      ) {
        // Fallback to stderr if method doesn't exist
        const logMessage = this.formatMessage(level, message, context);

        process.stderr.write(`${logMessage}\n`);

        return;
      }

      const levelMap: Record<
        string,
        | 'debug'
        | 'info'
        | 'error'
        | 'notice'
        | 'warning'
        | 'critical'
        | 'alert'
        | 'emergency'
      > = {
        debug: 'debug',
        info: 'info',
        warn: 'warning',
        error: 'error',
      };

      const mcpLevel = levelMap[level] || 'info';

      await (this.mcpServer as any).sendLoggingMessage({
        level: mcpLevel,
        data: message,
      });
    } catch (error) {
      // If notification fails, fallback to stderr to ensure message is not lost
      // This can happen if the server isn't fully ready or if sendLoggingMessage fails
      const logMessage = this.formatMessage(level, message, context);

      process.stderr.write(`${logMessage}\n`);

      return;
    }
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): string {
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';

    return `[${level}] ${message}${contextStr}`;
  }

  setMCPServer(mcpServer: MCPServer | null): void {
    this.mcpServer = mcpServer;
  }

  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}

/**
 * Create a new MCP logger instance
 * @param mcpServer Optional MCP server instance
 * @param logLevel Optional log level, defaults to config manager value
 * @returns MCPLogger instance
 */
export function getMCPLogger(
  mcpServer?: MCPServer | null,
  logLevel?: LogLevel
): MCPLogger {
  const level = logLevel || getConfigManager().getLogLevel();

  return new MCPLogger(mcpServer || null, level);
}
