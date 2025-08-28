// Utility functions
export * from './config.js';
export * from './logger.js';
export * from './validation.js';

// Common utilities
export function createError(message: string, code?: string): Error {
  const error = new Error(message);
  if (code) {
    (error as any).code = code;
  }
  return error;
}
