import { MCPErrorCode, MCPProtocolError } from './mcp-protocol-error.js';

/**
 * Error context interface
 * @internal
 *
 * @property {string} tool - The tool that caused the error
 * @property {string} operation - The operation that caused the error
 * @property {Record<string, unknown>} parameters - The parameters that caused the error
 * @property {string} user - The user that caused the error
 * @property {Date} timestamp - The timestamp of the error
 * @property {string} requestId - The request ID of the error
 */
export interface ErrorContext {
  tool?: string | undefined;
  operation?: string | undefined;
  parameters?: Record<string, unknown> | undefined;
  user?: string | undefined;
  timestamp: Date;
  requestId?: string;
}

/**
 * Base class for all application errors
 * @internal
 *
 * @extends {MCPProtocolError}
 * @property {ErrorContext} context - The error context
 */
export abstract class AppError extends MCPProtocolError {
  constructor(
    code: MCPErrorCode,
    message: string,
    public readonly context?: ErrorContext
  ) {
    super(code, message);
    this.name = this.constructor.name;
  }
}
