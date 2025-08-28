export * from './mcp.js';
export * from './swarm.js';
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
