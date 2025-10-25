/**
 * MCP Server for Swarm
 *
 * Model Context Protocol server for Swarm CLI integration
 */

// Export MCP server functionality
export * from './server/index';

// Export MCP CLI functionality
export * from './cli/index';

// Import the server class
import { MCPManager } from './server/index';

/**
 * Start the MCP server
 */
export async function startMCPServer(): Promise<void> {
  const server = new MCPManager({
    name: 'swarm-mcp',
    version: '0.1.0',
    tools: [],
    capabilities: {
      tools: {},
      resources: {},
    },
    instructions: 'Swarm MCP Server for Wasp development tools',
  });

  await server.start();
}
