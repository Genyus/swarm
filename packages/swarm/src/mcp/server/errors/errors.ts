import { ErrorContext } from './app-error';

/**
 * Create an error context
 * @internal
 *
 * @param {string} tool - The tool that caused the error
 * @param {string} operation - The operation that caused the error
 * @param {Record<string, unknown>} parameters - The parameters that caused the error
 * @returns {ErrorContext} The error context
 */
export function createErrorContext(
  tool?: string,
  operation?: string,
  parameters?: Record<string, unknown>
): ErrorContext {
  return {
    tool: tool || undefined,
    operation: operation || undefined,
    parameters: parameters || undefined,
    timestamp: new Date(),
    requestId: generateRequestId(),
  };
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
