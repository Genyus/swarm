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

  toMCPError(): { code: number; message: string; data?: unknown } {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
    };
  }
}
