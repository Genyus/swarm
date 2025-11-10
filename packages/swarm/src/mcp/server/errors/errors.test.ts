import { describe, expect, it } from 'vitest';
import { AppError } from './app-error';
import { ConfigurationError } from './configuration-error';
import { createErrorContext } from './errors';
import { InternalError } from './internal-error';
import { MCPErrorCode, MCPProtocolError } from './mcp-protocol-error';

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
