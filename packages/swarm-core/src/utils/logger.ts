import type { Signale, SignaleOptions } from 'signale';
import pkg from 'signale';
import { Logger } from '../types/logger';

const { Signale: SignaleConstructor } = pkg;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogFormat = 'json' | 'text';
export type LogStream = 'stdout' | 'stderr';

export class SwarmLogger implements Logger {
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
      scope: 'Swarm',
      logLevel: this.logLevel,
      stream: this.logStream === 'stderr' ? process.stderr : process.stdout,
    };

    // For MCP calls using stderr, remove badges and labels for cleaner output
    if (this.logStream === 'stderr') {
      options.types = Object.assign(options.types || {}, {
        debug: { badge: '', label: '' },
        info: { badge: '', label: '' },
        success: { badge: '', label: '' },
        warn: { badge: '', label: '' },
        error: { badge: '', label: '' },
      });
    }

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

const singleton = new SwarmLogger();
export const logger: Logger = singleton;

export function configureLogger(options: {
  level?: LogLevel;
  format?: LogFormat;
  stream?: LogStream;
}): void {
  const logger = singleton as SwarmLogger;
  if (options.level) logger.setLogLevel(options.level);
  if (options.format) logger.setLogFormat(options.format);
  if (options.stream) logger.setLogStream(options.stream);
}
