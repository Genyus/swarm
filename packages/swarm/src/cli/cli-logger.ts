import type { Signale, SignaleOptions } from 'signale';
import pkg from 'signale';
import { Logger, LogLevel } from '../common/logger';
import { getConfigManager } from '../config';

const { Signale: SignaleConstructor } = pkg;
type LogFormat = 'json' | 'text';
type LogStream = 'stdout' | 'stderr';

export class CLILogger implements Logger {
  private signale: Signale;
  private logLevel: LogLevel;
  private logFormat: LogFormat;
  private logStream: LogStream;

  constructor(
    defaultLogLevel: LogLevel = 'info',
    defaultLogType: LogFormat = 'text',
    defaultLogStream: LogStream = 'stdout'
  ) {
    this.logLevel =
      (process.env.SWARM_LOG_LEVEL as LogLevel) || defaultLogLevel;
    this.logFormat =
      (process.env.SWARM_LOG_FORMAT as LogFormat) || defaultLogType;
    this.logStream =
      (process.env.SWARM_LOG_STREAM as LogStream) || defaultLogStream;
    this.signale = this.createSignale();
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.signale.debug(this.formatMessage(message, context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.signale.info(this.formatMessage(message, context));
  }

  success(message: string, context?: Record<string, unknown>): void {
    this.signale.success(this.formatMessage(message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.signale.warn(this.formatMessage(message, context));
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.signale.error(this.formatMessage(message, context));
  }

  private formatMessage(
    message: string,
    context?: Record<string, unknown>
  ): string {
    return `${message} ${context ? JSON.stringify(context) : ''}`.trim();
  }

  private createSignale(): Signale {
    const options: SignaleOptions = {
      // scope: 'Swarm',
      logLevel: this.logLevel,
      stream: this.logStream === 'stderr' ? process.stderr : process.stdout,
    };

    // For MCP calls using stderr, remove badges and labels for cleaner output
    /* if (this.logStream === 'stderr') {
      options.types = Object.assign(options.types || {}, {
        debug: { badge: '', label: '' },
        info: { badge: '', label: '' },
        success: { badge: '', label: '' },
        warn: { badge: '', label: '' },
        error: { badge: '', label: '' },
      });
    } */

    return new SignaleConstructor(options);
  }

  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.signale = this.createSignale();
  }

  setLogStream(stream: LogStream): void {
    this.logStream = stream;
    this.signale = this.createSignale();
  }

  getLogFormat(): LogFormat {
    return this.logFormat;
  }

  setLogFormat(format: LogFormat): void {
    this.logFormat = format;
    this.signale = this.createSignale();
  }
}

let cliLoggerInstance: CLILogger | null = null;

/**
 * Get or create the singleton CLI logger instance
 * @param logLevel Optional log level, defaults to config manager value
 * @returns CLILogger instance
 */
export function getCLILogger(logLevel?: LogLevel): CLILogger {
  if (!cliLoggerInstance) {
    const level = logLevel || getConfigManager().getLogLevel();

    cliLoggerInstance = new CLILogger(level);
  } else if (logLevel) {
    cliLoggerInstance.setLogLevel(logLevel);
  }
  return cliLoggerInstance;
}
