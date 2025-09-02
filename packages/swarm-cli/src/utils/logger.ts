import pkg from 'signale';
import type { Signale } from 'signale';
import { Logger } from '../types/logger';

const { Signale: SignaleConstructor } = pkg;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class SwarmLogger implements Logger {
  private signale: Signale;
  private logLevel: LogLevel;

  constructor(defaultLogLevel: LogLevel = 'info') {
    this.logLevel =
      (process.env.SWARM_LOG_LEVEL as LogLevel) || defaultLogLevel;

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
    return new SignaleConstructor({
      scope: 'Swarm',
      logLevel: this.logLevel,
    });
  }

  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.signale = this.createSignale();
  }
}

export const realLogger: Logger = new SwarmLogger();
