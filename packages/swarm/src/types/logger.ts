export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;

  info(message: string, context?: Record<string, unknown>): void;

  success(message: string, context?: Record<string, unknown>): void;

  warn(message: string, context?: Record<string, unknown>): void;

  error(message: string, context?: Record<string, unknown>): void;
}

// Re-export SignaleLogger from common
export { SignaleLogger } from '../common/signale-logger';
