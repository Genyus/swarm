export interface MCPServerConfig {
  name: string;
  version: string;
  capabilities?: {
    tools?: {
      listChanged?: boolean;
    };
    prompts?: {
      listChanged?: boolean;
    };
    resources?: {
      listChanged?: boolean;
      subscribe?: boolean;
    };
    logging?: {
      level?: 'debug' | 'info' | 'warn' | 'error';
    };
  };
  instructions?: string;
  tools: Array<{
    name: string;
    description: string;
    inputSchema: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
      additionalProperties?: boolean;
    };
  }>;
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
}

export interface MCPServerState {
  isRunning: boolean;
  transport?: any;
  clientCapabilities?: any;
  clientVersion?: any;
  sessionId?: string | undefined;
}

export interface MCPServerInfo {
  name: string;
  version: string;
  capabilities?: any;
  instructions?: string | undefined;
  status: MCPServerState;
}
