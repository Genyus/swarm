import { MCPErrorCode, MCPProtocolError } from '../types/mcp.js';

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

export interface ErrorContext {
  tool?: string | undefined;
  operation?: string | undefined;
  parameters?: Record<string, unknown> | undefined;
  user?: string | undefined;
  timestamp: Date;
  requestId?: string;
}

export class ValidationError extends AppError {
  constructor(
    field: string,
    value: unknown,
    expected: string,
    context?: ErrorContext
  ) {
    super(
      MCPErrorCode.ValidationError,
      `Invalid ${field}: ${JSON.stringify(value)}. Expected: ${expected}`,
      context
    );
  }
}

export class FileSystemError extends AppError {
  public readonly cause?: Error;

  constructor(
    operation: string,
    path: string,
    cause?: Error,
    context?: ErrorContext
  ) {
    super(
      MCPErrorCode.PermissionDenied,
      `File system error during ${operation}: ${path}`,
      context
    );

    if (cause) {
      this.cause = cause;
    }
  }
}

export class SwarmGenerationError extends AppError {
  constructor(
    tool: string,
    operation: string,
    details: string,
    context?: ErrorContext
  ) {
    super(
      MCPErrorCode.InvalidToolCall,
      `Swarm generation failed: ${tool} ${operation}. ${details}`,
      context
    );
  }
}

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

export class ResourceNotFoundError extends AppError {
  constructor(
    resourceType: string,
    identifier: string,
    context?: ErrorContext
  ) {
    super(
      MCPErrorCode.ResourceNotFound,
      `${resourceType} not found: ${identifier}`,
      context
    );
  }
}

export class PermissionDeniedError extends AppError {
  constructor(
    operation: string,
    resource: string,
    reason?: string,
    context?: ErrorContext
  ) {
    const message = reason
      ? `Permission denied for ${operation} on ${resource}: ${reason}`
      : `Permission denied for ${operation} on ${resource}`;

    super(MCPErrorCode.PermissionDenied, message, context);
  }
}

export class InternalError extends AppError {
  public readonly cause?: Error;

  constructor(operation: string, cause?: Error, context?: ErrorContext) {
    super(
      MCPErrorCode.InternalError,
      `Internal error during ${operation}`,
      context
    );

    if (cause) {
      this.cause = cause;
    }
  }
}

export class ErrorFactory {
  static validation(
    field: string,
    value: unknown,
    expected: string,
    context?: ErrorContext
  ): ValidationError {
    return new ValidationError(field, value, expected, context);
  }

  static fileSystem(
    operation: string,
    path: string,
    cause?: Error,
    context?: ErrorContext
  ): FileSystemError {
    return new FileSystemError(operation, path, cause, context);
  }

  static swarmGeneration(
    tool: string,
    operation: string,
    details: string,
    context?: ErrorContext
  ): SwarmGenerationError {
    return new SwarmGenerationError(tool, operation, details, context);
  }

  static configuration(
    setting: string,
    value: unknown,
    expected: string,
    context?: ErrorContext
  ): ConfigurationError {
    return new ConfigurationError(setting, value, expected, context);
  }

  static resourceNotFound(
    resourceType: string,
    identifier: string,
    context?: ErrorContext
  ): ResourceNotFoundError {
    return new ResourceNotFoundError(resourceType, identifier, context);
  }

  static permissionDenied(
    operation: string,
    resource: string,
    reason?: string,
    context?: ErrorContext
  ): PermissionDeniedError {
    return new PermissionDeniedError(operation, resource, reason, context);
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

export function normalizeToMCPError(error: unknown): MCPProtocolError {
  if (error instanceof MCPProtocolError) {
    return error;
  }

  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new MCPProtocolError(MCPErrorCode.InternalError, error.message, {
      originalError: error.name,
      stack: error.stack,
    });
  }

  return new MCPProtocolError(
    MCPErrorCode.InternalError,
    `Unknown error: ${String(error)}`
  );
}

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
