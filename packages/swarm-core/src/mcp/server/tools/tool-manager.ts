import { SwarmGenerator } from '../../../interfaces/generator';
import { GeneratorInterfaceManager } from '../../../interfaces/generator-interface-manager';
import { MCPToolDefinition, MCPToolHandler, ToolFactory } from './tool-factory';

/**
 * MCP Tool interface combining definition and handler
 */
interface MCPTool {
  definition: MCPToolDefinition;
  handler: MCPToolHandler;
}

/**
 * Manages MCP tools created from generators
 * Provides a unified interface for tool registration and management
 */
export class ToolManager extends GeneratorInterfaceManager<MCPTool> {
  /**
   * Create an MCP tool from a generator
   */
  protected async createInterfaceFromGenerator(
    generator: SwarmGenerator
  ): Promise<MCPTool> {
    return ToolFactory.createTool(generator);
  }

  /**
   * Get tool definitions for MCP server registration
   */
  getToolDefinitions(): Record<string, MCPToolDefinition> {
    const tools = this.getInterfaces();
    const definitions: Record<string, MCPToolDefinition> = {};

    for (const [name, tool] of Object.entries(tools)) {
      definitions[name] = tool.definition;
    }

    return definitions;
  }

  /**
   * Get tool handlers for MCP server execution
   */
  getToolHandlers(): Record<string, MCPToolHandler> {
    const tools = this.getInterfaces();
    const handlers: Record<string, MCPToolHandler> = {};

    for (const [name, tool] of Object.entries(tools)) {
      handlers[name] = tool.handler;
    }

    return handlers;
  }

  /**
   * Get all available tools as a single object for MCP server
   * This is a convenience method that combines definitions and handlers
   */
  async getTools(
    configPath?: string
  ): Promise<Record<string, (args: any) => Promise<any>>> {
    await this.initialize(configPath);
    return this.getToolHandlers();
  }

  /**
   * Get tool information for debugging or introspection
   */
  getToolInfo(): Array<{ name: string; description: string }> {
    const tools = this.getInterfaces();
    return Object.entries(tools).map(([name, tool]) => ({
      name,
      description: tool.definition.description,
    }));
  }
}
