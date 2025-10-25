import { describe, expect, it } from 'vitest';
import { AppError } from './app-error.js';
import { ConfigurationError } from './configuration-error.js';
import { ErrorFactory } from './error-factory.js';
import { createErrorContext } from './errors.js';
import { InternalError } from './internal-error.js';
import { MCPErrorCode, MCPProtocolError } from './mcp-protocol-error.js';

describe('Error Handling Framework', () => {
  describe('AppError', () => {
    it('should create an AppError with context', () => {
      const context = createErrorContext('test-tool', 'test-operation');
      const error = new ConfigurationError('field', 'value', 'string', context);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(MCPProtocolError);
      expect(error.code).toBe(MCPErrorCode.ValidationError);
      expect(error.message).toContain('Configuration error');
      expect(error.name).toBe('ConfigurationError');
    });
  });

  describe('ConfigurationError', () => {
    it('should create a configuration error', () => {
      const error = new ConfigurationError('name', '123', 'string');

      expect(error).toBeInstanceOf(ConfigurationError);
      expect(error.code).toBe(MCPErrorCode.ValidationError);
      expect(error.message).toContain('Configuration error');
    });
  });

  describe('InternalError', () => {
    it('should create an internal error', () => {
      const cause = new Error('Database connection failed');
      const error = new InternalError('database operation', cause);

      expect(error).toBeInstanceOf(InternalError);
      expect(error.code).toBe(MCPErrorCode.InternalError);
      expect(error.message).toContain('Internal error during');
    });
  });

  describe('ErrorFactory', () => {
    it('should create configuration errors', () => {
      const error = ErrorFactory.configuration('port', 'abc', 'number');

      expect(error).toBeInstanceOf(ConfigurationError);
      expect(error.code).toBe(MCPErrorCode.ValidationError);
    });

    it('should create internal errors', () => {
      const cause = new Error('Database connection failed');
      const error = ErrorFactory.internal('database operation', cause);

      expect(error).toBeInstanceOf(InternalError);
      expect(error.code).toBe(MCPErrorCode.InternalError);
    });

    it('should create MCP protocol errors', () => {
      const error = ErrorFactory.mcp(
        MCPErrorCode.InvalidRequest,
        'Invalid request'
      );

      expect(error).toBeInstanceOf(MCPProtocolError);
      expect(error.code).toBe(MCPErrorCode.InvalidRequest);
      expect(error.message).toBe('Invalid request');
    });
  });

  describe('createErrorContext', () => {
    it('should create error context with all fields', () => {
      const context = createErrorContext('test-tool', 'test-operation', {
        param: 'value',
      });

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
