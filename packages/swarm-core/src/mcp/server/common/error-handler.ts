import { logger } from '../../../common';
import { MCPProtocolError } from '../types/mcp.js';
import { createErrorContext, normalizeToMCPError } from './errors.js';

interface ErrorHandlingContext {
  tool?: string;
  operation?: string;
  parameters?: Record<string, unknown> | undefined;
  user?: string;
  requestId?: string;
}

export function handleError(
  error: unknown,
  context?: ErrorHandlingContext
): never {
  const errorContext = createErrorContext(
    context?.tool,
    context?.operation,
    context?.parameters
  );

  // Log the error with structured context
  logger.error('Operation failed', {
    error: error instanceof Error ? error.message : String(error),
    code: error instanceof MCPProtocolError ? error.code : undefined,
    context: errorContext,
    stack: error instanceof Error ? error.stack : undefined,
    tool: context?.tool,
    operation: context?.operation,
    parameters: context?.parameters,
  });

  // Convert to MCP error and re-throw
  throw normalizeToMCPError(error);
}

export function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: ErrorHandlingContext,
  fallback?: () => T
): Promise<T> {
  return operation().catch((error) => {
    if (fallback) {
      logger.warn('Operation failed, using fallback', {
        error: error instanceof Error ? error.message : String(error),
        tool: context?.tool,
        operation: context?.operation,
      });
      return fallback();
    }
    const errorContext = createErrorContext(
      context?.tool,
      context?.operation,
      context?.parameters
    );

    logger.error('Operation failed', {
      error: error instanceof Error ? error.message : String(error),
      code: error instanceof MCPProtocolError ? error.code : undefined,
      context: errorContext,
      stack: error instanceof Error ? error.stack : undefined,
      tool: context?.tool,
      operation: context?.operation,
      parameters: context?.parameters,
    });

    throw normalizeToMCPError(error);
  });
}

export function withErrorHandlingSync<T>(
  operation: () => T,
  context?: ErrorHandlingContext,
  fallback?: () => T
): T {
  try {
    return operation();
  } catch (error) {
    if (fallback) {
      logger.warn('Operation failed, using fallback', {
        error: error instanceof Error ? error.message : String(error),
        tool: context?.tool,
        operation: context?.operation,
      });
      return fallback();
    }
    const errorContext = createErrorContext(
      context?.tool,
      context?.operation,
      context?.parameters
    );

    logger.error('Operation failed', {
      error: error instanceof Error ? error.message : String(error),
      code: error instanceof MCPProtocolError ? error.code : undefined,
      context: errorContext,
      stack: error instanceof Error ? error.stack : undefined,
      tool: context?.tool,
      operation: context?.operation,
      parameters: context?.parameters,
    });

    throw normalizeToMCPError(error);
  }
}

export function createToolErrorHandler(tool: string) {
  return function handleToolError(
    error: unknown,
    operation: string,
    parameters?: Record<string, unknown>
  ): never {
    const errorContext = createErrorContext(tool, operation, parameters);

    logger.error('Operation failed', {
      error: error instanceof Error ? error.message : String(error),
      code: error instanceof MCPProtocolError ? error.code : undefined,
      context: errorContext,
      stack: error instanceof Error ? error.stack : undefined,
      tool,
      operation,
      parameters,
    });

    throw normalizeToMCPError(error);
  };
}

export function validateRequiredParameter<T>(
  value: unknown,
  name: string,
  expectedType: string,
  context?: ErrorHandlingContext
): T {
  if (value === undefined || value === null) {
    const errorContext = createErrorContext(
      context?.tool,
      context?.operation,
      context?.parameters
    );

    logger.error('Parameter validation failed', {
      error: `Required parameter '${name}' is missing`,
      context: errorContext,
      tool: context?.tool,
      operation: context?.operation,
      parameters: context?.parameters,
    });

    throw normalizeToMCPError(
      new Error(`Required parameter '${name}' is missing`)
    );
  }

  if (typeof value !== expectedType) {
    const errorContext = createErrorContext(
      context?.tool,
      context?.operation,
      context?.parameters
    );

    logger.error('Parameter validation failed', {
      error: `Parameter '${name}' must be a ${expectedType}, got ${typeof value}`,
      context: errorContext,
      tool: context?.tool,
      operation: context?.operation,
      parameters: context?.parameters,
    });

    throw normalizeToMCPError(
      new Error(
        `Parameter '${name}' must be a ${expectedType}, got ${typeof value}`
      )
    );
  }

  return value as T;
}

export function validateNonEmptyString(
  value: unknown,
  name: string,
  context?: ErrorHandlingContext
): string {
  const stringValue = validateRequiredParameter<string>(
    value,
    name,
    'string',
    context
  );

  if (stringValue.trim() === '') {
    const errorContext = createErrorContext(
      context?.tool,
      context?.operation,
      context?.parameters
    );

    logger.error('Parameter validation failed', {
      error: `Parameter '${name}' cannot be empty`,
      context: errorContext,
      tool: context?.tool,
      operation: context?.operation,
      parameters: context?.parameters,
    });

    throw normalizeToMCPError(new Error(`Parameter '${name}' cannot be empty`));
  }

  return stringValue;
}

export function validateNumberRange(
  value: unknown,
  name: string,
  min: number,
  max: number,
  context?: ErrorHandlingContext
): number {
  const numberValue = validateRequiredParameter<number>(
    value,
    name,
    'number',
    context
  );

  if (numberValue < min || numberValue > max) {
    const errorContext = createErrorContext(
      context?.tool,
      context?.operation,
      context?.parameters
    );

    logger.error('Parameter validation failed', {
      error: `Parameter '${name}' must be between ${min} and ${max}, got ${numberValue}`,
      context: errorContext,
      tool: context?.tool,
      operation: context?.operation,
      parameters: context?.parameters,
    });

    throw normalizeToMCPError(
      new Error(
        `Parameter '${name}' must be between ${min} and ${max}, got ${numberValue}`
      )
    );
  }

  return numberValue;
}

export function validateArrayLength<T>(
  value: unknown,
  name: string,
  minLength: number,
  maxLength?: number,
  context?: ErrorHandlingContext
): T[] {
  const arrayValue = validateRequiredParameter<T[]>(
    value,
    name,
    'object',
    context
  );

  if (!Array.isArray(arrayValue)) {
    const errorContext = createErrorContext(
      context?.tool,
      context?.operation,
      context?.parameters
    );

    logger.error('Parameter validation failed', {
      error: `Parameter '${name}' must be an array, got ${typeof arrayValue}`,
      context: errorContext,
      tool: context?.tool,
      operation: context?.operation,
      parameters: context?.parameters,
    });

    throw normalizeToMCPError(
      new Error(
        `Parameter '${name}' must be an array, got ${typeof arrayValue}`
      )
    );
  }

  if (arrayValue.length < minLength) {
    const errorContext = createErrorContext(
      context?.tool,
      context?.operation,
      context?.parameters
    );

    logger.error('Parameter validation failed', {
      error: `Parameter '${name}' must have at least ${minLength} items, got ${arrayValue.length}`,
      context: errorContext,
      tool: context?.tool,
      operation: context?.operation,
      parameters: context?.parameters,
    });

    throw normalizeToMCPError(
      new Error(
        `Parameter '${name}' must have at least ${minLength} items, got ${arrayValue.length}`
      )
    );
  }

  if (maxLength !== undefined && arrayValue.length > maxLength) {
    const errorContext = createErrorContext(
      context?.tool,
      context?.operation,
      context?.parameters
    );

    logger.error('Parameter validation failed', {
      error: `Parameter '${name}' must have at most ${maxLength} items, got ${arrayValue.length}`,
      context: errorContext,
      tool: context?.tool,
      operation: context?.operation,
      parameters: context?.parameters,
    });

    throw normalizeToMCPError(
      new Error(
        `Parameter '${name}' must have at most ${maxLength} items, got ${arrayValue.length}`
      )
    );
  }

  return arrayValue;
}
