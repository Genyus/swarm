import { z } from 'zod/v4';

type RequestId = string | number;

interface BaseMessage {
  jsonrpc: '2.0';
  id?: RequestId;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: MCPError;
}

interface MCPError {
  code: number;
  message: string;
  data?: unknown;
}

export interface MCPRequest extends BaseMessage {
  id: RequestId;
  method: string;
  params?: unknown;
}

export interface MCPResponse extends BaseMessage {
  id: RequestId;
  result?: unknown;
  error?: MCPError;
}

export interface MCPNotification extends BaseMessage {
  method: string;
  params?: unknown;
}

export const MCPRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]),
  method: z.string(),
  params: z.unknown().optional(),
});

export const MCPResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]),
  result: z.unknown().optional(),
  error: z
    .object({
      code: z.number(),
      message: z.string(),
      data: z.unknown().optional(),
    })
    .optional(),
});

export const MCPNotificationSchema = z.object({
  jsonrpc: z.literal('2.0'),
  method: z.string(),
  params: z.unknown().optional(),
});

type JSONRPCMessage = MCPRequest | MCPResponse | MCPNotification;

export function isRequest(message: JSONRPCMessage): message is MCPRequest {
  return 'id' in message && 'method' in message;
}

export function isResponse(message: JSONRPCMessage): message is MCPResponse {
  return 'id' in message && ('result' in message || 'error' in message);
}

export function isNotification(
  message: JSONRPCMessage
): message is MCPNotification {
  return 'method' in message && !('id' in message);
}

export function isErrorResponse(
  message: JSONRPCMessage
): message is MCPResponse {
  return isResponse(message) && 'error' in message;
}
