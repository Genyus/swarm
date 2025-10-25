import { ErrorContext } from './app-error.js';
import { ConfigurationError } from './configuration-error.js';
import { InternalError } from './internal-error.js';
import { MCPErrorCode, MCPProtocolError } from './mcp-protocol-error.js';

export class ErrorFactory {
  static configuration(
    setting: string,
    value: unknown,
    expected: string,
    context?: ErrorContext
  ): ConfigurationError {
    return new ConfigurationError(setting, value, expected, context);
  }

  static internal(
    operation: string,
    cause?: Error,
    context?: ErrorContext
  ): InternalError {
    return new InternalError(operation, cause, context);
  }

  static mcp(
    code: MCPErrorCode,
    message: string,
    data?: unknown
  ): MCPProtocolError {
    return new MCPProtocolError(code, message, data);
  }
}
