import { ErrorContext } from './app-error';
import { ConfigurationError } from './configuration-error';
import { InternalError } from './internal-error';
import { MCPErrorCode, MCPProtocolError } from './mcp-protocol-error';

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
