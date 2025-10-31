import { AppError, ErrorContext } from './app-error';
import { MCPErrorCode } from './mcp-protocol-error';

/**
 * Configuration error class
 * @internal
 *
 * @extends {AppError}
 * @property {string} setting - The setting that caused the error
 * @property {unknown} value - The value of the setting that caused the error
 * @property {string} expected - The expected value of the setting
 * @property {ErrorContext} context - The error context
 */
export class ConfigurationError extends AppError {
  constructor(
    setting: string,
    value: unknown,
    expected: string,
    context?: ErrorContext
  ) {
    super(
      MCPErrorCode.ValidationError,
      `Configuration error: ${setting}=${JSON.stringify(value)}. Expected: ${expected}`,
      context
    );
  }
}
