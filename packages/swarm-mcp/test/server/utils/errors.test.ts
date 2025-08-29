import { describe, expect, it } from 'vitest';
import { MCPErrorCode, MCPProtocolError } from '../../../src/server/types/mcp.js';
import {
    AppError,
    ConfigurationError,
    createErrorContext,
    ErrorFactory,
    FileSystemError,
    InternalError,
    normalizeToMCPError,
    PermissionDeniedError,
    ResourceNotFoundError,
    SwarmGenerationError,
    ValidationError,
} from '../../../src/server/utils/errors.js';

describe('Error Handling Framework', () => {
  describe('AppError', () => {
    it('should create an AppError with context', () => {
      const context = createErrorContext('test-tool', 'test-operation');
      const error = new ValidationError('field', 'value', 'string', context);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(MCPProtocolError);
      expect(error.code).toBe(MCPErrorCode.ValidationError);
      expect(error.context).toBe(context);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error with proper message', () => {
      const error = new ValidationError('name', '123', 'string');

      expect(error.message).toBe('Invalid name: "123". Expected: string');
      expect(error.code).toBe(MCPErrorCode.ValidationError);
    });
  });

  describe('FileSystemError', () => {
    it('should create a file system error with cause', () => {
      const cause = new Error('Permission denied');
      const error = new FileSystemError('read', '/path/to/file', cause);

      expect(error.message).toBe('File system error during read: /path/to/file');
      expect(error.code).toBe(MCPErrorCode.PermissionDenied);
      expect(error.cause).toBe(cause);
    });
  });

  describe('SwarmGenerationError', () => {
    it('should create a Swarm generation error', () => {
      const error = new SwarmGenerationError('api', 'create', 'Invalid parameters');

      expect(error.message).toBe('Swarm generation failed: api create. Invalid parameters');
      expect(error.code).toBe(MCPErrorCode.InvalidToolCall);
    });
  });

  describe('ConfigurationError', () => {
    it('should create a configuration error', () => {
      const error = new ConfigurationError('port', 'abc', 'number');

      expect(error.message).toBe('Configuration error: port="abc". Expected: number');
      expect(error.code).toBe(MCPErrorCode.ValidationError);
    });
  });

  describe('ResourceNotFoundError', () => {
    it('should create a resource not found error', () => {
      const error = new ResourceNotFoundError('file', '/path/to/file');

      expect(error.message).toBe('file not found: /path/to/file');
      expect(error.code).toBe(MCPErrorCode.ResourceNotFound);
    });
  });

  describe('PermissionDeniedError', () => {
    it('should create a permission denied error without reason', () => {
      const error = new PermissionDeniedError('write', '/path/to/file');

      expect(error.message).toBe('Permission denied for write on /path/to/file');
      expect(error.code).toBe(MCPErrorCode.PermissionDenied);
    });

    it('should create a permission denied error with reason', () => {
      const error = new PermissionDeniedError('write', '/path/to/file', 'Insufficient privileges');

      expect(error.message).toBe('Permission denied for write on /path/to/file: Insufficient privileges');
      expect(error.code).toBe(MCPErrorCode.PermissionDenied);
    });
  });

  describe('InternalError', () => {
    it('should create an internal error with cause', () => {
      const cause = new Error('Database connection failed');
      const error = new InternalError('database operation', cause);

      expect(error.message).toBe('Internal error during database operation');
      expect(error.code).toBe(MCPErrorCode.InternalError);
      expect(error.cause).toBe(cause);
    });
  });

  describe('ErrorFactory', () => {
    it('should create validation errors', () => {
      const error = ErrorFactory.validation('field', 'value', 'string');

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid field: "value". Expected: string');
    });

    it('should create file system errors', () => {
      const cause = new Error('Permission denied');
      const error = ErrorFactory.fileSystem('read', '/path/to/file', cause);

      expect(error).toBeInstanceOf(FileSystemError);
      expect(error.message).toBe('File system error during read: /path/to/file');
      expect(error.cause).toBe(cause);
    });

    it('should create Swarm generation errors', () => {
      const error = ErrorFactory.swarmGeneration('api', 'create', 'Invalid parameters');

      expect(error).toBeInstanceOf(SwarmGenerationError);
      expect(error.message).toBe('Swarm generation failed: api create. Invalid parameters');
    });

    it('should create configuration errors', () => {
      const error = ErrorFactory.configuration('port', 'abc', 'number');

      expect(error).toBeInstanceOf(ConfigurationError);
      expect(error.message).toBe('Configuration error: port="abc". Expected: number');
    });

    it('should create resource not found errors', () => {
      const error = ErrorFactory.resourceNotFound('file', '/path/to/file');

      expect(error).toBeInstanceOf(ResourceNotFoundError);
      expect(error.message).toBe('file not found: /path/to/file');
    });

    it('should create permission denied errors', () => {
      const error = ErrorFactory.permissionDenied('write', '/path/to/file', 'Insufficient privileges');

      expect(error).toBeInstanceOf(PermissionDeniedError);
      expect(error.message).toBe('Permission denied for write on /path/to/file: Insufficient privileges');
    });

    it('should create internal errors', () => {
      const cause = new Error('Database connection failed');
      const error = ErrorFactory.internal('database operation', cause);

      expect(error).toBeInstanceOf(InternalError);
      expect(error.message).toBe('Internal error during database operation');
      expect(error.cause).toBe(cause);
    });

    it('should create MCP protocol errors', () => {
      const error = ErrorFactory.mcp(MCPErrorCode.InvalidRequest, 'Invalid request');

      expect(error).toBeInstanceOf(MCPProtocolError);
      expect(error.code).toBe(MCPErrorCode.InvalidRequest);
      expect(error.message).toBe('Invalid request');
    });
  });

  describe('normalizeToMCPError', () => {
    it('should return MCPProtocolError as-is', () => {
      const originalError = new MCPProtocolError(MCPErrorCode.InvalidRequest, 'Invalid request');
      const normalized = normalizeToMCPError(originalError);

      expect(normalized).toBe(originalError);
    });

    it('should return AppError as-is', () => {
      const originalError = new ValidationError('field', 'value', 'string');
      const normalized = normalizeToMCPError(originalError);

      expect(normalized).toBe(originalError);
    });

    it('should convert generic Error to MCPProtocolError', () => {
      const originalError = new Error('Generic error');
      const normalized = normalizeToMCPError(originalError);

      expect(normalized).toBeInstanceOf(MCPProtocolError);
      expect(normalized.code).toBe(MCPErrorCode.InternalError);
      expect(normalized.message).toBe('Generic error');
    });

    it('should convert unknown errors to MCPProtocolError', () => {
      const normalized = normalizeToMCPError('String error');

      expect(normalized).toBeInstanceOf(MCPProtocolError);
      expect(normalized.code).toBe(MCPErrorCode.InternalError);
      expect(normalized.message).toBe('Unknown error: String error');
    });
  });

  describe('createErrorContext', () => {
    it('should create error context with all fields', () => {
      const context = createErrorContext('test-tool', 'test-operation', { param: 'value' });

      expect(context.tool).toBe('test-tool');
      expect(context.operation).toBe('test-operation');
      expect(context.parameters).toEqual({ param: 'value' });
      expect(context.timestamp).toBeInstanceOf(Date);
      expect(context.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('should create error context with minimal fields', () => {
      const context = createErrorContext();

      expect(context.tool).toBeUndefined();
      expect(context.operation).toBeUndefined();
      expect(context.parameters).toBeUndefined();
      expect(context.timestamp).toBeInstanceOf(Date);
      expect(context.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });
  });
});
