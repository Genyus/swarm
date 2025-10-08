import { ToolManager } from './tool-manager';

// Create singleton instance
const toolManager = new ToolManager();

export * from './dynamic-tools.js';
export * from './tool-manager.js';
export { toolManager };

/**
 * Get dynamic tools built from enabled generators
 * This is the recommended way to get MCP tools
 */
export async function getDynamicTools(
  configPath?: string
): Promise<Record<string, (args: any) => Promise<any>>> {
  return await toolManager.getTools(configPath);
}

/**
 * Get tool definitions for MCP server registration
 */
export async function getToolDefinitions(
  configPath?: string
): Promise<Record<string, any>> {
  await toolManager.initialize(configPath);
  return toolManager.getToolDefinitions();
}

/**
 * Get tool handlers for MCP server execution
 */
export async function getToolHandlers(
  configPath?: string
): Promise<Record<string, (args: any) => Promise<any>>> {
  await toolManager.initialize(configPath);
  return toolManager.getToolHandlers();
}

// Export tool manager as the default
export const tools = getDynamicTools;
