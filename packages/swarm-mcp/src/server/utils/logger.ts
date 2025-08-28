/* eslint-disable no-console */
import type { ServerConfig } from '../types/mcp.js';

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown> | undefined;
  service: string;
}

class Logger {
  private serviceName: string;
  private logLevel: 'debug' | 'info' | 'warn' | 'error';
  private isJsonFormat: boolean;

  constructor(config?: Partial<ServerConfig>) {
    this.serviceName = config?.name || 'swarm-mcp';
    this.logLevel = config?.logging?.level || 'info';
    this.isJsonFormat = config?.logging?.format === 'json';
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  private formatLog(entry: LogEntry): string {
    if (this.isJsonFormat) {
      return JSON.stringify(entry);
    }

    const timestamp = entry.timestamp;
    const level = entry.level.toUpperCase().padEnd(5);
    const message = entry.message;
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';

    return `[${timestamp}] ${level} ${entry.service}: ${message}${context}`;
  }

  private log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context?: Record<string, unknown>
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      service: this.serviceName,
    };

    const formattedLog = this.formatLog(entry);

    switch (level) {
      case 'debug':
        console.debug(formattedLog);
        break;
      case 'info':
        console.info(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'error':
        console.error(formattedLog);
        break;
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  // Method to update logger configuration
  updateConfig(config: Partial<ServerConfig>): void {
    if (config.name) {
      this.serviceName = config.name;
    }
    if (config.logging?.level) {
      this.logLevel = config.logging.level;
    }
    if (config.logging?.format) {
      this.isJsonFormat = config.logging.format === 'json';
    }
  }
}

// Create default logger instance
export const logger = new Logger();

// Export the Logger class for custom instances
export { Logger };
