// MCP and Swarm type definitions
export * from './mcp.js';
export * from './swarm.js';

// Common types
export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface SwarmCLIResult {
  success: boolean;
  output: string;
  error?: string;
}
