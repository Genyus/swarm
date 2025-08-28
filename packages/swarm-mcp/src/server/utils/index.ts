export * from './config.js';
export * from './logger.js';
export * from './validation.js';
interface ErrorWithCode extends Error {
  code?: string;
}

export function createError(message: string, code?: string): ErrorWithCode {
  const error = new Error(message) as ErrorWithCode;
  if (code) {
    error.code = code;
  }
  return error;
}
