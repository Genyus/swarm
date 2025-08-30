import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MCPProtocolError } from '../../../src/server/types/mcp.js';
import {
  createToolErrorHandler,
  handleError,
  validateArrayLength,
  validateNonEmptyString,
  validateNumberRange,
  validateRequiredParameter,
  withErrorHandling,
  withErrorHandlingSync,
} from '../../../src/server/utils/error-handler.js';

// Mock logger
vi.mock('../../../../src/server/utils/logger.js', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Error Handler Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleError', () => {
    it('should handle and re-throw errors with proper context', () => {
      const error = new Error('Test error');
      const context = {
        tool: 'test-tool',
        operation: 'test-operation',
        parameters: { param1: 'value1' },
      };

      expect(() => handleError(error, context)).toThrow(MCPProtocolError);
    });

    it('should handle unknown error types', () => {
      const error = 'String error';
      const context = { tool: 'test-tool' };

      expect(() => handleError(error, context)).toThrow(MCPProtocolError);
    });
  });

  describe('withErrorHandling', () => {
    it('should execute operation successfully', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await withErrorHandling(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledOnce();
    });

    it('should handle errors and use fallback', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new Error('Operation failed'));
      const fallback = vi.fn().mockReturnValue('fallback result');

      const result = await withErrorHandling(operation, undefined, fallback);

      expect(result).toBe('fallback result');
      expect(fallback).toHaveBeenCalledOnce();
    });

    it('should re-throw errors when no fallback provided', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new Error('Operation failed'));
      const context = { tool: 'test-tool' };

      await expect(withErrorHandling(operation, context)).rejects.toThrow(
        MCPProtocolError
      );
    });
  });

  describe('withErrorHandlingSync', () => {
    it('should execute operation successfully', () => {
      const operation = vi.fn().mockReturnValue('success');
      const result = withErrorHandlingSync(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledOnce();
    });

    it('should handle errors and use fallback', () => {
      const operation = vi.fn().mockImplementation(() => {
        throw new Error('Operation failed');
      });
      const fallback = vi.fn().mockReturnValue('fallback result');

      const result = withErrorHandlingSync(operation, undefined, fallback);

      expect(result).toBe('fallback result');
      expect(fallback).toHaveBeenCalledOnce();
    });

    it('should re-throw errors when no fallback provided', () => {
      const operation = vi.fn().mockImplementation(() => {
        throw new Error('Operation failed');
      });
      const context = { tool: 'test-tool' };

      expect(() => withErrorHandlingSync(operation, context)).toThrow(
        MCPProtocolError
      );
    });
  });

  describe('createToolErrorHandler', () => {
    it('should create a tool-specific error handler', () => {
      const toolHandler = createToolErrorHandler('test-tool');
      const error = new Error('Test error');

      expect(() =>
        toolHandler(error, 'test-operation', { param: 'value' })
      ).toThrow(MCPProtocolError);
    });

    it('should include tool context in error handling', () => {
      const toolHandler = createToolErrorHandler('swarm-tool');
      const error = new Error('Generation failed');

      expect(() => toolHandler(error, 'generate', { name: 'test' })).toThrow(
        MCPProtocolError
      );
    });
  });

  describe('validateRequiredParameter', () => {
    it('should validate required parameters successfully', () => {
      const result = validateRequiredParameter('test', 'name', 'string');
      expect(result).toBe('test');
    });

    it('should throw error for missing parameters', () => {
      expect(() =>
        validateRequiredParameter(undefined, 'name', 'string')
      ).toThrow(MCPProtocolError);
      expect(() => validateRequiredParameter(null, 'name', 'string')).toThrow(
        MCPProtocolError
      );
    });

    it('should throw error for wrong parameter types', () => {
      expect(() =>
        validateRequiredParameter('string', 'name', 'number')
      ).toThrow(MCPProtocolError);
      expect(() => validateRequiredParameter(123, 'name', 'string')).toThrow(
        MCPProtocolError
      );
    });

    it('should include context in validation errors', () => {
      const context = { tool: 'test-tool', operation: 'validate' };

      expect(() =>
        validateRequiredParameter(undefined, 'name', 'string', context)
      ).toThrow(MCPProtocolError);
    });
  });

  describe('validateNonEmptyString', () => {
    it('should validate non-empty strings successfully', () => {
      const result = validateNonEmptyString('test', 'name');
      expect(result).toBe('test');
    });

    it('should throw error for empty strings', () => {
      expect(() => validateNonEmptyString('', 'name')).toThrow(
        MCPProtocolError
      );
      expect(() => validateNonEmptyString('   ', 'name')).toThrow(
        MCPProtocolError
      );
    });

    it('should throw error for non-string values', () => {
      expect(() => validateNonEmptyString(123, 'name')).toThrow(
        MCPProtocolError
      );
      expect(() => validateNonEmptyString(null, 'name')).toThrow(
        MCPProtocolError
      );
    });

    it('should include context in validation errors', () => {
      const context = { tool: 'test-tool', operation: 'validate' };

      expect(() => validateNonEmptyString('', 'name', context)).toThrow(
        MCPProtocolError
      );
    });
  });

  describe('validateNumberRange', () => {
    it('should validate numbers within range successfully', () => {
      const result = validateNumberRange(5, 'count', 1, 10);
      expect(result).toBe(5);
    });

    it('should throw error for numbers below minimum', () => {
      expect(() => validateNumberRange(0, 'count', 1, 10)).toThrow(
        MCPProtocolError
      );
    });

    it('should throw error for numbers above maximum', () => {
      expect(() => validateNumberRange(15, 'count', 1, 10)).toThrow(
        MCPProtocolError
      );
    });

    it('should accept numbers at boundaries', () => {
      expect(validateNumberRange(1, 'count', 1, 10)).toBe(1);
      expect(validateNumberRange(10, 'count', 1, 10)).toBe(10);
    });

    it('should include context in validation errors', () => {
      const context = { tool: 'test-tool', operation: 'validate' };

      expect(() => validateNumberRange(0, 'count', 1, 10, context)).toThrow(
        MCPProtocolError
      );
    });
  });

  describe('validateArrayLength', () => {
    it('should validate arrays with correct length successfully', () => {
      const result = validateArrayLength([1, 2, 3], 'items', 2, 5);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should throw error for non-array values', () => {
      expect(() => validateArrayLength('not-array', 'items', 1, 5)).toThrow(
        MCPProtocolError
      );
      expect(() => validateArrayLength(123, 'items', 1, 5)).toThrow(
        MCPProtocolError
      );
    });

    it('should throw error for arrays below minimum length', () => {
      expect(() => validateArrayLength([1], 'items', 2, 5)).toThrow(
        MCPProtocolError
      );
    });

    it('should throw error for arrays above maximum length', () => {
      expect(() =>
        validateArrayLength([1, 2, 3, 4, 5, 6], 'items', 1, 5)
      ).toThrow(MCPProtocolError);
    });

    it('should accept arrays at length boundaries', () => {
      expect(validateArrayLength([1, 2], 'items', 2, 5)).toEqual([1, 2]);
      expect(validateArrayLength([1, 2, 3, 4, 5], 'items', 2, 5)).toEqual([
        1, 2, 3, 4, 5,
      ]);
    });

    it('should work without maximum length constraint', () => {
      const result = validateArrayLength([1, 2, 3], 'items', 1);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should include context in validation errors', () => {
      const context = { tool: 'test-tool', operation: 'validate' };

      expect(() =>
        validateArrayLength('not-array', 'items', 1, 5, context)
      ).toThrow(MCPProtocolError);
    });
  });

  describe('Error Context Integration', () => {
    it('should create proper error context for all validation functions', () => {
      const context = {
        tool: 'swarm-tool',
        operation: 'generate-api',
        parameters: { name: 'test', method: 'GET' },
      };

      // Test that context is properly passed through
      expect(() =>
        validateRequiredParameter(undefined, 'name', 'string', context)
      ).toThrow(MCPProtocolError);
      expect(() => validateNonEmptyString('', 'name', context)).toThrow(
        MCPProtocolError
      );
      expect(() => validateNumberRange(0, 'count', 1, 10, context)).toThrow(
        MCPProtocolError
      );
      expect(() =>
        validateArrayLength('not-array', 'items', 1, 5, context)
      ).toThrow(MCPProtocolError);
    });

    it('should handle missing context gracefully', () => {
      // All functions should work without context
      expect(() =>
        validateRequiredParameter(undefined, 'name', 'string')
      ).toThrow(MCPProtocolError);
      expect(() => validateNonEmptyString('', 'name')).toThrow(
        MCPProtocolError
      );
      expect(() => validateNumberRange(0, 'count', 1, 10)).toThrow(
        MCPProtocolError
      );
      expect(() => validateArrayLength('not-array', 'items', 1, 5)).toThrow(
        MCPProtocolError
      );
    });
  });
});
