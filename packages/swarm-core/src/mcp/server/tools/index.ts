import { dynamicMCPTools } from './dynamic-tools.js';

export * from './dynamic-tools.js';

/**
 * Get dynamic tools built from enabled generators
 * This is the recommended way to get MCP tools
 */
export async function getDynamicTools(
  configPath?: string
): Promise<Record<string, (args: any) => Promise<any>>> {
  return await dynamicMCPTools.getTools(configPath);
}

/**
 * Get tool definitions for MCP server registration
 */
export async function getToolDefinitions(
  configPath?: string
): Promise<Record<string, any>> {
  await dynamicMCPTools.initialize(configPath);
  return dynamicMCPTools.getToolDefinitions();
}

// Export dynamic tools as the default
export const tools = getDynamicTools;
