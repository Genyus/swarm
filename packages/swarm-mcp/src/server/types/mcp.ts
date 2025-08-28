import type { Readable, Writable } from 'node:stream';
import { z } from 'zod';

export type RequestId = string | number;

export interface BaseMessage {
  jsonrpc: '2.0';
  id?: RequestId;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: MCPError;
}

export interface MCPError {
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

export interface ServerImplementation {
  name: string;
  version: string;
}

export interface ServerCapabilities {
  tools?: ToolCapabilities;
  prompts?: PromptCapabilities;
  resources?: ResourceCapabilities;
  logging?: LoggingCapabilities;
}

export interface ToolCapabilities {
  listChanged?: boolean;
}

export interface PromptCapabilities {
  listChanged?: boolean;
}

export interface ResourceCapabilities {
  listChanged?: boolean;
  subscribe?: boolean;
}

export interface LoggingCapabilities {
  level?: 'debug' | 'info' | 'warn' | 'error';
}

export interface ClientCapabilities {
  tools?: ToolCapabilities;
  prompts?: PromptCapabilities;
  resources?: ResourceCapabilities;
  logging?: LoggingCapabilities;
}

export interface ClientImplementation {
  name: string;
  version: string;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
}

export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, ToolProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface ToolProperty {
  type: string;
  description?: string;
  enum?: string[];
  items?: ToolProperty;
  additionalProperties?: boolean;
  [key: string]: unknown;
}

export interface ToolCallRequest extends MCPRequest {
  method: 'tools/call';
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface ToolCallResult {
  content: ToolCallContent[];
  isError?: boolean;
}

export interface ToolCallContent {
  type: 'text' | 'image' | 'audio';
  text?: string;
  data?: string;
  mimeType?: string;
}

export interface ReadFileParams {
  uri: string;
}

export interface ReadFileResult {
  contents: string;
  mimeType: string;
}

export interface WriteFileParams {
  uri: string;
  contents: string;
  mimeType?: string;
  backup?: boolean;
  dryRun?: boolean;
  rollbackToken?: string;
}

export interface WriteFileResult {
  success: boolean;
  backupPath?: string | undefined;
  rollbackToken?: string | undefined;
  dryRun?:
    | {
        wouldOverwrite: boolean;
        backupWouldBeCreated: boolean;
        targetPath: string;
      }
    | undefined;
}

export interface ListDirectoryParams {
  uri: string;
  recursive?: boolean;
  maxDepth?: number;
  includeSize?: boolean;
  includePermissions?: boolean;
  sortBy?: 'name' | 'size' | 'type' | 'modified';
  sortOrder?: 'asc' | 'desc';
  filter?: {
    namePattern?: string;
    extensions?: string[];
    minSize?: number;
    maxSize?: number;
    type?: 'file' | 'directory';
  };
  pagination?: {
    offset?: number;
    limit?: number;
  };
}

export interface ListDirectoryResult {
  entries: DirectoryEntry[];
  totalCount?: number | undefined;
  hasMore?: boolean | undefined;
  pagination?:
    | {
        offset: number;
        limit: number;
        total: number;
      }
    | undefined;
}

export interface DirectoryEntry {
  uri: string;
  name: string;
  type: 'file' | 'directory';
  mimeType?: string | undefined;
  size?: number | undefined;
  permissions?: string | undefined;
  modified?: string | undefined;
  children?: DirectoryEntry[] | undefined;
}

export interface DeleteFileParams {
  uri: string;
  backup?: boolean;
  dryRun?: boolean;
  rollbackToken?: string;
}

export interface DeleteFileResult {
  success: boolean;
  backupPath?: string | undefined;
  rollbackToken?: string | undefined;
  dryRun?:
    | {
        wouldDelete: boolean;
        backupWouldBeCreated: boolean;
        targetPath: string;
        fileSize?: number;
      }
    | undefined;
}

export interface RollbackParams {
  rollbackToken: string;
}

export interface RollbackResult {
  success: boolean;
  restoredFiles: string[];
}



export interface Transport {
  start(): Promise<void>;
  send(message: JSONRPCMessage): Promise<void>;
  close(): Promise<void>;
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;
  sessionId?: string;
}

export type JSONRPCMessage = MCPRequest | MCPResponse | MCPNotification;

export interface TransportOptions {
  stdio?: {
    stdin?: Readable;
    stdout?: Writable;
  };
  http?: {
    port?: number;
    host?: string;
    enableCORS?: boolean;
    allowedOrigins?: string[];
  };
  unixSocket?: {
    path: string;
    permissions?: number;
  };
}

export interface ServerConfig {
  name: string;
  version: string;
  capabilities?: ServerCapabilities;
  instructions?: string;
  transport: TransportOptions;
  tools: Tool[];
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
}

export interface ServerState {
  isRunning: boolean;
  transport?: Transport | undefined;
  clientCapabilities?: ClientCapabilities | undefined;
  clientVersion?: ClientImplementation | undefined;
  sessionId?: string | undefined;
}

export enum MCPErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,

  ResourceNotFound = -1001,
  ResourceAlreadyExists = -1002,
  InvalidToolCall = -1003,
  ToolNotFound = -1004,
  PermissionDenied = -1005,
  ValidationError = -1006,
}

export class MCPProtocolError extends Error {
  constructor(
    public code: MCPErrorCode,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'MCPProtocolError';
  }

  toMCPError(): MCPError {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
    };
  }
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
