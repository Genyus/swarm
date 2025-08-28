import { describe, expect, it } from 'vitest';
import {
    isErrorResponse,
    isNotification,
    isRequest,
    isResponse,
    MCPErrorCode,
    MCPNotification,
    MCPNotificationSchema,
    MCPProtocolError,
    MCPRequest,
    MCPRequestSchema,
    MCPResponse,
    MCPResponseSchema,
} from '../../src/server/types/mcp.js';

describe('MCP Protocol Types', () => {
  describe('Type Guards', () => {
    it('should correctly identify MCP requests', () => {
      const request: MCPRequest = {
        jsonrpc: '2.0',
        id: '1',
        method: 'tools/call',
        params: { name: 'test', arguments: {} },
      };

      expect(isRequest(request)).toBe(true);
      expect(isResponse(request)).toBe(false);
      expect(isNotification(request)).toBe(false);
    });

    it('should correctly identify MCP responses', () => {
      const response: MCPResponse = {
        jsonrpc: '2.0',
        id: '1',
        result: { success: true },
      };

      expect(isRequest(response)).toBe(false);
      expect(isResponse(response)).toBe(true);
      expect(isNotification(response)).toBe(false);
    });

    it('should correctly identify MCP notifications', () => {
      const notification: MCPNotification = {
        jsonrpc: '2.0',
        method: 'tools/list_changed',
      };

      expect(isRequest(notification)).toBe(false);
      expect(isResponse(notification)).toBe(false);
      expect(isNotification(notification)).toBe(true);
    });

    it('should correctly identify error responses', () => {
      const errorResponse: MCPResponse = {
        jsonrpc: '2.0',
        id: '1',
        error: {
          code: MCPErrorCode.MethodNotFound,
          message: 'Method not found',
        },
      };

      expect(isErrorResponse(errorResponse)).toBe(true);
      
      // Test with a response that has no error
      const successResponse: MCPResponse = {
        jsonrpc: '2.0',
        id: '1',
        result: { success: true },
      };
      expect(isErrorResponse(successResponse)).toBe(false);
    });
  });

  describe('Zod Schemas', () => {
    it('should validate valid MCP requests', () => {
      const validRequest = {
        jsonrpc: '2.0' as const,
        id: '1',
        method: 'tools/call',
        params: { name: 'test' },
      };

      const result = MCPRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject invalid MCP requests', () => {
      const invalidRequest = {
        jsonrpc: '1.0', // Invalid version
        id: '1',
        method: 'tools/call',
      };

      const result = MCPRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should validate valid MCP responses', () => {
      const validResponse = {
        jsonrpc: '2.0' as const,
        id: '1',
        result: { success: true },
      };

      const result = MCPResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate valid MCP notifications', () => {
      const validNotification = {
        jsonrpc: '2.0' as const,
        method: 'tools/list_changed',
      };

      const result = MCPNotificationSchema.safeParse(validNotification);
      expect(result.success).toBe(true);
    });
  });

  describe('MCPProtocolError', () => {
    it('should create error with correct properties', () => {
      const error = new MCPProtocolError(
        MCPErrorCode.MethodNotFound,
        'Method not found',
        { method: 'unknown' }
      );

      expect(error.code).toBe(MCPErrorCode.MethodNotFound);
      expect(error.message).toBe('Method not found');
      expect(error.data).toEqual({ method: 'unknown' });
      expect(error.name).toBe('MCPProtocolError');
    });

    it('should convert to MCP error format', () => {
      const error = new MCPProtocolError(
        MCPErrorCode.InvalidParams,
        'Invalid parameters'
      );

      const mcpError = error.toMCPError();
      expect(mcpError.code).toBe(MCPErrorCode.InvalidParams);
      expect(mcpError.message).toBe('Invalid parameters');
      expect(mcpError.data).toBeUndefined();
    });
  });

  describe('Error Codes', () => {
    it('should have correct standard JSON-RPC error codes', () => {
      expect(MCPErrorCode.ParseError).toBe(-32700);
      expect(MCPErrorCode.InvalidRequest).toBe(-32600);
      expect(MCPErrorCode.MethodNotFound).toBe(-32601);
      expect(MCPErrorCode.InvalidParams).toBe(-32602);
      expect(MCPErrorCode.InternalError).toBe(-32603);
    });

    it('should have correct MCP-specific error codes', () => {
      expect(MCPErrorCode.ResourceNotFound).toBe(-1001);
      expect(MCPErrorCode.ResourceAlreadyExists).toBe(-1002);
      expect(MCPErrorCode.InvalidToolCall).toBe(-1003);
      expect(MCPErrorCode.ToolNotFound).toBe(-1004);
      expect(MCPErrorCode.PermissionDenied).toBe(-1005);
      expect(MCPErrorCode.ValidationError).toBe(-1006);
    });
  });
});
