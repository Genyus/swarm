import { AppError, ErrorContext } from './app-error';
import { MCPErrorCode } from './mcp-protocol-error';

/**
 * Internal error class
 * @internal
 *
 * @extends {AppError}
 * @property {string} operation - The operation that caused the error
 * @property {Error} cause - The cause of the error
 * @property {ErrorContext} context - The error context
 */
export class InternalError extends AppError {
  constructor(operation: string, cause?: Error, context?: ErrorContext) {
    super(
      MCPErrorCode.InternalError,
      `Internal error during ${operation}: ${cause?.message || 'Unknown error'}`,
      context
    );
  }
}
